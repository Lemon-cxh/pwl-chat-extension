<template>
  <div>
    <el-row justify="space-between">
      <el-page-header @back="goBack">
        <template #content>
          <a
            target="_blank"
            :href="getNotificationUrl('/notifications/' + tabsName)"
            class="page-header"
            >通知</a
          >
          <el-badge
            v-show="count.unreadNotificationCnt > 0"
            :value="count.unreadNotificationCnt"
          />
        </template>
      </el-page-header>
      <span
        class="mark-notification"
        v-if="count.unreadNewFollowerNotificationCnt > 0"
      >
        <a
          target="_blank"
          :href="getNotificationUrl('/member/Lemon/followers')"
          class="page-header"
          >新关注者</a
        >
        <el-badge :value="count.unreadNewFollowerNotificationCnt" />
      </span>
      <span class="mark-notification" @click="makeReadNotifications()">
        标记为已读
        <finished class="svg-icon" />
      </span>
    </el-row>
    <el-tabs v-model="tabsName" @tab-click="handleClick">
      <el-tab-pane name="commented">
        <template #label>
          <span>收到的回帖</span>
          <el-badge
            v-show="count.unreadCommentedNotificationCnt > 0"
            :value="count.unreadCommentedNotificationCnt"
          />
        </template>
      </el-tab-pane>
      <el-tab-pane name="reply">
        <template #label>
          <span>收到的回复</span>
          <el-badge
            v-show="count.unreadReplyNotificationCnt > 0"
            :value="count.unreadReplyNotificationCnt"
          />
        </template>
      </el-tab-pane>
      <el-tab-pane name="point">
        <template #label>
          <span>积分</span>
          <el-badge
            v-show="count.unreadPointNotificationCnt > 0"
            :value="count.unreadPointNotificationCnt"
          />
        </template>
      </el-tab-pane>
      <el-tab-pane name="at">
        <template #label>
          <span>提及我的</span>
          <el-badge
            v-show="count.unreadAtNotificationCnt > 0"
            :value="count.unreadAtNotificationCnt"
          />
        </template>
      </el-tab-pane>
      <el-tab-pane name="following">
        <template #label>
          <span>我关注的</span>
          <el-badge
            v-show="count.unreadFollowingNotificationCnt > 0"
            :value="count.unreadFollowingNotificationCnt"
          />
        </template>
      </el-tab-pane>
      <el-tab-pane name="broadcast">
        <template #label>
          <span>同城</span>
          <el-badge
            v-show="count.unreadBroadcastNotificationCnt > 0"
            :value="count.unreadBroadcastNotificationCnt"
          />
        </template>
      </el-tab-pane>
      <el-tab-pane name="sys-announce">
        <template #label>
          <span>系统</span>
          <el-badge
            v-show="
              count.unreadAtNotiunreadSysAnnounceNotificationCntficationCnt > 0
            "
            :value="count.unreadSysAnnounceNotificationCnt"
          />
        </template>
      </el-tab-pane>
    </el-tabs>
    <el-scrollbar
      id="notification-box"
      ref="scrollbarRef"
      height="480px"
      @scroll="scroll"
    >
      <template v-for="item in list" :key="item.oId">
        <el-row :class="{ read: item.hasRead }">
          <el-divider content-position="left" style="margin-top: 15px"
            ><a
              class="title"
              target="_blank"
              :href="getUrl(item[attributes.url])"
              >{{
                isAt ? attributes[item.dataType].title : item[attributes.title]
              }}</a
            ></el-divider
          >
          <el-row
            class="flex-cloumn avatar-cloumn"
            v-if="attributes.avatar || isAt"
          >
            <el-avatar
              size="default"
              :src="
                isAt
                  ? item[attributes[item.dataType].avatar]
                  : item[attributes.avatar]
              "
            ></el-avatar>
            <el-row>{{
              isAt
                ? item[attributes[item.dataType].userName]
                : item[attributes.userName]
            }}</el-row>
          </el-row>
          <el-row class="flex-cloumn content-cloumn">
            <el-row
              :class="
                onlyContent ? 'notification-html' : 'notification-content'
              "
              ><span
                v-html="
                  isAt
                    ? item[attributes[item.dataType].content]
                    : item[attributes.content]
                "
              ></span
            ></el-row>
            <el-row class="time">{{
              getDateTime(
                isAt
                  ? item[attributes[item.dataType].time]
                  : item[attributes.time]
              )
            }}</el-row>
          </el-row>
        </el-row>
      </template>
      <el-row class="tip" v-show="nodata">没有数据啦~</el-row>
      <icon-svg
        icon-class="top"
        class="top"
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
  makeReadNotifications,
} from '../api/notification'
import { getDateTime } from '../utils/util'
import { type } from '../constant/NotificationConstant'
import { Finished } from '@element-plus/icons-vue'

