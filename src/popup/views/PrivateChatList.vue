<template>
  <div class="private-chat-list">
    <div class="header">
      <div class="header-content">
        <el-page-header @back="goBack">
          <template #content>
            <span class="title">私聊列表</span>
          </template>
        </el-page-header>

        <div class="user-select-wrapper">
          <user-select
            v-model="selectedUser"
            :multiple="false"
            placeholder="请输入用户名"
            width="120px"
            custom-class="user-select"
            @change="handleSelectUser"
          />
        </div>
      </div>
    </div>
    <el-scrollbar class="chat-list">
      <div
        v-for="chat in chatList"
        :key="chat.oId"
        class="chat-item"
        :class="{ 'has-unread': hasUnread(chat) }"
        @click="selectChat(chat)"
      >
        <el-avatar :size="40" :src="chat.receiverAvatar" />
        <div class="chat-info">
          <div class="chat-header">
            <div class="user-info">
              <span class="username">{{ chat.receiverUserName }}</span>
              <el-badge
                v-if="getUnreadCount(chat)"
                :value="getUnreadCount(chat)"
                class="unread-badge"
              />
            </div>
            <span class="time">{{ formatTime(chat.time) }}</span>
          </div>
          <div class="last-message">{{ chat.preview }}</div>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script>
import { getChatList, hasUnread, markAsRead } from '@/popup/api/privatechat'
import { mapGetters } from 'vuex'
import UserSelect from '@/popup/components/UserSelect.vue' // 导入UserSelect组件

export default {
  name: 'PrivateChatList',
  components: {
    UserSelect // 注册UserSelect组件
  },
  data() {
    return {
      chatList: [],
      unreadList: [],
      selectedUser: '' // 添加selectedUser数据项
    }
  },
  computed: {
    ...mapGetters(['key']),
    apiKey() {
      return { apiKey: this.key }
    }
  },
  methods: {
    async loadChatList() {
      try {
        const response = await getChatList(this.apiKey)
        if (response.result === 0) {
          this.chatList = response.data
        }
      } catch (error) {
        console.error('Failed to load chat list:', error)
      }
    },
    async loadUnreadList() {
      try {
        const response = await hasUnread(this.apiKey)
        if (response.result > 0) {
          this.unreadList = response.data
        }
      } catch (error) {
        console.error('Failed to load unread list:', error)
      }
    },
    async markAsRead(fromUser) {
      try {
        const params = {
          ...this.apiKey,
          fromUser
        }
        await markAsRead(params)
      } catch (error) {
        console.error('Failed to mark as read:', error)
      }
    },
    getUnreadCount(chat) {
      const count = this.unreadList.filter(
        (item) => item.user_session === chat.user_session
      ).length

      return count
    },
    hasUnread(chat) {
      return this.getUnreadCount(chat) > 0
    },
    // 修改处理用户选择的方法
    handleSelectUser(val) {
      if (val) {
        this.selectChat({
          receiverUserName: val
        })
      }
    },
    selectChat(chat) {
      if (this.hasUnread(chat)) {
        this.markAsRead(chat.receiverUserName)
      }
      this.$router.push({
        name: 'PrivateChat',
        params: { username: chat.receiverUserName }
      })
    },
    formatTime(timestamp) {
      return timestamp
    },
    goBack() {
      this.$router.push({ name: 'ChatRoom' })
    }
  },
  async mounted() {
    await this.loadChatList()
    await this.loadUnreadList()
  }
}
</script>

<style scoped>
.private-chat-list {
  display: flex;
  flex-direction: column;
  background-color: #1a1a1a;
  height: 100%;
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
  z-index: 1;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.user-select-wrapper {
  display: flex;
  align-items: center;
  margin-left: 10px;
}

.title {
  margin-left: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

/* 添加用户选择器的自定义样式 */
:deep(.user-select .el-input__wrapper) {
  background-color: #333;
  border-color: #444;
}

:deep(.user-select .el-input__inner) {
  color: #fff;
}

.chat-list {
  flex: 1;
  margin-top: 60px;
  height: calc(100vh - 60px);
}

.chat-item {
  display: flex;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  border-bottom: 1px solid #333;
  position: relative;
  transition: background-color 0.3s;
}

.chat-item:hover {
  background-color: #2c2c2c;
}

.chat-item.has-unread {
  background-color: #2c2c2c;
}

.chat-item.has-unread .username {
  color: #fff;
  font-weight: bold;
}

.chat-item.has-unread .last-message {
  color: #fff;
}

.chat-info {
  margin-left: 12px;
  flex: 1;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.username {
  font-weight: 600;
  font-size: 14px;
  color: #e0e0e0;
}

.time {
  font-size: 12px;
  color: #888;
}

.last-message {
  font-size: 13px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.unread-badge {
  margin-top: 2px;
}

.unread-badge :deep(.el-badge__content) {
  background-color: #f56c6c;
  transform: scale(0.8);
  transform-origin: right center;
}

/* 修改 el-page-header 样式 */
:deep(.el-page-header__left) {
  margin-right: 0px;
  color: white;
}

:deep(.el-page-header__content) {
  color: white;
}
</style>
