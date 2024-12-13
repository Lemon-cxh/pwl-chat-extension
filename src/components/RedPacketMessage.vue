<template>
  <el-row type="flex">
    <el-row
      :class="[
        'red-packet',
        { 'red-packet-mask': redPacket.got >= redPacket.count }
      ]"
      @click="clickRedPacket"
    >
      <el-row class="flex-colunmn icon-box">
        <icon-svg class="icon" icon-class="redPacketMessage" />
        <el-row>{{ redPacketTypeMap.get(redPacket.type).label }}</el-row>
      </el-row>
      <el-row class="flex-colunmn content-box">
        <el-row>{{ redPacket.msg }}</el-row>
        <el-row>{{ redPacket.money }}积分</el-row>
      </el-row>
    </el-row>

    <el-row v-if="!isOwn && showGesture" type="flex" class="gesture">
      <icon-svg class="icon" icon-class="rock" @click="selectGesture(0)"/>
      <icon-svg class="icon" icon-class="scissors" @click="selectGesture(1)"/>
      <icon-svg class="icon" icon-class="paper" @click="selectGesture(2)"/>
    </el-row>
  </el-row>
</template>

<script>
import { openRedPacket } from '../api/chatroom'
import { mapGetters } from 'vuex'
import {
  RED_PACKET_MAP,
  rockPaperScissors
} from '../constant/RedPacketConstant'
/**
 * 红包消息组件
 */
export default {
  name: 'red-packet-message',
  inject: ['$message'],
  props: {
    oId: String,
    content: String,
    isOwn: Boolean
  },
  emits: ['showRedpacketInfo'],
  data() {
    return {
      dialogVisible: false,
      redPacketTypeMap: RED_PACKET_MAP
    }
  },
  computed: {
    ...mapGetters(['key']),
    redPacket() {
      return JSON.parse(this.content)
    },
    form() {
      return { oId: this.oId, apiKey: this.key }
    },
    showGesture() {
      return this.redPacket.type === rockPaperScissors &&
      this.redPacket.got < this.redPacket.count
    }
  },
  methods: {
    clickRedPacket() {
      if (!this.showGesture) {
        this.openRedPacket(this.form)
      }
    },
    selectGesture(gesture) {
      const form = this.form
      form.gesture = gesture
      this.openRedPacket(form)
    },
    openRedPacket(form) {
      openRedPacket(form).then((res) => {
        if (res.code === -1) {
          this.$message.warning(res.msg)
          return
        }
        res.oId = this.oId
        this.$emit('showRedpacketInfo', res)
      })
    }
  }
}
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

.gesture {
  width: 80px;
  justify-content: space-around;
}
</style>
