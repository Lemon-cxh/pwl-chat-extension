<template>
  <div id="chatRoom">
    <!-- 活跃度，头像，输入框 -->
    <el-row class="user-box">
      <user-info />
      <send ref="messageInput" />
    </el-row>
    <!-- 菜单按钮 -->
    <el-row class="menu-row">
      <online :online="online" @show-user-card="showUserCard" />
      <discuss />
      <el-row class="menu">
        <red-packet class="menu-item" />
        <emoji class="menu-item" @add-content="addContent" />
        <images ref="cloudImages" @send-message="sendMessage" />
      </el-row>
    </el-row>
    <!-- 新消息提示 -->
    <transition name="fade">
      <div v-show="hasNewMessage" class="new-message-tip" @click="backTop()">
        <info-filled class="svg-icon" />有新消息啦
      </div>
    </transition>
    <!-- 消息列表 -->
    <el-scrollbar
      id="messageList"
      ref="messageScrollbar"
      class="message-box"
      height="420px"
      always
      @scroll="scroll"
    >
      <transition-group name="list-complete" tag="div">
        <div
          ref="inner"
          v-for="item in messageArray"
          v-bind:key="
            type.msg === item.type ? item.oId : item.oId + '_' + item.whoGot
          "
        >
          <!-- 提示类消息 -->
          <hint-message
            v-if="
              type.redPacketStatus === item.type ||
              type.discussChanged === item.type
            "
            :message="item"
            @show-user-card="showUserCard"
            @show-redpacket-info="showRedpacketInfo"
          />
          <!-- 聊天消息 -->
          <div v-else-if="!item.type || type.msg === item.type">
            <message
              v-if="!item.revoke && !item.hidden"
              class="list-complete-item"
              :ref="'message_' + item.oId"
              :message="item"
              :date="date"
              :unlimited-revoke="unlimitedRevoke"
              :avatar-pendant="avatarPendant"
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
      </transition-group>
      <div class="loading-box">
        <icon-svg icon-class="loading" class="loading" v-if="loading" />
      </div>
      <!-- 回到顶部 -->
      <icon-svg
        icon-class="top"
        class="back-top"
        v-show="showTop"
        @click="backTop()"
      />
    </el-scrollbar>
    <!-- 用户信息卡片 -->
    <user-card
      :user-name="userName"
      :dialog-visible="dialogVisible"
      @close-dialog="dialogVisible = false"
    />
    <!-- 领取红包信息 -->
    <red-packet-info
      :user-info="userInfo"
      :info="redPacketInfo"
      :dialog-visible="redPacketVisible"
      @close="redPacketVisible = false"
    ></red-packet-info>
  </div>
</template>

<script>
import { ref, defineAsyncComponent } from 'vue'
import { EVENT, MESSAGE_TYPE } from '../constant/Constant'
import { getDate, isRedPacket } from '../utils/util'
import { clickEventListener } from '../utils/commonUtil'
import { mapGetters, mapMutations } from 'vuex'
import { revoke } from '../api/chatroom'
import { InfoFilled } from '@element-plus/icons-vue'

let port