export default {
  name: 'Notification',
  components: { Finished },
  data() {
    return {
      tabsName: 'commented',
      page: 0,
      loadDisabled: true,
      list: [],
      type: type,
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
        unreadCommentedNotificationCnt: 0,
      },
      showTop: false,
      nodata: false,
      loading: false,
      userName: '',
      dialogVisible: false,
    }
  },
  computed: {
    ...mapGetters(['key']),
    apiKey() {
      return { apiKey: this.key }
    },
    params() {
      return { apiKey: this.key, type: this.tabsName, p: this.page }
    },
    attributes() {
      return this.type.get(this.tabsName)
    },
    isAt() {
      return this.tabsName === 'at'
    },
    onlyContent() {
      return this.tabsName === 'point' || this.tabsName === 'sys-announce'
    },
  },
  created() {
    this.getCountNotifications()
    this.load()
  },
  mounted() {
    document
      .getElementById('notification-box')
      .addEventListener('click', (event) => {
        let dom = event.target
        if (dom.tagName !== 'A') {
          return
        }
        if (dom.className === 'name-at') {
          dom.href='javascript:;'
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
      return url ? process.env.VUE_APP_BASE_URL + url : 'javascript:;'
    },
    goBack() {
      this.$router.push({ name: 'ChatRoom' })
    },
    backTop() {
      this.$refs.scrollbarRef.setScrollTop(0)
    },
    handleClick() {
      this.loading = true
      this.nodata = false
      this.page = 0
      this.list = []
      this.backTop()
      this.load()
    },
    scroll({ scrollTop }) {
      this.showTop = scrollTop > 100
      let height = this.$refs.scrollbarRef.wrap$.scrollHeight - 480
      if (!this.loading && scrollTop === height) {
        this.load()
      }
    },
    getCountNotifications() {
      countNotifications(this.apiKey).then((res) => {
        if (0 === res.code) {
          this.count = res
        }
      })
    },
    load() {
      if (this.nodata) {
        return
      }
      this.page += 1
      getNotifications(this.params).then((res) => {
        this.loading = false
        if (0 === res.code) {
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
      makeReadNotifications(this.tabsName, this.apiKey).then((res) => {
        if (0 === res.code) {
          this.getCountNotifications()
          this.handleClick()
        }
      })
    },
    getDateTime(str) {
      return getDateTime(str)
    },
  },
}
</script>

<style scoped>
.page-header {
  color: white;
  font-size: 15px;
}
.mark-notification {
  line-height: 28px;
  color: white;
  font-size: 14px;
  margin-right: 10px;
}
.mark-notification:hover {
  color: var(--el-color-primary);
}
.flex-cloumn {
  flex-direction: column;
  color: white;
  margin: 3px 0;
}
.content-cloumn {
  flex: 1;
  padding: 0 20px;
}
.avatar-cloumn {
  align-items: center;
  width: 100px;
  font-size: 15px;
}
.notification-content {
  padding: 3px 0;
  flex: 1;
}
.time {
  justify-content: flex-end;
}
.read {
  opacity: 0.5;
}
.title {
  max-width: 330px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  display: block;
  color: white;
  font-weight: bold;
  font-size: 15px;
}
.tip {
  font-size: 16px;
  height: 20px;
  margin-bottom: 10px;
  justify-content: center;
  color: white;
}
</style>
<style>
.notification-content a,
.notification-html a {
  color: white;
}
.notification-content * {
  max-width: 255px;
  overflow: auto;
  font-size: 14px;
}
.notification-html * {
  max-width: 355px;
  overflow: auto;
  font-size: 14px;
}
.el-page-header * {
  color: white;
}
.top {
  position: absolute;
  bottom: 25px;
  right: 20px;
  font-size: 36px;
}
</style>
