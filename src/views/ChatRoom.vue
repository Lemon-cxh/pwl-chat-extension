<template>
  <div id="chatRoom">
    <!-- 活跃度，头像，输入框 -->
    <liveness />
    <el-row class="user-box">
      <user-info @sync-options="syncOptions" />
      <send ref="messageInput" />
    </el-row>
    <!-- 菜单按钮 -->
    <el-row class="menu-row">
      <online :online="online" @show-user-card="showUserCard" />
      <el-row class="menu">
        <red-packet class="menu-item" />
        <emoji class="menu-item" @add-content="addContent" />
        <images
          ref="cloudImages"
          class="menu-item"
          @send-message="sendMessage"
        />
      </el-row>
    </el-row>
    <!-- 消息列表 -->
    <div class="infinite-list-wrapper" style="overflow: auto; height: 420px">
      <el-backtop
        target=".infinite-list-wrapper"
        :bottom="20"
        :right="20"
        :visibility-height="100"
      ></el-backtop>
      <div
        id="messageList"
        class="list"
        v-infinite-scroll="load"
        :infinite-scroll-disabled="loading"
      >
        <div
          ref="inner"
          v-for="item in messageArray"
          v-bind:key="
            type.msg === item.type ? item.oId : item.oId + '_' + item.whoGot
          "
          class="infinite-list-item"
        >
          <hint-message
            v-if="item.type && type.redPacketStatus === item.type"
            :message="item"
            @show-user-card="showUserCard"
            @show-redpacket-info="showRedpacketInfo"
          />
          <div v-else-if="!item.type || type.msg === item.type">
            <hint-message v-if="item.revoke" :message="item" />
            <message
              :ref="'message_' + item.oId"
              :message="item"
              :date="date"
              :unlimitedRevoke="unlimitedRevoke"
              :avatarPendant="avatarPendant"
              @revoke-message="revokeMessage"
              @show-user-card="showUserCard"
              @collect-images="collectImages"
              @add-content="addContent"
              @send-message="sendMessage"
              @quote="quote"
              @show-redpacket-info="showRedpacketInfo"
            />
          </div>
        </div>
        <div class="icon-box">
          <icon-svg icon-class="loading" class="loading" v-if="loading" />
        </div>
      </div>
    </div>
    <user-card
      :userInfo="userCardInfo"
      :dialogVisible="dialogVisible"
      @close-dialog="dialogVisible = false"
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
import { ref } from 'vue'
import { EVENT, MESSAGE_TYPE, TABS_EVENT } from '../constant/Constant'
import { getDate, isRedPacket } from '../utils/util'
import { sendTabsMessage } from '../utils/chromeUtil'
import { getUserInfo } from '../api/user'
import { mapGetters } from 'vuex'
import { revoke } from '../api/chat'

let port

