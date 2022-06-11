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

        <el-row
          class="message"
          v-for="(item, index) in messageArray"
          :key="index"
        >
          <div class="name">
            {{ item.userNickname ? item.userNickname : item.userName }}
            {{ item.userNickname ? `(${item.userName})` : '' }}
          </div>
          <div class="content" v-html="item.content"></div>
        </el-row>
      </el-scrollbar>
    </div>
    <xiao-ice :userInfo="userInfo" />
  </div>
</template>

<script>
import { ref } from 'vue'
import { EVENT } from '../constant/Constant'
import XiaoIce from './XiaoIce.vue'

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
          console.log(msg.data)
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
}
.el-input {
  --el-input-bg-color: #3a3a3a;
}
.message {
  margin: 3px;
}
.name {
  font-weight: bold;
  margin-right: 10px;
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
}
</style>
