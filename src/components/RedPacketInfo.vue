<template>
  <el-dialog
    :title="info.info.userName"
    :visible.sync="dialogVisible"
    width="70%"
    :show-close="false"
    :before-close="close"
    center
  >
    <el-row type="flex" class="flex-column">
      <el-avatar :src="info.info.userAvatarURL"></el-avatar>
      <el-row class="item">{{ info.info.msg }}</el-row>
      <el-row class="count">{{
        (info.info.got >= info.info.count ? '总计: ' : '已抢: ') + count
      }}</el-row>
      <el-row v-if="reciverMessage">
        {{ reciverMessage }}
      </el-row>
      <div class="who-box">
        <el-row
          class="item"
          type="flex"
          v-for="(item, index) in info.who"
          :key="index"
        >
          <el-row type="flex">
            <el-avatar
              class="item-avatar"
              :size="35"
              :src="item.avatar"
            ></el-avatar>
            <el-row type="flex" class="flex-column user">
              <el-row class="text">{{ item.userName }}</el-row>
              <el-row class="time">{{ item.time }}</el-row>
            </el-row>
          </el-row>

          <el-row type="flex" class="flex-column">
            <el-row
              :class="'money' + (item.userMoney > 0 ? ' red' : ' green')"
              >{{ item.userMoney }}</el-row
            >
            <el-row
              v-if="item.showMessage || item.userMoney === max"
              class="text"
              >{{ item.showMessage ? item.showMessage : '手气最佳' }}</el-row
            >
          </el-row>
        </el-row>
      </div>
    </el-row>
  </el-dialog>
</template>

<script>
export default {
  name: 'redPacket',
  props: {
    info: Object,
    dialogVisible: Boolean,
    userInfo: Object,
  },
  data() {
    return {
      reciverMessage: '',
      max: 0,
      count: 0,
    }
  },
  watch: {
    info(val) {
      if (
        val.recivers &&
        !val.recivers.some((e) => e === this.userInfo.userName)
      ) {
        this.reciverMessage = '终究还是错付了'
      }
      let max = 0
      let count = 0
      val.who.forEach((e) => {
        max = Math.max(max, e.userMoney)
        count += e.userMoney
        e.showMessage = this.showMessage(e.userMoney)
      })
      this.max = max
      this.count = count
    },
  },
  methods: {
    showMessage(userMoney) {
      return userMoney > 0 ? null : userMoney === 0 ? '抢个寂寞' : '破财消灾'
    },
    close() {
      this.$emit('close')
    },
  },
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
  text-align: center;
  max-width: 80%;
}
.count {
  font-size: 16px;
}
.who-box {
  max-height: 280px;
  overflow: auto;
}
.user {
  width: 150px;
}
.item-avatar {
  align-self: center;
}
.text {
  font-size: 14px;
}
.time {
  font-size: 12px;
}
.red {
  color: rgb(236, 55, 55);
}
.green {
  color: rgb(11, 219, 11);
}
.money {
  width: 80px;
  font-size: 18px;
  font-weight: bolder;
}
</style>
