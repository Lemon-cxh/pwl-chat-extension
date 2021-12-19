<template>
  <el-dialog :title="info.info.userName"
               :visible.sync="dialogVisible"
               width="60%"
               :show-close="false"
               :before-close="close"
               center>
      <el-row type="flex"
              class="flex-column">
        <el-avatar :src="info.info.userAvatarURL"></el-avatar>
        <el-row class="item">{{info.info.msg}}</el-row>
        <el-row class="item"
                type="flex"
                v-for="(item, index) in info.who"
                :key="index">
          <el-row type="flex"
                  class="flex-column user">
            <el-avatar class="item-avatar"
                       :src="item.avatar"></el-avatar>
            <el-row class="text">{{item.userName}}</el-row>
          </el-row>
          <el-row type="flex"
                  class="flex-column">
            <el-row class="money">{{item.userMoney}}</el-row>
            <el-row class="text">{{item.time}}</el-row>
          </el-row>
        </el-row>
      </el-row>
    </el-dialog>
</template>

<script>
export default {
  name: "redPacket",
  props: {
    info: Object,
  },
  data() {
    return {
      dialogVisible: true,
    };
  },
  methods: {
    close() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.flex-column {
  flex-direction: column;
  align-items: center;
}
.item {
  margin: 5px 0;
  width: 200px;
  justify-content: space-between;
  text-align: center;
}
.user {
  width: 70px;
}
.item-avatar {
  width: 20px;
  height: 20px;
}
.text {
  font-size: 9px;
}
.money {
  font-size: 16px;
  font-weight: bolder;
}
</style>