<template>
  <el-row class="avatar">
    <el-dropdown @command="handleCommand">
      <el-progress
        type="circle"
        :percentage="percentage"
        :width="50"
        :color="colors"
        :show-text="false"
      >
        <el-badge
          :value="unreadNotifications + unreadChat"
          :hidden="unreadNotifications + unreadChat === 0"
        >
          <el-avatar size="default" :src="userInfo.userAvatarURL"></el-avatar>
        </el-badge>
      </el-progress>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="openHome">
            <house class="svg-icon" />
            主 页
            <el-badge> </el-badge>
          </el-dropdown-item>
          <el-dropdown-item command="openChat">
            <chat-round class="svg-icon" />
            私 聊
            <el-badge :value="unreadChat" :hidden="unreadChat === 0">
            </el-badge>
          </el-dropdown-item>
          <el-dropdown-item command="openArticle">
            <house class="svg-icon" />
            看 贴
            <el-badge> </el-badge>
          </el-dropdown-item>
          <el-dropdown-item command="openNotifications">
            <bell class="svg-icon" />
            通 知
            <el-badge
              :value="unreadNotifications"
              :hidden="unreadNotifications === 0"
            >
            </el-badge>
          </el-dropdown-item>
          <el-dropdown-item command="showSetting">
            <setting class="svg-icon" />
            设 置
          </el-dropdown-item>
          <el-dropdown-item command="logout">
            <switch-button class="svg-icon" />
            登 出
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <!-- 设置 -->
    <el-drawer
      title="设置"
      v-model="drawer"
      direction="ttb"
      :with-header="false"
      destroy-on-close
      size="auto"
    >
      <el-tabs>
        <el-tab-pane label="基础设置">
          <el-row class="option-row">
            <el-col :span="10" :offset="2">
              <el-switch
                v-model="options.atNotification"
                active-color="#13ce66"
                @change="optionsChange"
              />
              <span class="option-text">被@时通知</span>
            </el-col>
            <el-col :span="10" :offset="2">
              <el-switch
                v-model="options.showUnReadCount"
                active-color="#13ce66"
                @change="optionsChange"
              />
              <span class="option-text">图标显示消息数</span>
            </el-col>
          </el-row>
          <el-row class="option-row">
            <el-col :span="10" :offset="2">
              <el-switch
                v-model="options.hideRedPacketMessage"
                active-color="#13ce66"
                @change="optionsChange"
              />
              <span class="option-text">隐藏红包领取</span>
            </el-col>
            <el-col :span="10" :offset="2">
              <el-switch
                v-model="options.hideBlockquote"
                active-color="#13ce66"
                @change="optionsChange"
              />
              <span class="option-text">隐藏小尾巴</span>
            </el-col>
          </el-row>
          <el-row class="option-row">
            <el-col :span="10" :offset="2">
              <el-switch
                v-model="options.autoReadAtNotification"
                active-color="#13ce66"
                @change="optionsChange"
              />
              <span class="option-text">自动已读被@通知</span>
            </el-col>
            <el-col :span="10" :offset="2">
              <el-switch
                v-model="options.autoReadPointNotification"
                active-color="#13ce66"
                @change="optionsChange"
              />
              <span class="option-text">自动已读积分通知</span>
            </el-col>
          </el-row>
        </el-tab-pane>
        <el-tab-pane label="弹幕设置">
          <el-row class="option-row">
            <el-col :span="10" :offset="2">
              <el-switch
                v-model="options.barrageOptions.enable"
                active-color="#13ce66"
                @change="optionsChange"
              />
              <el-tooltip placement="bottom">
                <template #content>
                  在网页上以弹幕的形式显示聊天消息<br />开启后需要刷新页面才会显示
                </template>
                <span class="option-text">弹幕消息</span>
              </el-tooltip>
            </el-col>
          </el-row>
          <template v-if="options.barrageOptions.enable">
            <el-row class="option-row">
              <el-col :span="10" :offset="2">
                <el-input-number
                  v-model="options.barrageOptions.fontSize"
                  @change="optionsChange"
                  size="small"
                  :min="6"
                  :max="30"
                ></el-input-number>
                <span class="option-text">字体</span>
              </el-col>
              <el-col :span="10" :offset="2">
                <el-input-number
                  v-model="options.barrageOptions.opacity"
                  @change="optionsChange"
                  :precision="1"
                  :step="0.1"
                  :min="0.1"
                  :max="1"
                  size="small"
                ></el-input-number>
                <span class="option-text">透明度</span>
              </el-col>
            </el-row>
            <el-row class="option-row">
              <el-col :span="10" :offset="2">
                <el-color-picker
                  v-model="options.barrageOptions.color"
                  @change="optionsChange"
                  size="small"
                ></el-color-picker>
                <span class="option-text">字体颜色</span>
              </el-col>
            </el-row>
          </template>
        </el-tab-pane>
        <el-tab-pane label="黑名单">
          <el-row>
            <user-select :user="options.blacklist" @change="blacklistChange" />
          </el-row>
        </el-tab-pane>
        <el-tab-pane label="特别关心">
          <el-row>
            <user-select :user="options.care" @change="careChange" />
          </el-row>
        </el-tab-pane>
      </el-tabs>
    </el-drawer>
  </el-row>
</template>

