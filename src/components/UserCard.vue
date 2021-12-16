<template>
  <el-dialog :visible.sync="dialogVisible"
             width="90%"
             center
             :modal="false"
             @close="handleClose">
    <div class="background"
         :style="getBackgroundImage(userInfo.cardBg)">
      <el-row type="flex" class="box">
        <el-row type="flex"
                class="flex-column avatar-box">
          <el-avatar class="avatar"
                     :src="userInfo.userAvatarURL"></el-avatar>
          <el-row class="column">{{userInfo.userNickname ? userInfo.userNickname : userInfo.userName}}</el-row>
        </el-row>
        <el-row type="flex"
                class="flex-column info">
          <el-row class="intro">{{userInfo.userIntro ? userInfo.userIntro : '这人好懒什么都没写'}}</el-row>
          <el-row type="flex"
                  class="column">
            <span><i class="el-icon-s-finance"></i>{{userInfo.userPoint}}</span>
            <span><i class="el-icon-map-location"></i>{{userInfo.userCity}}</span>
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
      return "background-image:url('" + url + "')";
    },
    handleClose() {
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
  height: 150px;
  align-items: center;
}
.flex-column {
  flex-direction: column;
  background-color: rgb(0 0 0 / 30%);
}
.avatar-box {
  width: 150px;
  text-align: center;
}
.avatar {
  width: 50px;
  height: 50px;
  margin: 0 auto;
}
.info {
  width: 100%;
}
.info .column {
  padding: 0 20px;
}
.intro {
  height: 50px;
}
.column {
  height: 20px;
  justify-content: space-between;
}
</style>
<style>
.el-dialog__header, .el-dialog__body, .el-dialog--center .el-dialog__body {
  padding: 0;
}
</style>