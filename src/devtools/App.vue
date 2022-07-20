<template>
  <div class="app">
    <div class="chat-room">
      <el-scrollbar height="96vh">
        <el-affix :offset="0">
          <el-input
            v-focus
            v-model="input"
            @keyup.enter="sendHandler"
            style="width: 50%"
          />
        </el-affix>

        <template v-for="item in messageArray" :key="item.oId">
          <el-row class="message" v-if="!item.hidden">
            <div class="name">
              {{ item.userNickname ? item.userNickname : item.userName }}
              {{ item.userNickname ? `(${item.userName})` : '' }}
            </div>
            <span style="margin: 0 10px 0 5px">:</span>
            <div
              v-if="isRedPacket(item.content)"
              @click="clickRedPacket(item.oId)"
            >
              [🧧红包来了]
            </div>
            <div v-else class="content" v-html="item.content"></div>
          </el-row>
        </template>
      </el-scrollbar>
    </div>
    <xiao-ice :userInfo="userInfo" />
  </div>
</template>

<script>
import { ref } from 'vue'
import { EVENT, TABS_EVENT } from '../constant/Constant'
import { isRedPacket } from '../utils/util'
import XiaoIce from './components/XiaoIce.vue'

let port

export default {
  name: 'app',
  data() {
    return {
      port: undefined,
      userInfo: '',
      input: '',
    }
  },
  components: {
    'xiao-ice': XiaoIce,
  },
  setup() {
    const messageArray = ref([])
    const unshiftMessage = (msg) => {
      messageArray.value.unshift(msg)
    }
    const pushMessage = (msg) => {
      let index = messageArray.value.length - 1
      if (index < 0) {
        messageArray.value.push(...msg)
        return
      }
      let last = messageArray.value[index]
      let message = msg[0]
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
      updateMessage,
    }
  },
  created() {
    chrome.devtools.panels.create('finsh', 'icons/128.png', 'devtools.html')
    port = chrome.runtime.connect({ name: 'pwl-chat' })
    port.onMessage.addListener((msg) => this.messageListener(msg))
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
        default:
          break
      }
    },
    sendHandler() {
      port.postMessage({
        type: EVENT.sendMessage,
        data: this.input,
      })
      this.input = ''
    },
    isRedPacket(message) {
      return isRedPacket(message)
    },
    clickRedPacket(id) {
      chrome.runtime.sendMessage({
        type: TABS_EVENT.openRedPacket,
        data: id,
      })
    },
  },
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
  margin: 3px;
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
  height: 40px;
  max-width: 100%;
}

.contnet * {
  overflow: auto;
  margin: 0px;
}
.content hr {
  margin: 3px 0;
}
.content blockquote {
  margin-top: 5px;
  border-left: 3px solid #6e6e6e;
  padding-left: 5px;
}
</style>
