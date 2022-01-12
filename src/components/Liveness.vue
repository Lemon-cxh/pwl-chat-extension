<template>
  <el-progress
    class="progress"
    type="circle"
    :percentage="percentage"
    width="48"
    :color="colors"
    :show-text="false"
  >
    <slot></slot>
  </el-progress>
</template>

<script>
import { mapGetters } from 'vuex'
import { liveness, isCollectedLiveness, getLivenessReward } from '../api/user'
import { STORAGE } from '../constant/Constant'
import { getDate } from '../utils/util'
import { setLocal, getLocal } from '../utils/chromeUtil'

const REQUEST_INTERVAL = 30000
export default {
  name: 'liveness',
  data() {
    return {
      percentage: 0,
      intervalId: null,
      colors: [
        { color: '#f56c6c', percentage: 10 },
        { color: '#1989fa', percentage: 100 },
      ],
    }
  },
  inject: ['$message'],
  computed: {
    ...mapGetters(['key']),
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
  },
  beforeUnmount() {
    if (this.intervalId) {
      window.clearInterval(this.intervalId)
    }
  },
  methods: {
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
  },
}
</script>
<style scoped>
.progress {
  left: -8px;
  top: -4px;
}
</style>
<style>
.el-progress--without-text .el-progress__text {
  display: block !important;
}
.el-progress--circle .el-progress__text, .el-progress--dashboard .el-progress__text {
  left: 4px;
}
</style>