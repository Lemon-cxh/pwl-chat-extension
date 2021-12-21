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
          <el-avatar class="item-avatar"
                     :size="35"
                     :src="item.avatar"></el-avatar>
          <el-row type="flex"
                  class="flex-column user">
            <el-row class="text">{{item.userName}}</el-row>
             <el-row class="text">{{item.time.substr(11)}}</el-row>
          </el-row>
          <el-row type="flex"
                  class="flex-column">
            <el-row :class="'money' + (item.userMoney > 0 ? ' red' : ' green')">{{item.userMoney}}</el-row>
            <el-row class="text">{{item.userMoney == 0 ? '抢了个寂寞' : (item.userMoney > 0 ? '' : '被反抢了吧')}}</el-row>
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
    dialogVisible: Boolean
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
  justify-content: space-between;
}
.item {
  margin: 5px 0;
  width: 230px;
  justify-content: space-between;
  text-align: center;
  height: 35px;
}
.user {
  width: 100px;
}
.item-avatar {
  width: 30px;
  height: 30px;
}
.text {
  font-size: 14px;
}
.red {
  color: rgb(236, 55, 55);
}
.green {
  color: rgb(11, 219, 11);
}
.money {
  width: 80px;
  font-size: 16px;
  font-weight: bolder;
}
</style>