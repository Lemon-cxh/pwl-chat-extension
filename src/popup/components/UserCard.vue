<template>
  <el-dialog
    v-model="visible"
    width="370px"
    center
    :modal="false"
    :before-close="closeHandler"
  >
    <div class="user-card">
      <div
        v-if="userInfo.cardBg"
        class="card-header"
        :style="getBackgroundImage(userInfo.cardBg)"
      ></div>

      <div class="card-body" :class="{ 'no-header': !userInfo.cardBg }">
        <div class="user-info-overview">
          <el-avatar
            :size="60"
            :src="userInfo.userAvatarURL"
            class="user-avatar"
          />
          <div class="user-basic-details">
            <div class="user-name-row">
              <span class="user-name">{{
                userInfo.userNickname
                  ? userInfo.userNickname
                  : userInfo.userName
              }}</span>
              <span
                class="user-role-tag"
                :class="userInfo.userAppRole == 0 ? 'hacker' : 'painter'"
              >
                {{ userInfo.userAppRole == 0 ? "黑客" : "画家" }}
              </span>
            </div>
            <div class="user-meta">
              <span class="user-id">#{{ userInfo.userNo }}</span>
              <span class="separator">•</span>
              <span class="user-point" @click="openPoints">
                <el-icon><Coin /></el-icon>
                {{ userInfo.userPoint }}
              </span>
              <span class="separator">•</span>
              <span
                class="online-status"
                :class="{ 'is-online': userInfo.userOnlineFlag }"
              >
                <el-icon
                  ><CircleCheck v-if="userInfo.userOnlineFlag" /><CircleClose
                    v-else
                /></el-icon>
                {{ userInfo.userOnlineFlag ? "在线" : "离线" }}
              </span>
            </div>
            <div class="user-meta">
              <span>{{ userInfo.followingUserCount }}关注</span>
              <span class="separator">•</span>
              <span>{{ userInfo.followerCount }}粉丝</span>
              <span class="separator">•</span>
              <span>{{ userInfo.mbti ? userInfo.mbti : 'MBTI' }}</span>
            </div>
          </div>
          <div class="right-icons">
            <!-- TODO: 添加爱心或其他右侧图标 -->
          </div>
        </div>

        <div class="user-details-extra">
          <span class="user-role-text">
            <el-icon><User /></el-icon>{{ userInfo.userRole }}
          </span>
          <span class="separator">•</span>
          <span class="user-city">
            <el-icon><Location /></el-icon>
            {{ userInfo.userCity || "未知" }}
          </span>
          <span class="separator">•</span>
          <span class="online-time" v-if="userInfo.onlineMinute">
            <el-icon><Timer /></el-icon>
            {{ userInfo.onlineMinute }}分钟
          </span>
          <div class="badges" v-if="userInfo.sysMetal">
            <img
              v-for="(item, index) in userInfo.sysMetal.list"
              :key="index"
              :src="
                'https://unv-shield.librian.net/api/unv_shield?scale=0.79&txt=' +
                item.name +
                '&' +
                item.attr
              "
            />
          </div>
        </div>

        <div class="user-intro-section" v-if="userInfo.userIntro">
          <el-icon><ChatDotRound /></el-icon>
          <span>{{ userInfo.userIntro }}</span>
        </div>

        <a class="user-url-link" v-if="userInfo.userURL" @click="openUrl">
          <el-icon><LinkIcon /></el-icon>
          <span>{{ userInfo.userURL }}</span>
        </a>

        <div class="action-buttons">
          <el-button type="primary" size="small" @click="startPrivateChat">
            <el-icon><ChatLineRound /></el-icon>
            发消息
          </el-button>
          <el-button size="small" @click="openMember">
            <el-icon><HomeFilled /></el-icon>
            主页
          </el-button>
          <el-button
            v-if="userInfo.canFollow === 'yes'"
            :type="isFollowing ? 'danger' : 'success'"
            size="small"
            :loading="followLoading"
            @click="handleFollow"
          >
            <el-icon><Plus v-if="!isFollowing" /><Minus v-else /></el-icon>
            {{ isFollowing ? "取关" : "关注" }}
          </el-button>
          <el-button
            type="warning"
            size="small"
            @click="transferDialogVisible = true"
          >
            <el-icon><Money /></el-icon>
            转账
          </el-button>
        </div>
      </div>
    </div>

    <TransferDialog
      v-model="transferDialogVisible"
      :user-name="userInfo.userName"
      :api-key="key"
      @success="handleTransferSuccess"
    />
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import { getUserInfo, followUser, unfollowUser } from '@/popup/api/user'
import {
  Coin,
  LocationFilled as Location,
  Link as LinkIcon,
  ChatLineRound,
  User,
  ChatDotRound,
  HomeFilled,
  CircleCheck,
  CircleClose,
  Timer,
  Plus,
  Minus,
  Money
} from '@element-plus/icons-vue'
import TransferDialog from './TransferDialog.vue'

/**
 * 用户信息卡片
 */
