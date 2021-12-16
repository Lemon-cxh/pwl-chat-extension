<template>
  <div>
    <el-row type="flex"
            :class="'red-packet' + (redPacket.count === redPacket.got ? ' red-packet-mask' : '')"
            @click.native="openRedPacket">
      <div class="cover"></div>
      <el-row class="msg">{{redPacket.msg}}</el-row>
    </el-row>

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
  name: "redPacket",
  props: {
    oId: String,
    content: String,
  },
  data() {
    return {
      dialogVisible: false,
      info: "",
      redPacket: JSON.parse(this.content)
    };
  },
  components: { RedPacketInfo },
  computed: {
    ...mapGetters(["key"]),
    form() {
      return { oId: this.oId, apiKey: this.key };
    },
  },
  methods: {
    openRedPacket() {
      openRedPacket(this.form).then((res) => {
        this.dialogVisible = true;
        this.info = res;
        this.redPacket.got = res.info.got;
      });
    },
    close() {
      this.dialogVisible = false;
    },
  },
};
</script>

<style scoped>
.red-packet {
  background-color: #b90a00;
  width: 200px;
  height: 60px;
  border-radius: 10px;
}
.red-packet-mask {
  background: rgba(122, 3, 3, 0.3);
}
.cover {
  position: absolute;
  left: 5px;
  border-left: 95px solid transparent;
  border-right: 95px solid transparent;
  border-top: 35px solid #ff848444;
}
.msg {
  color: #ebce96;
  font-size: 16px;
  line-height: 20px;
  margin: auto;
  text-align: center;
  width: 200px;
  z-index: 10;
  overflow: hidden;
}
</style>