<template>
  <el-dialog
    :title="info.info.userName"
    v-model="visible"
    width="70%"
    :show-close="false"
    :before-close="close"
    center
    class="red-packet-dialog"
  >
    <div class="red-packet-container">
      <div class="header">
        <el-avatar
          :src="info.info.userAvatarURL"
          :size="56"
          class="avatar"
        ></el-avatar>
        <div class="info">
          <div class="message">{{ info.info.msg }}</div>
          <div class="count">
            {{
              (info.info.got >= info.info.count ? "总计: " : "已抢: ") + count
            }}
          </div>
        </div>
      </div>

      <div v-if="info.info.gesture != undefined" class="gesture">
        <span>{{ info.info.userName }} 出了: </span>
        <span class="gesture-value">{{
          info.info.gesture === 0
            ? "石头"
            : info.info.gesture === 1
            ? "剪刀"
            : "布"
        }}</span>
      </div>

      <div v-if="message" class="result">
        {{ message }}
      </div>

      <div class="list">
        <div v-for="(item, index) in info.who" :key="index" class="list-item">
          <el-avatar
            class="item-avatar"
            :size="36"
            :src="item.avatar"
          ></el-avatar>
          <div class="item-info">
            <div class="name">{{ item.userName }}</div>
            <div class="time">{{ item.time }}</div>
          </div>
          <div class="item-money">
            <div :class="['amount', item.userMoney > 0 ? 'red' : 'green']">
              {{ item.userMoney }}
            </div>
            <div v-if="item.showMessage || item.userMoney === max" class="tag">
              {{ item.showMessage ? item.showMessage : "手气最佳" }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { toRefs } from 'vue'
/**
 * 红包详情组件
 */
export default {
  name: 'red-packet',
  props: {
    info: Object,
    dialogVisible: Boolean,
    userInfo: Object
  },
  emits: ['close'],
  setup(props) {
    const { dialogVisible: visible } = toRefs(props)
    return { visible }
  },
  data() {
    return {
      message: '',
      max: 0,
      count: 0
    }
  },
  watch: {
    info(val) {
      const userName = this.userInfo.userName
      let max = 0
      let count = 0
      const info = {
        has: false,
        userMoney: 0
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
    }
  },
  methods: {
    showMessage(userMoney) {
      return userMoney > 0 ? null : userMoney === 0 ? '抢个寂寞' : '破财消灾'
    },
    close() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.red-packet-dialog :deep(.el-dialog) {
  background: #1a1a1a;
  border-radius: 8px;
}

.red-packet-dialog :deep(.el-dialog__title) {
  color: #fff;
}

.red-packet-container {
  padding: 16px;
  color: #e0e0e0;
}

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.avatar {
  margin-bottom: 12px;
  border: 2px solid #333;
}

.info {
  text-align: center;
}

.message {
  font-size: 16px;
  color: #fff;
  margin-bottom: 6px;
}

.count {
  font-size: 14px;
  color: #999;
}

.gesture {
  text-align: center;
  margin: 12px 0;
  padding: 8px;
  background: #2a2a2a;
  border-radius: 4px;
  font-size: 14px;
  color: #999;
}

.gesture-value {
  color: #fff;
  font-weight: 500;
}

.result {
  text-align: center;
  margin: 12px 0;
  padding: 8px;
  background: #2a2a2a;
  border-radius: 4px;
  color: #fff;
  font-size: 14px;
}

.list {
  max-height: 200px;
  overflow-y: auto;
  margin-top: 16px;
}

.list::-webkit-scrollbar {
  width: 4px;
}

.list::-webkit-scrollbar-thumb {
  background: #333;
  border-radius: 2px;
}

.list-item {
  display: flex;
  align-items: center;
  padding: 8px;
  margin-bottom: 8px;
  background: #2a2a2a;
  border-radius: 4px;
}

.item-avatar {
  margin-right: 12px;
}

.item-info {
  flex: 1;
}

.name {
  font-size: 14px;
  color: #fff;
  margin-bottom: 2px;
}

.time {
  font-size: 12px;
  color: #666;
}

.item-money {
  text-align: right;
  min-width: 70px;
}

.amount {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 2px;
}

.tag {
  font-size: 12px;
  color: #999;
}

.red {
  color: #ff4d4f;
}

.green {
  color: #52c41a;
}
</style>
