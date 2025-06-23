<template>
  <div class="private-chat">
    <div class="header">
      <el-page-header @back="goBack">
        <template #content>
          <span class="title">{{ currentUser }}</span>
        </template>
      </el-page-header>
    </div>
    <el-scrollbar
      ref="messageScrollbar"
      class="message-list"
      :height="scrollbarHeight"
      noresize
      always
      @scroll="scroll"
    >
      <div
        v-for="(message, index) in messages"
        :key="message.oId"
        class="message-item"
      >
        <div class="message-time" v-if="shouldShowTime(index)">
          {{ formatTime(message.time) }}
        </div>
        <div
          :class="[
            'message-content',
            message.senderUserName === userInfo.userName ? 'self' : '',
          ]"
        >
          <el-avatar :size="40" :src="message.senderAvatar" />
          <div class="message-bubble">
            <div class="message-text" v-html="message.content"></div>
          </div>
        </div>
      </div>
      <div class="loading-box">
        <icon-svg icon-class="loading" class="loading" v-if="loading" />
      </div>
    </el-scrollbar>
    <!-- 新消息提示 -->
    <transition name="fade">
      <div
        v-show="hasNewMessage"
        class="new-message-tip"
        @click="scrollToBottom"
      >
        <info-filled class="svg-icon" />有新消息啦
      </div>
    </transition>
    <!-- 输入区域 -->
    <div class="message-input">
      <el-input
        v-model="inputMessage"
        type="textarea"
        :rows="3"
        placeholder="输入消息..."
        @keyup.enter.exact="sendMessage"
      />
      <div class="input-tools">
        <div class="left-tools">
          <images
            ref="cloudImages"
            class="tool-item"
            @send-message="sendMessage"
          />
          <div class="tool-item">
            <emoji @add-content="addContent" />
          </div>
          <div class="tool-item" @click="showTransferDialog">
            <el-icon><money /></el-icon>
          </div>
        </div>
        <el-button type="primary" @click="sendMessage">发送</el-button>
      </div>
    </div>
    <!-- 转账对话框 -->
    <transfer-dialog
      v-model="transferDialogVisible"
      :user-name="currentUser"
      :api-key="key"
      @success="handleTransferSuccess"
    />
  </div>
</template>

<script>
import { getChatMessage, markAsRead } from '@/popup/api/privatechat'
import { mapGetters } from 'vuex'
import {
  openPrivateChatWebSocket,
  closePrivateChatWebSocket,
  sendPrivateChatMessage
} from '@/background/manager/PrivateChatWebSocketManager'
import { InfoFilled, Money } from '@element-plus/icons-vue'
import Emoji from '@/popup/components/Emoji.vue'
import Images from '@/popup/components/Images.vue'
import TransferDialog from '@/popup/components/TransferDialog.vue'