export default {
  name: 'chat-room',
  components: {
    InfoFilled,
    UserInfo: defineAsyncComponent(() => import('../components/UserInfo.vue'))
  },
  data() {
    return {
      loading: true,
      date: getDate(),
      dialogVisible: false,
      userName: '',
      redPacketInfo: {
        info: {}
      },
      online: {},
      redPacketVisible: false,
      type: MESSAGE_TYPE,
      avatarPendant: {},
      showTop: false,
      isTop: true,
      hasNewMessage: false
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
    }
  },
  setup() {
    const messageArray = ref([])
    const unshiftMessage = (msg) => {
      messageArray.value.unshift(msg)
    }
    const pushMessage = (msg) => {
      const index = messageArray.value.length - 1
      if (index < 0) {
        messageArray.value.push(...msg)
        return
      }
      const last = messageArray.value[index]
      const message = msg[0]
      if (last.content !== message.content) {
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
      updateMessage
    }
  },
  created() {
    const that = this
    // 连接background.js
    /* global chrome */
    port = chrome.runtime.connect({ name: 'pwl-chat' })
    port.onMessage.addListener((msg) => that.messageListener(msg))
    // 是否展示圣诞头像挂件
    this.avatarPendant.isChristmas =
      this.date.endsWith('12-24') || this.date.endsWith('12-25')
  },
  mounted() {
    document.getElementById('messageList').oncontextmenu = (event) => {
      this.showMessageMenu(event)
      return false
    }
    clickEventListener((name) => {
      this.userName = name
      this.dialogVisible = true
    })
  },
  beforeUnmount() {
    if (port) {
      port.disconnect()
    }
  },
  methods: {
    ...mapMutations(['setUserInfo', 'setDiscussContent']),
    messageListener(msg) {
      switch (msg.type) {
        case EVENT.userInfo:
          if (!msg.data.oId) {
            this.$router.push({ name: 'Error' })
            return
          }
          this.setUserInfo(msg.data)
          break
        case EVENT.loadMessage:
          this.pushMessage(msg.data.message)
          this.loading = false
          this.online = msg.data.online
          this.setDiscussContent(msg.data.discuss)
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
          this.setDiscussContent(msg.data.discussing)
          break
        case EVENT.discussChanged:
          this.setDiscussContent(msg.data)
          break
        default:
          break
      }
    },
    messageEvent(message) {
      if (message.type !== this.type.msg) {
        this.newMessage(message)
        return
      }
      const last = this.messageArray[0]
      if (!last || !last.md || message.md !== last.md || isRedPacket(message)) {
        this.newMessage(message)
        return
      }
      const users = last.users ? last.users : []
      users.unshift({
        userName: message.userName,
        userAvatarURL: message.userAvatarURL
      })
      this.updateMessage(0, 'users', users)
    },
    newMessage(message) {
      this.unshiftMessage(message)
      if (!this.isTop && message.userName !== this.userInfo.userName && !isRedPacket(message)) {
        this.hasNewMessage = true
      }
    },
    scroll({ scrollTop }) {
      if (scrollTop < 50) {
        this.isTop = true
        this.hasNewMessage = false
      } else {
        this.isTop = false
      }
      this.showTop = scrollTop > 100
      const distance =
        this.$refs.messageScrollbar.wrap$.scrollHeight - scrollTop - 420
      if (!this.loading && distance < 10) {
        this.load()
      }
    },
    load() {
      this.loading = true
      this.more()
    },
    backTop() {
      this.$refs.messageScrollbar.setScrollTop(0)
      this.hasNewMessage = false
    },
    more() {
      port.postMessage({ type: EVENT.getMore })
    },
    showMessageMenu(event) {
      const dom = event.path.find(
        (e) => e.id && e.id.indexOf('message_') !== -1
      )
      if (dom) {
        const isImage =
          event.path[0].nodeName === 'IMG' &&
          event.path[0].className !== 'emoji'
        this.$refs[dom.id][0].showMessageMenu(
          isImage ? event.path[0].currentSrc : ''
        )
      }
    },
    showUserCard(name) {
      this.userName = name
      this.dialogVisible = true
    },
    updateRedPacket(data) {
      let msg
      this.messageArray.some((e, index) => {
        if (e.oId === data.oId && e.type !== MESSAGE_TYPE.redPacketStatus) {
          msg = JSON.parse(e.content)
          if (msg.got >= msg.count) {
            return true
          }
          msg.got = data.got ? data.got : msg.count
          this.updateMessage(index, 'content', JSON.stringify(msg))
          return true
        }
        return false
      })
    },
    revoke(oId) {
      this.messageArray.some((e, index) => {
        if (e.oId === oId && e.type === MESSAGE_TYPE.msg) {
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
        this.$message.success(`批量撤回${count}条消息`)
        return
      }
      revoke(message.oId).then((res) => {
        res.code === 0
          ? this.$message.success(res.msg)
          : this.$message.info(res.msg)
      })
    },
    showRedpacketInfo(info) {
      this.redPacketVisible = true
      this.redPacketInfo = info
      const data = { oId: info.oId, got: info.info.count }
      this.updateRedPacket(data)
      port.postMessage({ type: EVENT.markRedPacket, data })
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
    }
  }
}
</script>
<style scoped>
.user-box {
  padding: 5px;
}
.menu-row {
  height: 30px;
  padding: 0 5px;
  justify-content: space-between;
  align-items: center;
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
.new-message-tip {
  position: fixed;
  top: 85px;
  left: calc(50% - 70px);
  height: 30px;
  line-height: 30px;
  width: 140px;
  font-size: 16px;
  text-align: center;
  color: #8ac36d;
  background-color: rgb(57 86 43);
  border: 1px solid rgb(63 161 15);
  border-radius: 5px;
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;
}
.message-box {
  padding-right: 5px;
}
</style>
<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.list-complete-enter-active,
.list-complete-leave-active {
  transition: all 0.2s ease;
}
.list-complete-enter-from,
.list-complete-leave-to {
  opacity: 0;
  transform: translateY(-20px);
  opacity: 0;
}
</style>
