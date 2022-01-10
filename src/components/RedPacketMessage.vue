<template>
  <div>
    <el-row :class="'red-packet' + (redPacket.got >= redPacket.count ? ' red-packet-mask' : '')"
            @click="openRedPacket">
      <el-row class="flex-colunmn icon-box">
        <icon-svg class="icon" icon-class="redPacketMessage"/>
        <el-row>{{redPacketTypeMap.get(redPacket.type).label}}</el-row>
      </el-row>
      <el-row class="flex-colunmn content-box">
        <el-row>{{redPacket.msg}}</el-row>
      </el-row>
    </el-row>
  </div>
</template>

<script>
import { openRedPacket } from "../api/chat";
import { mapGetters } from "vuex";
import { redPacketTypeMap } from "../constant/RedPacketConstant"

export default {
  name: "redPacketMessage",
  props: {
    oId: String,
    content: String,
  },
  emits: ['showRedpacketInfo'],
  data() {
    return {
      dialogVisible: false,
      redPacketTypeMap: redPacketTypeMap
    };
  },
  computed: {
    ...mapGetters(["key"]),
    redPacket() {
      return JSON.parse(this.content)
    },
    form() {
      return { oId: this.oId, apiKey: this.key };
    },
  },
  methods: {
    openRedPacket() {
      openRedPacket(this.form).then((res) => {
        res.oId = this.oId
        this.$emit('showRedpacketInfo', res)
      });
    },
  },
};
</script>

<style scoped>
.red-packet {
  background-color: #ffa902;
  height: 60px;
  border-radius: 10px;
}
.red-packet-mask {
  background-color: #ffd480;
}
.flex-colunmn {
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
}
.icon-box {
  width: 70px;
}
.icon {
  font-size: 30px;
}
.content-box {
  max-width: 130px;
  min-width: 80px;
  padding: 5px 10px 5px 0;
  line-height: 20px;
  text-align: center;
  overflow: hidden;
}
</style>