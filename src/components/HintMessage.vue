<template>
  <div>
    <el-row class="message">
      <a class="text">{{message.whoGot}}</a>
      <span> 抢到了 </span> 
      <a class="text">{{message.whoGive}}</a>的
      <a class="number" @click="openRedPacket">红包</a>
      <span>({{message.got}}/{{message.count}})</span></el-row>
    <red-packet-info :info="info"
                     v-if="dialogVisible"
                     @close='close'></red-packet-info>
  </div>
</template>

<script>
import { openRedPacket } from "../api/chat";
import { mapGetters } from "vuex";
import RedPacketInfo from "../components/RedPacketInfo.vue";

export default {
  name: "hintMessage",
  props: {
    message: Object,
  },
  data() {
    return {
      dialogVisible: false,
      info: "",
    };
  },
  components: { RedPacketInfo },
  computed: {
    ...mapGetters(["key"]),
    form() {
      return { oId: this.info.oId, apiKey: this.key };
    },
  },
  methods: {
    openRedPacket() {
      openRedPacket(this.form).then((res) => {
        this.dialogVisible = true;
        this.info = res;
      });
    },
    close() {
      this.dialogVisible = false;
    },
  },
};
</script>

<style scoped>
.message {
  text-align: center;
}
.text {
  color: #4183c4;
}
.number {
  color: #c7254e;
}
</style>