export default {
  name: 'UserCard',
  components: {
    Coin,
    Location,
    LinkIcon,
    ChatLineRound,
    User,
    ChatDotRound,
    HomeFilled,
    CircleCheck,
    CircleClose,
    Timer,
    Plus,
    Minus,
    Money,
    TransferDialog
  },
  props: {
    dialogVisible: Boolean,
    userName: String
  },
  emits: ['closeDialog'],
  data() {
    return {
      userInfo: {},
      isFollowing: false,
      followLoading: false,
      transferDialogVisible: false
    }
  },
  computed: {
    ...mapGetters(['key']),
    visible() {
      return this.dialogVisible
    }
  },
  watch: {
    userName(newValue) {
      if (newValue) {
        this.loadUserInfo(newValue)
      }
    }
  },
  methods: {
    async loadUserInfo(userName) {
      try {
        const res = await getUserInfo(userName, { apiKey: this.key })
        if (res.sysMetal) {
          res.sysMetal = JSON.parse(res.sysMetal)
        }
        this.userInfo = res
        // 检查是否已关注
        this.isFollowing = res.canFollow === 'no'
      } catch (error) {
        console.error('Failed to load user info:', error)
      }
    },
    getBackgroundImage(url) {
      return url
        ? `background-image:url('${url}')`
        : 'background: linear-gradient(135deg, #1b4f8f 0%, #2c3e50 100%);'
    },
    startPrivateChat() {
      this.$router.push({
        name: 'PrivateChat',
        params: { username: this.userInfo.userName }
      })
      this.closeHandler()
    },
    openMember() {
      window.open(
        `${process.env.VUE_APP_BASE_URL}/member/${this.userInfo.userName}`
      )
    },
    openPoints() {
      window.open(
        `${process.env.VUE_APP_BASE_URL}/member/${this.userInfo.userName}/points`
      )
    },
    openUrl() {
      if (this.userInfo.userURL) {
        window.open(this.userInfo.userURL)
      }
    },
    closeHandler() {
      this.$emit('closeDialog')
    },
    async handleFollow() {
      if (this.followLoading) return

      this.followLoading = true
      try {
        const data = {
          apiKey: this.key,
          followingId: this.userInfo.oId
        }

        if (this.isFollowing) {
          await unfollowUser(data)
          this.userInfo.followerCount--
        } else {
          await followUser(data)
          this.userInfo.followerCount++
        }

        this.isFollowing = !this.isFollowing
        this.$message.success(this.isFollowing ? '关注成功' : '取关成功')
      } catch (error) {
        console.error('Follow/Unfollow failed:', error)
        this.$message.error('操作失败，请重试')
      } finally {
        this.followLoading = false
      }
    },
    async handleTransferSuccess() {
      // 刷新用户信息
      await this.loadUserInfo(this.userInfo.userName)
    }
  }
}
</script>

<style scoped>
.user-card {
  background-color: #1a1a1a;
  color: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.card-header {
  height: 120px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.card-body {
  padding: 12px;
  padding-top: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card-body.no-header {
  padding-top: 12px;
}

.user-info-overview {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
  position: relative;
  z-index: 1;
}

.user-avatar {
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
  background-color: #1a1a1a;
  border-radius: 50%;
}

.user-basic-details {
  flex: 1;
  min-width: 0;
}

.user-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.user-name {
  font-size: 15px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role-tag {
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 9px;
  background-color: rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
}

.user-role-tag.hacker {
  background-color: #409eff;
}

.user-role-tag.painter {
  background-color: #67c23a;
}

.user-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  flex-wrap: wrap;
}

.separator {
  margin: 0 2px;
  color: rgba(255, 255, 255, 0.5);
}

.user-point,
.user-city {
  display: flex;
  align-items: center;
  gap: 4px;
}

.user-point {
  cursor: pointer;
}

.right-icons {
  margin-left: auto;
  flex-shrink: 0;
}

.user-details-extra {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 8px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.user-role-text {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.badges {
  display: flex;
  gap: 3px;
  flex-wrap: wrap;
}

.user-intro-section {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.4;
  word-break: break-word;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.user-url-link {
  font-size: 12px;
  color: #409eff;
  display: flex;
  align-items: center;
  gap: 4px;
  text-decoration: none;
  word-break: break-all;
}

.user-url-link:hover {
  text-decoration: underline;
}

.action-buttons {
  display: flex;
  gap: 8px;
  margin-top: 15px;
}

.action-buttons .el-button {
  flex: 1;
  padding: 6px 10px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

:deep(.el-icon) {
  font-size: 14px;
}

.el-popup-parent--hidden {
  padding-right: 0 !important;
}

.online-status {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
}

.online-status.is-online {
  color: #67c23a;
}

.online-status:not(.is-online) {
  color: #909399;
}

.user-stats {
  display: flex;
  justify-content: space-around;
  padding: 12px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.online-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}
</style>
<style>
.el-dialog__header {
  display: none !important;
}
.el-dialog {
  background-color: #333;
}
</style>
