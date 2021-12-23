<template>
  <div id="chatRoom">
    <!-- 活跃度，头像，输入框 -->
    <liveness />
    <el-row type="flex" class="user-box">
      <user-info />
      <send ref="messageInput" />
    </el-row>
    <!-- 菜单按钮 -->
    <el-row type="flex" class="menu-row">
      <online :online="online" @showUserCard="showUserCard" />
      <el-row type="flex" class="menu">
        <red-packet class="menu-item" />
        <emoji class="menu-item" @addContent="addContent" />
        <images
          ref="cloudImages"
          class="menu-item"
          @sendMessage="sendMessage"
        />
      </el-row>
    </el-row>
    <!-- 消息列表 -->
    <div class="infinite-list-wrapper" style="overflow: auto; height: 420px">
      <el-backtop target=".infinite-list-wrapper" :bottom="20" :right="20" :visibility-height="100"></el-backtop>
      <div
        id="messageList"
        class="list"
        v-infinite-scroll="load"
        :infinite-scroll-disabled="loading"
      >
        <div
          ref="inner"
          v-for="(item, index) in message"
          v-bind:key="index"
          class="infinite-list-item"
        >
          <hint-message
            v-if="item.type && type.redPacketStatus === item.type"
            :message="item"
            @showUserCard="showUserCard"
            @showRedpacketInfo="showRedpacketInfo"
          />
          <div v-else-if="!item.type || type.msg === item.type">
            <hint-message v-if="item.revoke" :message="item" />
            <message
              :ref="'message_' + item.oId"
              :message="item"
              :date="date"
              :unlimitedRevoke="unlimitedRevoke"
              @revokeMessage="revokeMessage"
              @showUserCard="showUserCard"
              @collectImages="collectImages"
              @addContent="addContent"
              @sendMessage="sendMessage"
              @quote="quote"
              @showRedpacketInfo="showRedpacketInfo"
            />
          </div>
        </div>
        <div class="icon-box">
          <i class="el-icon-loading icon" v-if="loading"></i>
        </div>
      </div>
    </div>
    <user-card
      :userInfo="userCardInfo"
      :dialogVisible="dialogVisible"
      @closeDialog="dialogVisible = false"
    />
    <red-packet-info
      :userInfo="userInfo"
      :info="redPacketInfo"
      :dialogVisible="redPacketVisible"
      @close="redPacketVisible = false"
    ></red-packet-info>
  </div>
</template>

<script>
import Message from '../components/Message.vue'
import Liveness from '../components/Liveness.vue'
import UserInfo from '../components/UserInfo.vue'
import Online from '../components/Online.vue'
import Send from '../components/Send.vue'
import UserCard from '../components/UserCard.vue'
import HintMessage from '../components/HintMessage.vue'
import RedPacket from '../components/RedPacket.vue'
import RedPacketInfo from '../components/RedPacketInfo.vue'
import Emoji from '../components/Emoji.vue'
import Images from '../components/Images.vue'
import { EVENT, MESSAGE_TYPE } from '../constant/Constant'
import { getDate, isRedPacket } from '../utils/util'
import { getUserInfo } from '../api/user'
import { mapGetters } from 'vuex'
import { revoke } from '../api/chat'

