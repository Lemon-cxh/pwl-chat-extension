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
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <icon-svg icon-class="loading" class="loading-icon" />
      </div>
      <!-- 空状态提示 -->
      <div v-if="!loading && chatList.length === 0" class="empty-state">
        <el-empty description="暂无聊天记录" :image-size="80">
          <template #description>
            <span style="color: #888;">还没有私聊记录</span>
          </template>
        </el-empty>
        <div class="empty-hint">通过上方用户搜索发起新对话</div>
      </div>
      <!-- 聊天列表 -->
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
import { getChatList, hasUnread, markAsRead } from '@/common/api/privatechat'
import { mapGetters } from 'vuex'
import UserSelect from '@/popup/components/user/UserSelect.vue'

export default {
  name: 'PrivateChatList',
  inject: ['$message'],
  components: {
    UserSelect
  },
  data() {
    return {
      chatList: [],
      unreadList: [],
      selectedUser: '',
      loading: true
    }
  },
  computed: {
    ...mapGetters(['key'])
  },
  methods: {
    async loadChatList() {
      try {
        const response = await getChatList()
        if (response.code === 0) {
          this.chatList = Array.isArray(response.data) ? response.data : []
        } else {
          this.$message.error(response.msg || '获取私聊列表失败')
        }
      } catch (error) {
        console.error('获取私聊列表失败:', error)
        this.$message.error('获取私聊列表失败，请检查网络连接')
      }
    },
    async loadUnreadList() {
      try {
        const response = await hasUnread()
        if (response.code === 0) {
          this.unreadList = Array.isArray(response.data) ? response.data : []
        } else {
          // 获取未读列表失败不影响主列表显示，仅记录日志
          console.warn('获取未读列表失败:', response.msg)
        }
      } catch (error) {
        console.error('获取未读列表失败:', error)
      }
    },
    async markAsRead(fromUser) {
      try {
        const params = {
          fromUser
        }
        await markAsRead(params)
      } catch (error) {
        console.error('标记已读失败:', error)
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
    this.loading = true
    await this.loadChatList()
    await this.loadUnreadList()
    this.loading = false
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

/* 加载状态 */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 60px;
}

.loading-icon {
  width: 32px;
  height: 32px;
  animation: rotating 2s linear infinite;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 60px;
}

.empty-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
}

/* 深色滚动条 */
.chat-list :deep(.el-scrollbar__bar.is-vertical) {
  width: 4px;
}
.chat-list :deep(.el-scrollbar__thumb) {
  background: #333;
  border-radius: 2px;
}
.chat-list :deep(.el-scrollbar__thumb:hover) {
  background: #444;
}
.chat-list :deep(.el-scrollbar__wrap) {
  margin-right: 0 !important;
}

/* 修改 el-page-header 样式 */
:deep(.el-page-header__left) {
  margin-right: 0px;
  color: white;
}

:deep(.el-page-header__content) {
  color: white;
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
