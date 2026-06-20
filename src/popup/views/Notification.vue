<template>
  <div class="notification-page">
    <!-- 头部 -->
    <div class="header">
      <div class="header-row">
        <el-page-header @back="goBack">
          <template #content>
            <span class="page-title">
              通知
              <el-badge
                v-show="count.unreadNotificationCnt > 0"
                :value="count.unreadNotificationCnt"
                class="header-badge"
              />
            </span>
          </template>
        </el-page-header>
        <div class="header-actions">
          <span
            v-if="count.unreadNewFollowerNotificationCnt > 0"
            class="follower-link"
          >
            <a
              target="_blank"
              :href="getNotificationUrl('/member/Lemon/followers')"
            >新关注者</a>
            <el-badge :value="count.unreadNewFollowerNotificationCnt" />
          </span>
          <span class="mark-read-btn" @click="makeReadNotifications()">
            标记为已读
            <finished class="svg-icon" />
          </span>
        </div>
      </div>
      <!-- 标签页 -->
      <el-tabs v-model="tabsName" @tab-change="handleChange" class="notification-tabs">
        <el-tab-pane v-for="item in typeArray" :key="item.name" :name="item.name">
          <template #label>
            <span>{{ item.title }}</span>
            <el-badge v-show="count[item.count] > 0" :value="count[item.count]" />
          </template>
        </el-tab-pane>
      </el-tabs>
    </div>
    <!-- 通知列表 -->
    <el-scrollbar
      id="notification-box"
      ref="notificationScrollbar"
      class="notification-scrollbar"
      @scroll="scroll"
    >
      <div
        v-for="item in list"
        :key="item.oId"
        class="notification-item"
        :class="{ read: item.hasRead }"
      >
        <div class="item-header">
          <a
            class="item-title"
            target="_blank"
            :href="getUrl(item[attributes.url])"
          >{{
            isAt ? attributes[item.dataType].title : item[attributes.title]
          }}</a>
        </div>
        <div class="item-body">
          <div
            v-if="attributes.avatar || isAt"
            class="avatar-col"
          >
            <el-avatar
              size="default"
              :src="
                isAt
                  ? item[attributes[item.dataType].avatar]
                  : item[attributes.avatar]
              "
            />
            <span class="avatar-name">{{
              isAt
                ? item[attributes[item.dataType].userName]
                : item[attributes.userName]
            }}</span>
          </div>
          <div class="content-col">
            <div
              :class="onlyContent ? 'notification-html' : 'notification-content'"
            >
              <span
                v-html="
                  isAt
                    ? item[attributes[item.dataType].content]
                    : item[attributes.content]
                "
              ></span>
            </div>
            <div class="time">{{
              getDateTime(
                isAt
                  ? item[attributes[item.dataType].time]
                  : item[attributes.time]
              )
            }}</div>
          </div>
        </div>
      </div>
      <el-empty
        v-show="!loading && list.length === 0"
        class="dark-mode"
      />
      <div class="tip" v-show="list.length > 0 && nodata">
        没有数据啦~
      </div>
      <div class="loading-box">
        <icon-svg icon-class="loading" class="loading" v-if="loading" />
      </div>
      <icon-svg
        icon-class="top"
        class="back-top"
        v-show="showTop"
        @click="backTop()"
      />
    </el-scrollbar>
    <user-card
      :userName="userName"
      :dialogVisible="dialogVisible"
      @close-dialog="dialogVisible = false"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import {
  getNotifications,
  countNotifications,
  makeReadNotifications
} from '@/common/api/notification'
import { getDateTime } from '@/common/utils/util'
import { NOTIFICATION_TYPE, NOTIFICATION_MAPPING } from '@/common/constant/NotificationConstant'
import { Finished } from '@element-plus/icons-vue'

