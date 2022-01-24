<template>
  <el-dialog
    :title="info.info.userName"
    v-model="visible"
    width="70%"
    :show-close="false"
    :before-close="close"
    center
  >
    <el-row class="flex-column">
      <el-avatar :src="info.info.userAvatarURL"></el-avatar>
      <el-row class="item">{{ info.info.msg }}</el-row>
      <el-row class="count">{{
        (info.info.got >= info.info.count ? '总计: ' : '已抢: ') + count
      }}</el-row>
      <el-row v-if="message">
        {{ message }}
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
            <el-row class="flex-column user">
              <el-row class="text">{{ item.userName }}</el-row>
              <el-row class="time">{{ item.time }}</el-row>
            </el-row>
            <el-row class="flex-column money-column">
              <el-row
                :class="['money', item.userMoney > 0 ? 'red' : 'green']"
                >{{ item.userMoney }}</el-row
              >
              <el-row
                v-if="item.showMessage || item.userMoney === max"
                class="text"
                >{{ item.showMessage ? item.showMessage : '手气最佳' }}</el-row
              >
            </el-row>
          </el-row>
        </el-row>
      </div>
    </el-row>
  </el-dialog>
</template>

<script>
import { toRefs } from 'vue'
export default {
  name: 'redPacket',
  props: {
    info: Object,
    dialogVisible: Boolean,
    userInfo: Object,
  },
  emits: ['close'],
  data() {
    return {
      message: '',
      max: 0,
      count: 0,
    }
  },
  setup(props) {
    const { dialogVisible: visible } = toRefs(props)
    return { visible }
  },
  watch: {
    info(val) {
      let userName = this.userInfo.userName
      let max = 0
      let count = 0
      let info = {
        has: false,
        userMoney: 0,
      }
      val.who.forEach((e) => {
        max = Math.max(max, e.userMoney)
        count += e.userMoney
        e.showMessage = this.showMessage(e.userMoney)
        if (e.userName === userName) {
          info.has = true
          info.userMoney = e.userMoney
        }
      })
      this.max = max
      this.count = count
      if (info.has) {
        this.message = `抢到了${info.userMoney}积分`
        return
      }
      this.message =
        val.recivers &&
        val.recivers.length > 0 &&
        !val.recivers.some((e) => e === userName)
          ? '终究还是错付了'
          : '很遗憾，没有抢到'
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
  color: white;
}
.item {
  margin: 5px 0;
  text-align: center;
}
.count {
  font-size: 16px;
  margin-bottom: 3px;
}
.who-box {
  max-height: 285px;
  overflow: auto;
  border-top: 1px solid;
  margin-top: 3px;
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
.money-column {
  width: 80px;
}
.money {
  font-size: 18px;
  font-weight: bolder;
}
</style>