export default {
  name: 'chatRoom',
  data() {
    return {
      port: null,
      loading: true,
      message: [],
      date: getDate(),
      dialogVisible: false,
      userCardInfo: {},
      redPacketInfo: {
        info: {},
      },
      online: {},
      redPacketVisible: false,
      type: MESSAGE_TYPE,
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'key']),
    apiKey() {
      return { apiKey: this.key }
    },
    unlimitedRevoke() {
      return ['协警', 'OP', '管理员'].some(e => e === this.userInfo.userRole)
    }
  },
  components: {
    Message,
    Liveness,
    UserInfo,
    Online,
    UserCard,
    HintMessage,
    RedPacket,
    RedPacketInfo,
    Emoji,
    Images,
    Send,
  },
  created() {
    let that = this
    let port = chrome.runtime.connect()
    port.postMessage({ type: EVENT.syncUserInfo, message: that.userInfo })
    port.onMessage.addListener(function (msg) {
      switch (msg.type) {
        case EVENT.loadMessage:
          that.message = msg.message.message
          that.online = msg.message.online
          if (msg.message.length === 0) {
            alert('消息为空')
            that.load()
          } else {
            that.loading = false
          }
          break
        case EVENT.message:
          that.addMessage(msg.message)
          break
        case EVENT.more:
          that.message = that.message.concat(msg.message)
          that.loading = false
          break
        case EVENT.redPacketStatus:
          that.markRedPacket(msg.message)
          break
        case EVENT.revoke:
          that.revoke(msg.message)
          break
        case EVENT.online:
          that.online = msg.message
          break
        default:
          break
      }
    })
    this.port = port
  },
  mounted() {
    document.getElementById('messageList').oncontextmenu = () => {
      this.showMessageMenu(event)
      return false
    }
    document
      .getElementById('messageList')
      .addEventListener('click', (event) => {
        let dom = event.target
        if (dom.tagName === 'IMG' && dom.className !== 'emoji') {
          this.showImage(dom, event)
        }
        if (dom.tagName === 'A') {
          this.clickA(dom)
        }
      })
  },
  methods: {
    addMessage(message) {
      if (message.type !== this.type.msg){
        this.message.unshift(message)
        return
      }
      let last = this.message[0]
      if (message.md !== last.md || isRedPacket(message)) {
        this.message.unshift(message)
        return
      }
      let users = last.users ? last.users : []
      users.unshift({userName: message.userName, userAvatarURL: message.userAvatarURL})
      this.$set(this.message[0], 'users', users)
    },
    load() {
      this.loading = true
      setTimeout(() => {
        this.more()
      }, 300)
    },
    more() {
      this.port.postMessage({ type: EVENT.getMore })
    },
    showMessageMenu(event) {
      let dom = event.path.find((e) => e.id && -1 !== e.id.indexOf('message_'))
      if (dom) {
        let isImage =
          event.path[0].nodeName === 'IMG' &&
          event.path[0].className !== 'emoji'
        this.$refs[dom.id][0].showMessageMenu(
          isImage ? event.path[0].currentSrc : ''
        )
      }
    },
    showImage(dom, event) {
      let message = event.path.find(
        (e) => e.id && -1 !== e.id.indexOf('message_')
      )
      if (!message) {
        return false
      }
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        let message = {
          src: dom.src,
          width: dom.naturalWidth,
          height: dom.naturalHeight,
        }
        chrome.tabs.sendMessage(tabs[0].id, message)
      })
    },
    clickA(dom) {
      if (dom.className === 'name-at') {
        this.showUserCard(dom.innerText)
      } else {
        let href = dom.href.replace(
          process.env.VUE_APP_BASE_URL + '/forward?goto=',
          ''
        )
        window.open(decodeURIComponent(href))
      }
    },
    showUserCard(name) {
      getUserInfo(name, this.apiKey).then((res) => {
        let userCardInfo = res
        if (userCardInfo.sysMetal) {
          userCardInfo.sysMetal = JSON.parse(userCardInfo.sysMetal)
        }
        this.userCardInfo = userCardInfo
        this.dialogVisible = true
      })
    },
    markRedPacket(oId) {
      let msg
      let that = this
      this.message.some((e, index) => {
        if (e.oId == oId && e.type === MESSAGE_TYPE.msg) {
          msg = JSON.parse(e.content)
          msg.got += 1
          that.$set(that.message[index], 'content', JSON.stringify(msg))
          return true
        }
        return false
      })
    },
    revoke(oId) {
      this.message.some((e, index) => {
        if (e.oId == oId && e.type === MESSAGE_TYPE.msg) {
          this.$set(this.message[index], 'revoke', true)
          return true
        }
        return false
      })
    },
    revokeMessage(message) {
      if (message.oIds) {
        message.oIds.push(message.oId)
        let count = 0
        message.oIds.forEach(oId => {
          revoke(oId).then(res => count += (res.code === 0 ? 1 : 0))
        });
        this.$message.success('批量撤回' + count + '条消息')
        return
      }
      revoke(message.oId).then(res => {
        0 === res.code ? this.$message.success(res.msg) : this.$message.info(res.msg)
      })
    },
    showRedpacketInfo(info) {
      this.redPacketVisible = true
      this.redPacketInfo = info
    },
    sendMessage(content) {
      this.$refs.messageInput.sendMessage(content)  
    },
    quote(quoteForm) {
      this.$refs.messageInput.quote(quoteForm)
    },
    addContent(content) {
      this.$refs.messageInput.addContent(content)
    },
    collectImages(url) {
      this.$refs.cloudImages.syncCloudImage(url)
    },
    closeRedapcket() {
      this.redPacketVisible = false
    },
  },
}
</script>
<style scoped>
.user-box {
  padding: 5px;
}
.icon-box {
  width: 100%;
  text-align: center;
}
.icon {
  color: white;
  font-size: 26px;
}
.menu-row {
  height: 30px;
  justify-content: space-between;
}
.menu {
  font-size: 24px;
  line-height: 24px;
  justify-content: flex-end;
  align-items: center;
}
.menu-item {
  margin: 0 3px;
}
</style>
<style>
.el-backtop, .el-backtop:hover {
  background-color: #565656;
}
</style>
