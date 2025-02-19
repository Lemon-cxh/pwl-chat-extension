<template>
  <div class="app">
    <div class="chat-room">
      <el-scrollbar id="messageList" height="96vh">
        <el-affix :offset="0">
          <el-input
            v-focus
            v-model="input"
            @keyup.enter="sendHandler"
            style="width: 50%"
          />
        </el-affix>

        <template v-for="item in messageArray">
          <el-row class="message" :key="item.oId" v-if="!item.hidden">
            <div class="name">
              {{ item.userNickname ? item.userNickname : item.userName }}
              {{ item.userNickname ? `(${item.userName})` : '' }}
            </div>
            <span style="margin: 0 10px 0 5px">:</span>
            <div v-if="isRedPacket(item)" @click="clickRedPacket(item.oId)">
              {{ getRedPacketMsg(item) }}
            </div>
            <div
              v-else
              class="content"
              v-html="modifyContent(item.content)"
            ></div>
          </el-row>
        </template>
      </el-scrollbar>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { EVENT, MESSAGE_TYPE } from '@/common/constant/Constant'
import { clickEventListener } from '@/common/utils/commonUtil'
import { isRedPacket } from '@/common/utils/util'
import { getOptions } from '@/common/utils/chromeUtil'

let port

export default {
  name: 'app',
  data() {
    return {
      port: undefined,
      userInfo: '',
      input: '',
      options: {}
    }
  },
  setup() {
    const messageArray = ref([])
    const unshiftMessage = (msg) => {
      messageArray.value.unshift(msg)
    }
    const pushMessage = (msg) => {
      const index = messageArray.value.length - 1
      if (index < 0) {
        messageArray.value.push(...msg)
        return
      }
      const last = messageArray.value[index]
      const message = msg[0]
      if (last.content !== message.content) {
        messageArray.value.push(...msg)
        return
      }
      messageArray.value[index] = message
      messageArray.value.push(...msg.slice(1))
    }
    const updateMessage = (index, property, value) => {
      messageArray.value[index][property] = value
    }
    return {
      messageArray,
      unshiftMessage,
      pushMessage,
      updateMessage
    }
  },
  async created() {
    /* global chrome */
    chrome.devtools.panels.create('Fish', 'icons/128.png', 'devtools.html')
    port = chrome.runtime.connect()
    port.onMessage.addListener((msg) => this.messageListener(msg))
    this.options = await getOptions()
  },
  mounted() {
    clickEventListener()
  },
  methods: {
    messageListener(msg) {
      switch (msg.type) {
        case EVENT.loadMessage:
          this.pushMessage(msg.data.message)
          break
        case EVENT.message:
          this.unshiftMessage(msg.data)
          break
        case EVENT.more:
          this.pushMessage(msg.data)
          this.loading = false
          break
        case EVENT.userInfo:
          this.userInfo = msg.data
          break
        case EVENT.redPacketStatus:
          this.updateRedPacket(msg.data)
          break
        default:
          break
      }
    },
    sendHandler() {
      port.postMessage({
        type: EVENT.sendMessage,
        data: this.input
      })
      this.input = ''
    },
    isRedPacket(message) {
      return isRedPacket(message)
    },
    getRedPacketMsg(message) {
      const content = JSON.parse(message.content)
      return `[🧧${content.msg} (${content.money}积分)🧧]`
    },
    clickRedPacket(id) {
      port.postMessage({
        type: EVENT.openRedPacket,
        data: id
      })
      this.updateMessage({ oId: id })
    },
    updateRedPacket(data) {
      let msg
      this.messageArray.some((e, index) => {
        if (e.oId === data.oId && e.type !== MESSAGE_TYPE.redPacketStatus) {
          msg = JSON.parse(e.content)
          if (msg.got >= msg.count) {
            return true
          }
          msg.got = data.got ? data.got : msg.count
          this.updateMessage(index, 'content', JSON.stringify(msg))
          return true
        }
        return false
      })
    },
    modifyContent(content) {
      // 隐藏小尾巴信息
      if (!this.options.hideBlockquote) {
        return content
      }
      return content.replaceAll(
        /((?<!引用(.|\n)+)<blockquote>)((.|\n)+)(<\/blockquote>)/g,
        '<details><summary></summary><blockquote>$3</blockquote></details>'
      )
    }
  }
}
</script>
<style>
body {
  background: #3a3a3a;
  color: white;
}
.app {
  display: flex;
}
.chat-room {
  flex: 1;
  max-width: calc(100% -300px);
}
.el-input {
  --el-input-bg-color: #3a3a3a;
}
.message {
  margin: 5px 3px;
  max-width: 100%;
}
.name {
  font-weight: bold;
}
.contnet {
  border-bottom: 1px solid black;
}
.content p {
  margin: 0;
}
.content a {
  color: white;
}
.content img {
  max-height: 1em;
}
.content iframe {
  height: 0;
  width: 0;
}
.contnet * {
  overflow: auto;
  margin: 0px;
}
.content hr {
  margin: 3px 0;
}
.content blockquote {
  margin: 0 0 0 5px;
  border-left: 3px solid #6e6e6e;
  padding-left: 5px;
}
.content iframe {
  border: none;
}
</style>