export default {
  name: 'chatRoom',
  data() {
    return {
      loading: true,
      date: getDate(),
      dialogVisible: false,
      userCardInfo: {},
      redPacketInfo: {
        info: {},
      },
      online: {},
      redPacketVisible: false,
      type: MESSAGE_TYPE,
      avatarPendant: {},
    }
  },
  inject: ['$message'],
  computed: {
    ...mapGetters(['userInfo', 'key']),
    apiKey() {
      return { apiKey: this.key }
    },
    unlimitedRevoke() {
      return ['协警', 'OP', '管理员'].some((e) => e === this.userInfo.userRole)
    },
  },
  setup() {
    const messageArray = ref([])
    const unshiftMessage = (msg) => {
      messageArray.value.unshift(msg)
    }
    const pushMessage = (msg) => {
      let index = messageArray.value.length - 1
      let last = messageArray.value[index]
      let message = msg[0]
      if (!last || last.content !== message.content) {
        messageArray.value.push(...msg)
        return
      }
      messageArray.value[index] = message
      messageArray.value.push(...msg.slice(1))
    }
    const updateMessage = (index, property, value) => {
      messageArray.value[index][property] = value
    }
    return {
      messageArray,
      unshiftMessage,
      pushMessage,
      updateMessage,
    }
  },
  created() {
    let that = this
    port = chrome.runtime.connect({name:'pwl-chat'})
    port.postMessage({ type: EVENT.syncUserInfo, data: that.userInfo })
    port.onMessage.addListener((msg) => that.messageListener(msg))
    port.onDisconnect.addListener(function () {
      alert('断开连接')
      port.disconnect()
      port = chrome.runtime.connect({name:'pwl-chat'})
      port.onMessage.addListener((msg) => that.messageListener(msg))
    })
    this.avatarPendant.isChristmas =
      this.date.endsWith('12-24') || this.date.endsWith('12-25')
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
    messageListener(msg) {
      switch (msg.type) {
        case EVENT.loadMessage:
          this.pushMessage(msg.data.message)
          this.online = msg.data.online
          if (msg.data.length === 0) {
            this.load()
          } else {
            this.loading = false
          }
          break
        case EVENT.message:
          this.messageEvent(msg.data)
          break
        case EVENT.more:
          this.pushMessage(msg.data)
          this.loading = false
          break
        case EVENT.redPacketStatus:
          this.updateRedPacket(msg.data)
          break
        case EVENT.revoke:
          this.revoke(msg.data)
          break
        case EVENT.online:
          this.online = msg.data
          break
        default:
          break
      }
    },
    messageEvent(message) {
      if (message.type !== this.type.msg) {
        this.unshiftMessage(message)
        return
      }
      let last = this.messageArray[0]
      if (!last || !last.md) {
        return
      }
      if (message.md !== last.md || isRedPacket(message)) {
        this.unshiftMessage(message)
        return
      }
      let users = last.users ? last.users : []
      users.unshift({
        userName: message.userName,
        userAvatarURL: message.userAvatarURL,
      })
      this.updateMessage(0, 'users', users)
    },
    load() {
      this.loading = true
      setTimeout(() => {
        this.more()
      }, 300)
    },
    more() {
      port.postMessage({ type: EVENT.getMore })
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
      sendTabsMessage({
        type: TABS_EVENT.showImage,
        data: {
          src: dom.src,
          width: dom.naturalWidth,
          height: dom.naturalHeight,
        },
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
        dom.href = decodeURIComponent(href)
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
    updateRedPacket(oId) {
      let msg
      this.messageArray.some((e, index) => {
        if (e.oId == oId && e.type === MESSAGE_TYPE.msg) {
          msg = JSON.parse(e.content)
          if (msg.got >= msg.count) {
            return true
          }
          msg.got += 1
          this.updateMessage(index, 'content', JSON.stringify(msg))
          return true
        }
        return false
      })
    },
    revoke(oId) {
      this.messageArray.some((e, index) => {
        if (e.oId == oId && e.type === MESSAGE_TYPE.msg) {
          this.updateMessage(index, 'revoke', true)
          return true
        }
        return false
      })
    },
    revokeMessage(message) {
      if (message.oIds) {
        message.oIds.push(message.oId)
        let count = 0
        message.oIds.forEach((oId) => {
          revoke(oId).then((res) => (count += res.code === 0 ? 1 : 0))
        })
        this.$message.success('批量撤回' + count + '条消息')
        return
      }
      revoke(message.oId).then((res) => {
        0 === res.code
          ? this.$message.success(res.msg)
          : this.$message.info(res.msg)
      })
    },
    showRedpacketInfo(info) {
      this.redPacketVisible = true
      this.redPacketInfo = info
      if (info.info.got >= info.info.count) {
        return
      }
      let msg
      this.messageArray.some((e, index) => {
        if (e.oId == info.oId && (!e.type || e.type === MESSAGE_TYPE.msg)) {
          msg = JSON.parse(e.content)
          msg.got = msg.count
          this.updateMessage(index, 'content', JSON.stringify(msg))
          return true
        }
        return false
      })
      port.postMessage({ type: EVENT.markRedPacket, data: info.oId })
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
    syncOptions(options) {
      port.postMessage({ type: EVENT.syncOptions, data: options })
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
.loading {
  animation: rotate 1s linear infinite;
  font-size: 24px;
  color: white;
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
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
<style>
.el-backtop,
.el-backtop:hover {
  background-color: #565656;
}
</style>
