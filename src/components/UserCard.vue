<template>
  <el-dialog
    v-model="visible"
    width="380px"
    center
    :modal="false"
    :before-close="closeHandler"
  >
    <div class="background" :style="getBackgroundImage(userInfo.cardBg)">
      <el-row class="box" @click="goto">
        <el-row class="flex-column avatar-box">
          <el-avatar class="avatar" :src="userInfo.userAvatarURL"></el-avatar>
          <el-row class="column">
            <span>
              <medal class="svg-icon" />{{ userInfo.userNo }}号
              {{ userInfo.userAppRole == 0 ? '黑客' : '画家' }}</span
            >
          </el-row>
          <el-row class="column"
            ><span
              ><avatar class="svg-icon" />{{ userInfo.userRole }}</span
            ></el-row
          >
          <el-row class="column">
            <span><coin class="svg-icon" />{{ userInfo.userPoint }}</span>
            <span
              ><location-filled class="svg-icon" />{{ userInfo.userCity }}</span
            >
          </el-row>
        </el-row>

        <el-row class="flex-column info">
          <el-row class="name-column">
            <span class="name">{{
              userInfo.userNickname ? userInfo.userNickname : userInfo.userName
            }}</span>
            <span>{{ userInfo.userNickname ? userInfo.userName : '' }}</span>
          </el-row>
          <el-row style="height:20px;margin: 3px 5px;">
            <template v-if="userInfo.sysMetal">
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
            </template>
          </el-row>
          <el-row class="column intro">
            {{ userInfo.userIntro }}
          </el-row>
          <a class="column" @click="openUrl"> {{ userInfo.userURL }}</a>
        </el-row>
      </el-row>
    </div>
  </el-dialog>
</template>

<script>
import { toRefs } from 'vue'
import { Medal, Avatar, Coin, LocationFilled } from '@element-plus/icons-vue'

export default {
  name: 'userCard',
  components: {
    Medal,
    Avatar,
    Coin,
    LocationFilled,
  },
  props: {
    dialogVisible: Boolean,
    userInfo: Object,
  },
  emits: ['closeDialog'],
  setup(props) {
    const { dialogVisible: visible } = toRefs(props)
    return { visible }
  },
  methods: {
    getBackgroundImage(url) {
      return url
        ? "background-image:url('" + url + "')"
        : 'background-color: #1b4f8f;'
    },
    goto() {
      window.open(
        process.env.VUE_APP_BASE_URL + '/member/' + this.userInfo.userName
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
  },
}
</script>

<style scoped>
.background {
  background-size: cover;
  height: 150px;
  padding-top: 65px;
}
.box {
  height: 150px;
  align-items: flex-end;
  position: relative;
  color: white;
}
.flex-column {
  flex-direction: column;
  background-color: rgb(0 0 0 / 45%);
}
.avatar-box {
  width: 140px;
  height: 120px;
}
.svg-icon {
  margin-right: 5px;
}
.info {
  width: 240px;
  height: 120px;
}
.avatar {
  width: 80px;
  height: 80px;
  margin: -40px 0 6px 25px;
}
.name-column {
  height: 30px;
  line-height: 30px;
  position: absolute;
  top: -30px;
  text-shadow: black 0.1em 0.1em 0.1em;
}
.name {
  font-size: 16px;
  font-weight: bold;
  margin-right: 10px;
}
.column img {
  max-height: 20px;
}
.column {
  height: 20px;
  margin: 2px 0;
  padding: 0 10px;
  justify-content: space-between;
}
.intro {
  height: 60px;
  overflow: hidden;
}
</style>
<style>
.el-dialog {
  background-color: #333;
}
.el-dialog__header,
.el-dialog__body,
.el-dialog--center .el-dialog__body {
  padding: 0;
}
</style>