export default {
  name: 'PrivateChat',
  inject: ['$message'],
  components: {
    InfoFilled,
    Money,
    Emoji,
    Images,
    TransferDialog
  },
  emits: ['back'],
  data() {
    return {
      messages: [],
      inputMessage: '',
      page: 1,
      pageSize: 20,
      hasNewMessage: false,
      isTop: true,
      loading: false,
      scrollbarHeight: window.innerHeight - 200, // 增加底部空间
      transferDialogVisible: false
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'key']),
    apiKey() {
      return { apiKey: this.key }
    },
    currentUser() {
      return this.$route.params.username
    },
    lastMessageId() {
      return this.messages.length > 0 ? this.messages[0].oId : 0
    }
  },
  methods: {
    async loadMessages() {
      try {
        const params = {
          ...this.apiKey,
          toUser: this.currentUser,
          page: this.page,
          pageSize: this.pageSize
        }
        const response = await getChatMessage(params)
        if (response.result === 0) {
          const newMessages = response.data.reverse()
          this.messages = [...newMessages, ...this.messages]
          if (this.page === 1) {
            this.$nextTick(() => {
              this.scrollToBottom()
            })
          }
        }
      } catch (error) {
        console.error('Failed to load messages:', error)
      }
    },
    async loadMore() {
      if (this.loading) return
      this.loading = true
      this.page += 1
      try {
        const params = {
          ...this.apiKey,
          toUser: this.currentUser,
          page: this.page,
          pageSize: this.pageSize
        }
        const response = await getChatMessage(params)
        if (response.result === 0) {
          const newMessages = response.data.reverse()
          // 记录当前滚动位置
          const messageList = this.$refs.messageScrollbar
          const oldScrollHeight = messageList.wrapRef.scrollHeight

          // 添加新消息
          this.messages = [...newMessages, ...this.messages]

          // 在下一个渲染周期调整滚动位置，保持视觉连续性
          this.$nextTick(() => {
            const newScrollHeight = messageList.wrapRef.scrollHeight
            const scrollDiff = newScrollHeight - oldScrollHeight
            messageList.setScrollTop(scrollDiff)
          })
        }
      } catch (error) {
        console.error('Failed to load messages:', error)
      } finally {
        this.loading = false
      }
    },
    async sendMessage() {
      if (!this.inputMessage.trim()) return

      try {
        const message = {
          type: 'msg',
          toUser: this.currentUser,
          content: `<p>${this.inputMessage}</p>`,
          time: new Date().toLocaleString(),
          senderUserName: this.userInfo.userName,
          senderAvatar: this.userInfo.userAvatarURL
        }
        await sendPrivateChatMessage(this.currentUser, this.inputMessage)
        this.messages.push(message)
        this.inputMessage = ''
        this.$nextTick(() => {
          this.scrollToBottom()
        })
      } catch (error) {
        console.error('Failed to send message:', error)
      }
    },
    formatTime(timestamp) {
      const date = new Date(timestamp)
      const now = new Date()

      // 如果是今天的消息
      if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit'
        })
      }

      // 如果是昨天的消息
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      if (date.toDateString() === yesterday.toDateString()) {
        return (
          '昨天 ' +
          date.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
          })
        )
      }

      // 如果是今年的消息
      if (date.getFullYear() === now.getFullYear()) {
        return (
          date.toLocaleDateString('zh-CN', {
            month: '2-digit',
            day: '2-digit'
          }) +
          ' ' +
          date.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
          })
        )
      }

      // 其他情况显示完整日期时间
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    shouldShowTime(index) {
      if (index === 0) return true

      const currentMessage = this.messages[index]
      const previousMessage = this.messages[index - 1]

      const currentTime = new Date(currentMessage.time)
      const previousTime = new Date(previousMessage.time)

      // 如果日期不同，显示时间
      if (currentTime.toDateString() !== previousTime.toDateString()) {
        return true
      }

      // 如果时间间隔超过5分钟，显示时间
      const timeDiff = currentTime - previousTime
      return timeDiff > 5 * 60 * 1000
    },
    scrollToBottom() {
      const messageList = this.$refs.messageScrollbar
      if (messageList) {
        messageList.setScrollTop(messageList.wrapRef.scrollHeight)
      }
    },
    scroll({ scrollTop }) {
      const messageList = this.$refs.messageScrollbar
      if (!messageList) return

      // 当滚动到距离顶部 100px 时就开始加载更多消息
      if (scrollTop < 100 && !this.loading) {
        this.isTop = true
        this.hasNewMessage = false
        this.loadMore()
      } else {
        this.isTop = false
      }
    },
    addContent(content) {
      this.inputMessage += content
    },
    async goBack() {
      const params = {
        ...this.apiKey,
        fromUser: this.currentUser
      }
      await markAsRead(params)
      this.$router.push({ name: 'PrivateChatList' })
    },
    handleWebSocketMessage(event) {
      try {
        const data = JSON.parse(event.data)
        console.log('Received WebSocket message:', data)
        // 检查是否是私聊消息
        if (data.user_session) {
          // 判断是否是自己的消息
          if (data.senderUserName === this.userInfo.userName) {
            return
          }

          const message = {
            oId: data.oId,
            time: data.time,
            senderUserName: data.senderUserName,
            senderAvatar: data.senderAvatar,
            content: data.content,
            type: 'msg'
          }
          this.messages.push(message)

          // 获取滚动条位置
          const messageList = this.$refs.messageScrollbar
          if (messageList) {
            const { scrollTop, clientHeight, scrollHeight } =
              messageList.wrapRef
            // 如果距离底部超过 100px，显示新消息提示
            if (scrollHeight - scrollTop - clientHeight > 100) {
              this.hasNewMessage = true
            } else {
              // 否则直接滚动到底部
              this.$nextTick(() => {
                this.scrollToBottom()
              })
            }
          }
        }
      } catch (error) {
        console.error('Failed to handle WebSocket message:', error)
      }
    },
    showTransferDialog() {
      this.transferDialogVisible = true
    },
    handleTransferSuccess({ amount, memo }) {
      // 发送转账成功消息
      const message = {
        type: 'msg',
        toUser: this.currentUser,
        content: `<p>转账 ${amount} 积分成功${
          memo ? `，备注：${memo}` : ''
        }</p>`,
        time: new Date().toLocaleString(),
        senderUserName: this.userInfo.userName,
        senderAvatar: this.userInfo.userAvatarURL
      }
      this.messages.push(message)
      this.$nextTick(() => {
        this.scrollToBottom()
      })
    }
  },
  watch: {
    currentUser: {
      async handler(newUser) {
        if (!newUser) return
        this.messages = []
        this.page = 1
        await this.loadMessages()
        await openPrivateChatWebSocket(newUser, this.handleWebSocketMessage)
      },
      immediate: true
    }
  },
  beforeUnmount() {
    closePrivateChatWebSocket()
  }
}
</script>