<script>
import { mapGetters } from 'vuex'
import {
  liveness,
  isCollectedLiveness,
  getLivenessReward
} from '@/popup/api/user'
import { unread } from '@/popup/api/chat'
import {
  countNotifications,
  makeReadNotifications
} from '@/popup/api/notification'
import { STORAGE, defaultOptions, EVENT } from '@/common/constant/Constant'
import { getDate } from '@/common/utils/util'
import { clean } from '@/common/manager/StorageManager'
import {
  setLocal,
  getLocal,
  setSync,
  getOptions,
  formatOptions
} from '@/common/utils/chromeUtil'
import {
  House,
  Bell,
  ChatRound,
  Setting,
  SwitchButton
} from '@element-plus/icons-vue'

const REQUEST_INTERVAL = 40000
/**
 * 左上角用户信息(活跃度进度条，下拉菜单)
 */
export default {
  name: 'userInfo',
  inject: ['$message'],
  components: {
    House,
    Bell,
    ChatRound,
    Setting,
    SwitchButton
  },
  data() {
    return {
      percentage: 0,
      intervalId: null,
      colors: [
        { color: '#f56c6c', percentage: 10 },
        { color: '#1989fa', percentage: 100 }
      ],
      unreadNotifications: 0,
      unreadChat: 0,
      drawer: false,
      options: defaultOptions
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'key']),
    apiKey() {
      return { apiKey: this.key }
    }
  },
  async created() {
    // 获取活跃度
    getLocal([STORAGE.liveness], (res) => {
      const storage = res[STORAGE.liveness] ?? {}
      const date = getDate()
      if (storage && date === storage.date) {
        this.initLiveness(storage)
        return
      }
      this.getLivenessReward(() => {
        storage.date = date
        storage.percentage = 0
        this.initLiveness(storage)
      })
    })
    // 获取设置
    this.options = formatOptions(await getOptions())
    this.countNotifications()
    this.getUnreadChat()
  },
  beforeUnmount() {
    if (this.intervalId) {
      window.clearInterval(this.intervalId)
    }
  },
  methods: {
    initLiveness(storage) {
      this.percentage = storage.percentage ?? 0
      if (
        storage.percentage >= 100 ||
        (storage.time && new Date().getTime() - storage.time < REQUEST_INTERVAL)
      ) {
        return
      }
      this.getLiveness(storage)
      this.intervalId = window.setInterval(() => {
        if (storage.percentage >= 100) {
          window.clearInterval(this.intervalId)
          return
        }
        this.getLiveness(storage)
      }, REQUEST_INTERVAL)
    },
    getLiveness(storage) {
      liveness(this.apiKey).then((res) => {
        storage.percentage = res.liveness
        storage.time = new Date().getTime()
        setLocal({ [STORAGE.liveness]: storage })
        this.percentage = res.liveness
      })
    },
    getLivenessReward(fun) {
      isCollectedLiveness(this.apiKey).then((res) => {
        if (res.isCollectedYesterdayLivenessReward) {
          this.$message.success('昨日活跃积分已领取')
          fun()
          return
        }
        getLivenessReward(this.apiKey).then((r) => {
          this.$message.success('领取昨日活跃积分:' + r.sum)
          fun()
        })
      })
    },
    async countNotifications() {
      const res = await countNotifications(this.apiKey)
      if (res.code !== 0) {
        return
      }
      let count = res.unreadNotificationCnt
      if (this.options.autoReadAtNotification) {
        count -= res.unreadAtNotificationCnt
      }
      if (this.options.autoReadPointNotification) {
        count -= res.unreadPointNotificationCnt
      }
      this.unreadNotifications = count
      if (
        this.options.autoReadAtNotification &&
        res.unreadAtNotificationCnt > 0
      ) {
        makeReadNotifications('at', this.apiKey).then()
      }
      if (
        this.options.autoReadPointNotification &&
        res.unreadPointNotificationCnt > 0
      ) {
        makeReadNotifications('point', this.apiKey).then()
      }
    },
    async getUnreadChat() {
      const res = await unread(this.apiKey)
      this.unreadChat = res.data.length
    },
    handleCommand(command) {
      this[command]()
    },
    openHome() {
      window.open(process.env.VUE_APP_BASE_URL)
    },
    openChat() {
      this.$router.push({ name: 'PrivateChatList' })
    },
    openArticle() {
      this.$router.push({ name: 'ArticleList' })
    },
    openNotifications() {
      this.$router.push({ name: 'Notification' })
    },
    showSetting() {
      this.drawer = true
    },
    logout() {
      /* global chrome */
      chrome.runtime.sendMessage({ type: EVENT.LOGIN_OUT })
      clean()
      this.$router.push({ name: 'Login' })
    },
    blacklistChange(val) {
      this.options.blacklist = val
      this.optionsChange()
    },
    careChange(val) {
      this.options.care = val
      this.optionsChange()
    },
    optionsChange() {
      const options = { ...this.options }
      options.blacklist = JSON.stringify(options.blacklist)
      options.care = JSON.stringify(options.care)
      setSync({ [STORAGE.options]: options })
    }
  }
}
</script>

<style scoped>
.avatar {
  width: 60px;
  height: 40px;
}
.option-row {
  margin-bottom: 20px;
  align-items: center;
}
.option-text {
  margin-left: 3px;
}
.svg-icon {
  margin-right: 5px;
}
</style>
<style>
.el-progress--without-text .el-progress__text {
  display: block !important;
}
.el-progress--circle .el-progress__text,
.el-progress--dashboard .el-progress__text {
  top: 26px !important;
}
.el-dropdown-menu,
.el-drawer__body {
  background-color: #333333;
  color: white;
}
.el-dropdown-menu__item:focus,
.el-dropdown-menu__item:not(.is-disabled):hover {
  background-color: #8f8f8f;
}
.el-drawer__body {
  padding: 20px 10px;
}
.el-tabs__item {
  color: white;
}
.el-input-number--mini {
  width: 100px;
}
</style>
