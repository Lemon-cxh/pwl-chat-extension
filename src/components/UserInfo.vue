<template>
  <el-row class="avatar">
    <el-dropdown trigger="click">
      <el-badge :value="unreadCount" :hidden="unreadCount == 0">
        <el-avatar :src="userInfo.userAvatarURL"></el-avatar>
      </el-badge>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item @click.native="openNotifications">
          <i class="el-icon-message-solid" />
          通 知
          <el-badge :value="unreadCount" :hidden="unreadCount == 0" />
        </el-dropdown-item>
        <el-dropdown-item @click.native="drawer = true">
          <i class="el-icon-s-tools" />
          设 置
        </el-dropdown-item>
        <el-dropdown-item @click.native="logout">
          <i class="el-icon-switch-button" />
          登 出
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>

    <!-- 设置 -->
    <el-drawer
      title="设置"
      :visible.sync="drawer"
      direction="ttb"
      :size="60"
      :with-header="false"
    >
      <el-row type="flex" justify="space-around">
        <el-row type="flex" class="option-item">
          <el-switch
            v-model="options.atNotification"
            active-color="#13ce66"
            @change="optionsChange"
          />
          <span class="option-text">后台@通知</span>
        </el-row>
        <el-row type="flex" class="option-item">
          <el-switch
            v-model="options.barrageMessage"
            active-color="#13ce66"
            @change="optionsChange"
          />
          <span class="option-text">弹幕消息</span>
        </el-row>
        <el-row type="flex" class="option-item">
          <el-switch
            v-model="options.plusOne"
            active-color="#13ce66"
            @change="optionsChange"
          />
          <span class="option-text">自动+1</span>
        </el-row>
      </el-row>
    </el-drawer>
  </el-row>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import { countNotifications, makeReadAtNotifications } from '../api/user'
import { STORAGE, defaultOptions } from '../constant/Constant'
import { setLocal, getSync, setSync } from '../utils/chromeUtil'

export default {
  name: 'userInfo',
  data() {
    return {
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
    getSync({[STORAGE.options]: defaultOptions}, result => {
      this.options = result.options;
      this.$emit('syncOptions', result.options)
    })
    this.countNotifications()
  },
  methods: {
    ...mapMutations(['clearMessage']),
    countNotifications() {
      countNotifications(this.apiKey).then((res) => {
        if (0 !== res.code) {
          return
        }
        this.unreadCount =
          res.unreadNotificationCnt - res.unreadAtNotificationCnt
        if (res.unreadAtNotificationCnt > 0) {
          makeReadAtNotifications(this.apiKey).then()
        }
      })
    },
    openNotifications() {
      window.open(process.env.VUE_APP_BASE_URL + '/notifications/commented')
    },
    logout() {
      chrome.extension.getBackgroundPage().closeSocket()
      setLocal({ [STORAGE.key]: '' })
      this.clearMessage()
      this.$router.push({ name: 'Login' })
    },
    optionsChange() {
      setSync({[STORAGE.options]: this.options})
      this.$emit('syncOptions', this.options)
    },
  },
}
</script>

<style scoped>
.avatar {
  width: 60px;
  height: 40px;
  margin-right: 5px;
}
.option-item {
  height: 20px;
  align-items: center;
}
.option-text {
  margin-left: 3px;
}
</style>
<style>
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
  padding: 20px 0;
}
</style>
