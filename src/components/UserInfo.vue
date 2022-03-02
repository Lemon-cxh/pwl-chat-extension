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
        <el-badge :value="unreadCount" :hidden="unreadCount == 0">
          <el-avatar size="default" :src="userInfo.userAvatarURL"></el-avatar>
        </el-badge>
      </el-progress>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="openNotifications">
            <bell class="svg-icon" />
            通 知
            <el-badge :value="unreadCount" :hidden="unreadCount == 0">
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
          <el-row justify="space-around">
            <el-row class="option-item">
              <el-switch
                v-model="options.atNotification"
                active-color="#13ce66"
                @change="optionsChange"
              />
              <span class="option-text">被@通知</span>
            </el-row>
            <el-row class="option-item">
              <el-switch
                v-model="options.barrageOptions.enable"
                active-color="#13ce66"
                @change="optionsChange"
              />
              <span class="option-text">弹幕消息</span>
            </el-row>
          </el-row>
        </el-tab-pane>
        <el-tab-pane label="弹幕设置">
          <el-row justify="space-between" class="option-row">
            <el-row class="option-item">
              <el-input-number
                v-model="options.barrageOptions.fontSize"
                @change="optionsChange"
                size="small"
                :min="6"
                :max="30"
              ></el-input-number>
              <span class="option-text">字体大小</span>
            </el-row>
            <el-row class="option-item">
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
            </el-row>
          </el-row>
          <el-row class="option-row">
            <el-row class="option-item">
              <el-color-picker
                v-model="options.barrageOptions.color"
                @change="optionsChange"
                size="small"
              ></el-color-picker>
              <span class="option-text">字体颜色</span>
            </el-row>
          </el-row>
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
import { mapGetters, mapMutations } from 'vuex'
import { liveness, isCollectedLiveness, getLivenessReward } from '../api/user'
import { countNotifications, makeReadNotifications } from '../api/notification'
import { STORAGE, defaultOptions } from '../constant/Constant'
import { getDate } from '../utils/util'
import { setLocal, getLocal, getSync, setSync } from '../utils/chromeUtil'
import { Bell, Setting, SwitchButton } from '@element-plus/icons-vue'

const REQUEST_INTERVAL = 30000

export default {
  name: 'userInfo',
  inject: ['$message'],
  components: {
    Bell,
    Setting,
    SwitchButton,
  },
  emits: ['syncOptions'],
  data() {
    return {
      percentage: 0,
      intervalId: null,
      colors: [
        { color: '#f56c6c', percentage: 10 },
        { color: '#1989fa', percentage: 100 },
      ],
      unreadCount: 0,
      drawer: false,
      options: defaultOptions,
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'key']),
    apiKey() {
      return { apiKey: this.key }
    },
  },
  created() {
    getLocal([STORAGE.liveness], (res) => {
      let storage = res[STORAGE.liveness] ? res[STORAGE.liveness] : {}
      let date = getDate()
      if (storage && date === storage.date) {
        this.init(storage)
        return
      }
      this.getLivenessReward(() => {
        storage.date = date
        storage.percentage = 0
        this.init(storage)
      })
    })
    getSync({ [STORAGE.options]: defaultOptions }, (result) => {
      if (result.options.blacklist) {
        result.options.blacklist = JSON.parse(result.options.blacklist)
      }
      if (result.options.care) {
        result.options.care = JSON.parse(result.options.care)
      }
      this.options = result.options
    })
    this.countNotifications()
  },
  beforeUnmount() {
    if (this.intervalId) {
      window.clearInterval(this.intervalId)
    }
  },
  methods: {
    ...mapMutations(['clearMessage']),
    init(storage) {
      this.percentage = storage.percentage ? storage.percentage : 0
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
    countNotifications() {
      countNotifications(this.apiKey).then((res) => {
        if (0 !== res.code) {
          return
        }
        this.unreadCount =
          res.unreadNotificationCnt - res.unreadAtNotificationCnt
        if (res.unreadAtNotificationCnt > 0) {
          makeReadNotifications('at', this.apiKey).then()
        }
      })
    },
    handleCommand(command) {
      this[command]()
    },
    openNotifications() {
      this.$router.push({ name: 'Notification' })
    },
    showSetting() {
      this.drawer = true
    },
    logout() {
      chrome.extension.getBackgroundPage().closeSocket()
      setLocal({ [STORAGE.key]: '' })
      this.clearMessage()
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
      let options = { ...this.options }
      this.$emit('syncOptions', this.options)
      options.blacklist = JSON.stringify(options.blacklist)
      options.care = JSON.stringify(options.care)
      setSync({ [STORAGE.options]: options })
    },
  },
}
</script>

<style scoped>
.avatar {
  width: 60px;
  height: 40px;
}
.option-row {
  margin-bottom: 20px;
  padding: 0 20px;
}
.option-item {
  height: 30px;
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
