<template>
  <div id="app">
    <template v-for="(item, index) in messageArray" :key="index">
      <div>{{ item.md }}</div>
    </template>
  </div>
</template>

<script>
import { ref } from 'vue'
import { EVENT } from '../constant/Constant'
export default {
  name: 'app',
  data() {
    return {}
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
    let port = chrome.runtime.connect({ name: 'pwl-chat' })
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
        // case EVENT.revoke:
        //   this.revoke(msg.data)
        //   break
        default:
          break
      }
      console.log(this.messageArray)
    },
  },
}
</script>
<style>
body {
  background: #3a3a3a;
  color: white;
}
</style>
