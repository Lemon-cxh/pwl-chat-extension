<template>
  <div>
    <el-row class="message hint" v-if="message.revoke">
      有人尝试撤回下条消息
    </el-row>
    <el-row v-else class="message">
      <span class="text" @click="showUserCard(message.whoGot)">{{message.whoGot}}</span>
      <span> 抢到了 </span> 
      <span class="text" @click="showUserCard(message.whoGive)">{{message.whoGive}} </span>的
      <span class="number" @click="openRedPacket"> 红包 </span>
      <span>({{message.got}}/{{message.count}})</span>
    </el-row>
  </div>
</template>

<script>
import { openRedPacket } from "../api/chat";
import { mapGetters } from "vuex";

export default {
  name: "hintMessage",
  props: {
    message: Object,
  },
  computed: {
    ...mapGetters(["key"]),
    form() {
      return { oId: this.message.oId, apiKey: this.key };
    },
  },
  methods: {
    openRedPacket() {
      openRedPacket(this.form).then((res) => {
        res.oId = this.message.oId
        this.$emit('showRedpacketInfo', res)
      });
    },
    close() {
      this.dialogVisible = false;
    },
    showUserCard(userName) {
      this.$emit('showUserCard', userName)
    }
  },
};
</script>

<style scoped>
.message {
  text-align: center;
  font-size: 14px;
}
.text {
  color: #4183c4;
}
.number {
  color: #c7254e;
}
.hint {
  color: white;
}
</style>