export default {
  name: 'notification-component',
  components: { Finished },
  data() {
    return {
      tabsName: 'commented',
      page: 0,
      loadDisabled: true,
      list: [],
      typeMapping: NOTIFICATION_MAPPING,
      typeArray: NOTIFICATION_TYPE,
      count: {
        unreadNotificationCnt: 0,
        code: 0,
        unreadReplyNotificationCnt: 0,
        unreadPointNotificationCnt: 0,
        userNotifyStatus: 0,
        unreadAtNotificationCnt: 0,
        unreadBroadcastNotificationCnt: 0,
        unreadSysAnnounceNotificationCnt: 0,
        unreadNewFollowerNotificationCnt: 0,
        unreadFollowingNotificationCnt: 0,
        unreadCommentedNotificationCnt: 0
      },
      showTop: false,
      nodata: false,
      loading: true,
      userName: '',
      dialogVisible: false
    }
  },
  computed: {
    ...mapGetters(['key']),
    params() {
      return { type: this.tabsName, p: this.page }
    },
    attributes() {
      return this.typeMapping.get(this.tabsName)
    },
    isAt() {
      return this.tabsName === 'at'
    },
    onlyContent() {
      return this.tabsName === 'point' || this.tabsName === 'sys-announce'
    }
  },
  created() {
    this.getCountNotifications()
    this.load()
  },
  mounted() {
    document
      .getElementById('notification-box')
      .addEventListener('click', (event) => {
        const dom = event.target
        if (dom.tagName !== 'A') {
          return
        }
        if (dom.className === 'name-at') {
          dom.href = 'javascript:;'
          this.userName = dom.innerText
          this.dialogVisible = true
        } else {
          dom.target = '_blank'
        }
      })
  },
  methods: {
    getNotificationUrl(url) {
      return process.env.VUE_APP_BASE_URL + url
    },
    getUrl(url) {
      return url
        ? url.startsWith(process.env.VUE_APP_BASE_URL)
          ? url
          : process.env.VUE_APP_BASE_URL + url
        : 'javascript:;'
    },
    goBack() {
      this.$router.push({ name: 'ChatRoom' })
    },
    backTop() {
      this.$refs.notificationScrollbar.setScrollTop(0)
    },
    handleChange() {
      this.nodata = false
      this.page = 0
      this.list = []
      this.backTop()
      this.load()
    },
    scroll({ scrollTop }) {
      this.showTop = scrollTop > 100
      const wrap = this.$refs.notificationScrollbar.wrapRef
      const distanceToBottom = wrap.scrollHeight - scrollTop - wrap.clientHeight
      if (!this.loading && distanceToBottom < 30) {
        this.load()
      }
    },
    getCountNotifications() {
      countNotifications().then((res) => {
        if (res.code === 0) {
          this.count = res
        }
      })
    },
    load() {
      if (this.nodata) {
        return
      }
      this.loading = true
      this.page += 1
      getNotifications(this.params).then((res) => {
        this.loading = false
        if (res.code === 0) {
          if (res.data.length === 0) {
            this.nodata = true
            return
          }
          this.list.push(...res.data)
          this.nodata = false
        }
      })
    },
    makeReadNotifications() {
      makeReadNotifications(this.tabsName).then((res) => {
        if (res.code === 0) {
          this.getCountNotifications()
          this.handleChange()
        }
      })
    },
    getDateTime(str) {
      return getDateTime(str)
    }
  }
}
</script>

<style scoped>
/* ===== 页面容器 ===== */
.notification-page {
  background: #181818;
  height: 100%;
  overflow: hidden;
  font-size: 13px;
  max-width: 380px;
  display: flex;
  flex-direction: column;
}

/* ===== 头部（固定） ===== */
.header {
  padding: 8px 12px 0 12px;
  background: #232323;
  flex-shrink: 0;
  z-index: 1;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  margin-left: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
}

