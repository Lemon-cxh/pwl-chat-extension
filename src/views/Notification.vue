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
      <el-tab-pane v-for="item in typeArray" :key="item.name" :name="item.name">
        <template #label>
          <span>{{ item.title }}</span>
          <el-badge v-show="count[item.count] > 0" :value="count[item.count]" />
        </template>
      </el-tab-pane>
    </el-tabs>
    <el-scrollbar
      id="notification-box"
      ref="notificationScrollbar"
      height="480px"
      @scroll="scroll"
    >
      <el-row
        v-for="item in list"
        :key="item.oId"
        :class="{ read: item.hasRead }"
      >
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
            :class="onlyContent ? 'notification-html' : 'notification-content'"
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
      <el-empty
        v-show="!loading && list.length === 0"
        class="dark-mode"
      ></el-empty>
      <el-row class="tip" v-show="list.length > 0 && nodata"
        >没有数据啦~</el-row
      >
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
} from '../api/notification'
import { getDateTime } from '../utils/util'
import { type, typeArray } from '../constant/NotificationConstant'
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
      type,
      typeArray,
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
    handleClick() {
      this.nodata = false
      this.page = 0
      this.list = []
      this.backTop()
      this.load()
    },
    scroll({ scrollTop }) {
      this.showTop = scrollTop > 100
      const height = this.$refs.notificationScrollbar.wrap$.scrollHeight - 480
      if (!this.loading && scrollTop === height) {
        this.load()
      }
    },
    getCountNotifications() {
      countNotifications(this.apiKey).then((res) => {
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
      makeReadNotifications(this.tabsName, this.apiKey).then((res) => {
        if (res.code === 0) {
          this.getCountNotifications()
          this.handleClick()
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
</style>