<style scoped>
.private-chat {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #1a1a1a;
  overflow: hidden;
}

.header {
  padding: 12px 16px;
  background-color: #2c2c2c;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
}

.title {
  margin-left: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

.message-list {
  flex: 1;
  padding: 0 16px;
  padding-bottom: 130px; /* 增加底部 padding */
  margin-top: 50px;
}

.message-item {
  margin-bottom: 20px;
}

.message-time {
  text-align: center;
  font-size: 12px;
  color: #888;
  margin: 8px 0;
}

.message-content {
  display: flex;
  align-items: flex-start;
  margin: 8px 0;
}

.message-content.self {
  flex-direction: row-reverse;
}

.message-bubble {
  margin: 0 12px;
  padding: 10px 14px;
  background-color: #2c2c2c;
  border-radius: 12px;
  max-width: 70%;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.self .message-bubble {
  background-color: #2b5b1c;
}

.message-text {
  word-break: break-word;
  line-height: 1.5;
  color: #e0e0e0;
}

.message-text :deep(img) {
  max-width: 100%;
  border-radius: 8px;
  margin: 4px 0;
}

.message-input {
  padding: 12px 16px;
  background-color: #2c2c2c;
  border-top: 1px solid #333;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  box-shadow: 0 -1px 2px rgba(0, 0, 0, 0.2);
}

.message-input :deep(.el-textarea__inner) {
  border-radius: 8px;
  padding: 8px 12px;
  resize: none;
  border-color: #444;
  background-color: #1a1a1a;
  color: #e0e0e0;
  margin-bottom: 8px;
}

.message-input :deep(.el-textarea__inner:focus) {
  border-color: #409eff;
}

.message-input :deep(.el-textarea__inner::placeholder) {
  color: #666;
}

.input-tools {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left-tools {
  display: flex;
  gap: 12px;
}

.tool-item {
  font-size: 24px;
  line-height: 24px;
  cursor: pointer;
  color: #e0e0e0;
}

.tool-item:hover {
  color: #409eff;
}

.message-input .el-button {
  padding: 8px 20px;
  border-radius: 8px;
  background-color: #409eff;
  border-color: #409eff;
  height: 36px;
}

.message-input .el-button:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
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
  cursor: pointer;
}

/* 自定义滚动条样式 */
.message-list :deep(.el-scrollbar__bar.is-vertical) {
  width: 6px;
}

.message-list :deep(.el-scrollbar__thumb) {
  background-color: #444;
  border-radius: 3px;
}

.message-list :deep(.el-scrollbar__thumb:hover) {
  background-color: #555;
}

.message-list :deep(.el-scrollbar__wrap) {
  margin-right: 0 !important;
}

/* 动画效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 修改 el-page-header 样式 */
:deep(.el-page-header__left) {
  color: white;
}

:deep(.el-page-header__content) {
  color: white;
}

.loading-box {
  text-align: center;
  padding: 10px 0;
}

.loading {
  width: 24px;
  height: 24px;
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
