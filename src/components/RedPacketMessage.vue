<template>
  <div>
    <el-row
      :class="[
        'red-packet',
        { 'red-packet-mask': redPacket.got >= redPacket.count },
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

    <el-dialog
      v-if="dialogGestureVisible"
      v-model="dialogGestureVisible"
      width="60%"
      center
      :show-close="false"
      title="出拳"
    >
      <el-radio-group v-model="gesture" style="margin: 0 15px">
        <el-radio :label="0">石头</el-radio>
        <el-radio :label="1">剪刀</el-radio>
        <el-radio :label="2">布</el-radio>
      </el-radio-group>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="selectGesture"> 出拳 </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { openRedPacket } from '../api/chat'
import { mapGetters } from 'vuex'
import { redPacketTypeMap } from '../constant/RedPacketConstant'

export default {
  name: 'redPacketMessage',
  props: {
    oId: String,
    content: String,
  },
  emits: ['showRedpacketInfo'],
  data() {
    return {
      dialogVisible: false,
      redPacketTypeMap: redPacketTypeMap,
      dialogGestureVisible: false,
      gesture: 0,
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
  },
  methods: {
    clickRedPacket() {
      let redPacket = this.redPacket
      if (
        redPacket.type === 'rockPaperScissors' &&
        redPacket.got < redPacket.count
      ) {
        this.dialogGestureVisible = true
        return
      }
      this.openRedPacket(this.form)
    },
    selectGesture() {
      let form = this.form
      form.gesture = this.gesture
      this.openRedPacket(form)
      this.dialogGestureVisible = false
    },
    openRedPacket(form) {
      openRedPacket(form).then((res) => {
        res.oId = this.oId
        this.$emit('showRedpacketInfo', res)
      })
    },
  },
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
</style>
