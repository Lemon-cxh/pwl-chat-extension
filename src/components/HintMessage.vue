<template>
  <div>
    <el-row class="message" v-if="!message.hidden">
      <div v-if="type.redPacketStatus === message.type" class="message-box">
        <span class="text" @click="showUserCard(message.whoGot)">
          {{ message.whoGot }}
        </span>
        <span> 抢到了 </span>
        <span class="text" @click="showUserCard(message.whoGive)">
          {{ message.whoGive }} </span>
        <span> 的</span>
        <span class="number" @click="openRedPacket"> 红包 </span>
        <span>({{ message.got }}/{{ message.count }})</span>
      </div>
      <div v-else class="message-box">
        <span class="text" @click="showUserCard(message.whoChanged)">
          {{ message.whoChanged }}
        </span>
        <span> 编辑了话题: </span>
        <span class="text">
          {{ message.newDiscuss }}
        </span>
      </div>
    </el-row>
  </div>
</template>

<script>
import { openRedPacket } from '../api/chat'
import { mapGetters } from 'vuex'
import { MESSAGE_TYPE } from '../constant/Constant'

export default {
  name: 'hintMessage',
  props: {
    message: Object,
  },
  emits: ['showRedpacketInfo', 'showUserCard'],
  computed: {
    ...mapGetters(['key']),
    form() {
      return { oId: this.message.oId, apiKey: this.key }
    },
  },
  data() {
    return {
      type: MESSAGE_TYPE,
    }
  },
  methods: {
    openRedPacket() {
      openRedPacket(this.form).then((res) => {
        res.oId = this.message.oId
        this.$emit('showRedpacketInfo', res)
      })
    },
    close() {
      this.dialogVisible = false
    },
    showUserCard(userName) {
      this.$emit('showUserCard', userName)
    },
  },
}
</script>

<style scoped>
.message {
  font-size: 14px;
  justify-content: center;
  color: white;
}
.message-box {
  max-width: 300px;
}
.text {
  color: #4183c4;
}
.number {
  color: #c7254e;
}
</style>
