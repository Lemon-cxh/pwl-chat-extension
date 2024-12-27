<template>
  <div>
    <el-row class="message">
      <div v-if="type.redPacketStatus === message.type" class="message-box">
        <span class="text" @click="showUserCard(message.whoGot)">
          {{ message.whoGot }}
        </span>
        <span> 抢到了 </span>
        <span class="text" @click="showUserCard(message.whoGive)">
          {{ message.whoGive }}
        </span>
        <span> 的</span>
        <span class="number" @click="openRedPacket"> 红包 </span>
        <span>({{ message.got }}/{{ message.count }})</span>
      </div>
      <div v-else-if="type.discussStatus === message.type" class="message-box">
        <span class="text" @click="showUserCard(message.whoChanged)">
          {{ message.whoChanged }}
        </span>
        <span> 编辑了话题: </span>
        <span class="text">
          {{ message.newDiscuss }}
        </span>
      </div>
      <div
        v-else-if="type.customMessage === message.type"
        class="message-box text"
      >
        {{ message.message }}
      </div>
      <div
        v-else-if="type.barrager === message.type"
        class="message-box"
        :style="'color:' + message.barragerColor"
      >
        <el-avatar size="small" :src="message.userAvatarURL" class="avatar" />
        <span>{{ message.userNickname ?? message.userName }}</span>
        <span>{{ ': ' + message.barragerContent }}</span>
      </div>
    </el-row>
  </div>
</template>

<script>
import { openRedPacket } from '@/popup/api/chatroom'
import { mapGetters } from 'vuex'
import { MESSAGE_TYPE } from '@/common/constant/Constant'
/**
 * 提示信息：红包领取、更新话题、弹幕消息
 */
export default {
  name: 'hint-message',
  props: {
    message: Object
  },
  emits: ['showRedpacketInfo', 'showUserCard'],
  computed: {
    ...mapGetters(['key']),
    form() {
      return { oId: this.message.oId, apiKey: this.key }
    }
  },
  data() {
    return {
      type: MESSAGE_TYPE
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
    }
  }
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
  display: flex;
  align-items: center;
}
.text {
  color: #4183c4;
}
.number {
  color: #c7254e;
}
.avatar {
  margin-right: 10px;
}
</style>
