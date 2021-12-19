<template>
  <el-dialog :visible.sync="dialogVisible"
             width="90%"
             center
             :modal="false"
             :before-close="closeHandler">
    <div class="background"
         :style="getBackgroundImage(userInfo.cardBg)">
      <el-row type="flex" class="box">
        <el-row type="flex"
                class="flex-column avatar-box">
          <el-avatar class="avatar"
                     :src="userInfo.userAvatarURL"></el-avatar>
          <el-row class="name">{{userInfo.userNickname ? userInfo.userNickname : userInfo.userName}}</el-row>
          <el-row class="column">{{userInfo.userNickname ? userInfo.userName : ''}}</el-row>
        </el-row>
        <el-row type="flex"
                class="flex-column info">
          <el-row class="intro">{{userInfo.userIntro ? userInfo.userIntro : '这人好懒什么都没写'}}</el-row>
          <a class="column" @click="openUrl">{{userInfo.userURL}}</a>
          <el-row class="column">
            <template v-if="userInfo.sysMetal">
              <img v-for="(item, index) in userInfo.sysMetal.list" :key="index"
              :src="'https://unv-shield.librian.net/api/unv_shield?scale=0.79&txt=' + item.name + '&' + item.attr" />
            </template>
          </el-row>
          <el-row type="flex"
                  class="column">
            <span><i class="el-icon-user-solid"></i>{{userInfo.userRole}}</span>
            <span><i class="el-icon-s-finance"></i>{{userInfo.userPoint}}</span>
            <span><i class="el-icon-location"></i>{{userInfo.userCity}}</span>
          </el-row>
        </el-row>
      </el-row>
    </div>
  </el-dialog>

</template>

<script>
export default {
  name: "userCard",
  props: {
    dialogVisible: Boolean,
    userInfo: Object,
  },
  methods: {
    getBackgroundImage(url) {
      return url ? "padding-top: 25px;background-image:url('" + url + "')" : "";
    },
    openUrl() {
      if (this.userInfo.userURL) {
        window.open(this.userInfo.userURL);
      }
    },
    closeHandler() {
      this.$emit("closeDialog");
    },
  },
};
</script>

<style scoped>
.background {
  background-size: cover;
}
.box {
  height: 100px;
  margin-top: 50px;
  align-items: flex-end;
}
.flex-column {
  flex-direction: column;
  background-color: rgb(0 0 0 / 40%);
}
.avatar-box {
  width: 150px;
  height: 100px;
  text-align: center;
  font-size: 12px;
}
.avatar {
  width: 60px;
  height: 60px;
  margin: 10px auto;
  margin-top: -30px;
}
.name {
  height: 40px;
  font-size: 15px;
  font-weight: bold;
  line-height: 40px;
}
.info {
  width: 100%;
}
.info .column {
  padding: 0 20px;
}
.intro {
  height: 40px;
  text-align: center;
}
.column img {
  max-height: 20px;
}
.column {
  height: 20px;
  justify-content: space-between;
  overflow:hidden;
  text-overflow:ellipsis;
}
.center {
  align-self: center;
}
</style>
<style>
.el-dialog__header, .el-dialog__body, .el-dialog--center .el-dialog__body {
  padding: 0;
}
</style>