.header-badge {
  margin-left: 6px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.follower-link {
  font-size: 13px;
  color: #e0e0e0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.follower-link a {
  color: #58a6ff;
  text-decoration: none;
}

.follower-link a:hover {
  text-decoration: underline;
}

.mark-read-btn {
  font-size: 13px;
  color: #bbb;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.mark-read-btn:hover {
  color: var(--el-color-primary);
}

/* ===== 标签页 ===== */
.notification-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
}

.notification-tabs :deep(.el-tabs__nav-wrap::after) {
  background: #232323;
}

.notification-tabs :deep(.el-tabs__item) {
  color: #aaa;
  font-size: 12px;
  padding: 0 10px;
  height: 36px;
  line-height: 36px;
}

.notification-tabs :deep(.el-tabs__item.is-active) {
  color: #fff;
}

.notification-tabs :deep(.el-tabs__active-bar) {
  background: #409eff;
}

/* ===== 滚动区域 ===== */
.notification-scrollbar {
  flex: 1;
  padding: 0 8px;
}

/* 深色滚动条 */
.notification-scrollbar :deep(.el-scrollbar__bar.is-vertical) {
  width: 4px;
}

.notification-scrollbar :deep(.el-scrollbar__thumb) {
  background: #333;
  border-radius: 2px;
}

.notification-scrollbar :deep(.el-scrollbar__thumb:hover) {
  background: #444;
}

.notification-scrollbar :deep(.el-scrollbar__wrap) {
  margin-right: 0 !important;
}

/* ===== 通知条目 ===== */
.notification-item {
  padding: 10px 4px;
  border-bottom: 1px solid #232323;
  transition: background 0.2s;
}

.notification-item:hover {
  background: #1e1e1e;
}

.item-header {
  margin-bottom: 4px;
}

.item-title {
  max-width: 330px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  display: block;
  color: #e0e0e0;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
}

.item-title:hover {
  color: #58a6ff;
}

.item-body {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

/* ===== 头像列 ===== */
.avatar-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 64px;
  flex-shrink: 0;
  gap: 4px;
}

.avatar-name {
  font-size: 12px;
  color: #aaa;
  text-align: center;
  max-width: 64px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ===== 内容列 ===== */
.content-col {
  flex: 1;
  min-width: 0;
}

.notification-content {
  padding: 2px 0;
  color: #ccc;
  line-height: 1.6;
}

.notification-html {
  padding: 2px 0;
  color: #ccc;
  line-height: 1.6;
}

.time {
  display: flex;
  justify-content: flex-end;
  font-size: 11px;
  color: #888;
  margin-top: 4px;
}

/* ===== 已读状态 ===== */
.read .item-title {
  color: #888;
  font-weight: 400;
}

.read .notification-content,
.read .notification-html {
  opacity: 0.5;
}

.read .avatar-name {
  opacity: 0.5;
}

/* ===== 底部提示 ===== */
.tip {
  font-size: 14px;
  padding: 16px 0;
  text-align: center;
  color: #888;
}

.loading-box {
  text-align: center;
  padding: 12px 0;
}

.loading {
  width: 24px;
  height: 24px;
  animation: rotating 2s linear infinite;
}

.back-top {
  position: fixed;
  bottom: 20px;
  right: 16px;
  width: 32px;
  height: 32px;
  cursor: pointer;
  opacity: 0.7;
}

.back-top:hover {
  opacity: 1;
}

:deep(.el-page-header__left) {
  margin-right: 0;
  color: white;
}

:deep(.el-page-header__content) {
  color: white;
}

/* 空状态暗色适配 */
:deep(.el-empty__description p) {
  color: #888;
}

@keyframes rotating {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
<style>
/* 非 scoped：通知内容中的链接和代码块 */
.notification-content a,
.notification-html a {
  color: #58a6ff;
}

.notification-content pre,
.notification-content code {
  max-width: 240px;
  overflow: auto;
  font-size: 13px;
}

.notification-html pre,
.notification-html code {
  max-width: 340px;
  overflow: auto;
  font-size: 13px;
}
</style>
