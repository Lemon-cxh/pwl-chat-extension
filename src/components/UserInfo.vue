<template>
  <div>
    <el-progress :percentage="percentage" :show-text="false"/>
    <el-row type="flex" class="box">
      <el-row class="avatar" @click.native="logout">
        <el-avatar :src="userInfo.userAvatarURL"></el-avatar>
      </el-row>
      <send class="send"></send>
    </el-row>
  </div>
</template>

<script>

import Send from "../components/Send.vue";
import { mapGetters, mapMutations } from "vuex";
import { liveness, isCollectedLiveness, getLivenessReward } from "../api/user";
import { closeSocket } from "../utils/chromeUtil"

export default {
  name: "userInfo",
  data() {
    return {
      percentage: 0,
      interval: null
    }
  },
  components: { Send },
  computed: {
    ...mapGetters(['userInfo', 'key']),
    apiKey() {
      return {apiKey: this.key};
    },
  },
  created() {
    this.getLiveness()
    this.interval = window.setInterval(() => {
      this.getLiveness()
    }, 6000);
    this.getLivenessReward()
  },
  destroyed(){
    if (this.interval) {
      window.clearInterval(this.interval)
    }
  },
  methods: {
    ...mapMutations(['clearMessage']),
    getLiveness() {
      liveness(this.apiKey).then(res => {
        this.percentage = res.liveness
      })
    },
    logout() {
      closeSocket();
      this.clearMessage()
      this.$router.push({name: 'Login'})
    },
    getLivenessReward() {
      chrome.storage.local.get(['isCollectedYesterdayLivenessReward'], function (result) {
        if (result.isCollectedYesterdayLivenessReward) {
          return
        }
        isCollectedLiveness(this.apiKey).then(res => {
          if (!res.isCollectedYesterdayLivenessReward) {
            getLivenessReward(this.apiKey).then(r => {
              chrome.storage.local.set({ isCollectedYesterdayLivenessReward: true })
              this.$message.success('领取昨日活跃积分:' + r.sum)
            })
          }
        })
      })
    }
  }
}
</script>

<style scoped>
.box {
  padding: 5px;
}
.avatar {
  width: 40px;
  margin-right: 5px
}
.send {
  width: 350px;
}
</style>