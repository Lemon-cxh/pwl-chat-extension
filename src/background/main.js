import Vue from 'vue'
import App from './App.vue'
import store from '../store'
import { more } from '../api/chat'
import { notifications, getLocal } from '../utils/chromeUtil'
import { MESSAGE_TYPE, STORAGE, EVENT, MESSAGE_LIMIT } from "../constant/Constant"

Vue.config.productionTip = false
const URL = 'wss://pwl.icu/chat-room-channel'
const MAX_PAGE = 4
let port = null
let count = 0
let pop_message = false

store.dispatch('getUser').then(() => {
  init()
})

window.openSocket = function () {
  init()
}

window.closeSocket = function () {
  if (window.mySocket && window.mySocket.readyState !== WebSocket.CLOSED) {
    window.mySocket.close()
  }
  store.commit('clearMessage')
}

function init() {
  getLocal([STORAGE.key], function (result) {
    if (!result[STORAGE.key]) {
      return
    }
    if (
      window.mySocket &&
      (window.mySocket.readyState === WebSocket.OPEN ||
        window.mySocket.readyState === WebSocket.CONNECTING)
    ) {
      return
    }
    window.mySocket = new WebSocket(URL)
    window.mySocket.onmessage = (event) => messageHandler(event)
    window.mySocket.onerror = () => {
      setTimeout(() => {
        init()
      }, 5000)
    }
    window.mySocket.onclose = () => {
      setTimeout(() => {
        init()
      }, 5000)
    }
  })
}

function messageHandler(event) {
  let data = JSON.parse(event.data)
  switch (data.type) {
    case MESSAGE_TYPE.online:
      if (port) {
        port.postMessage({ type: EVENT.online, message: data })
      }
      store.commit('setOnline', data)
      break
    case MESSAGE_TYPE.revoke:
      if (port) {
        port.postMessage({ type: EVENT.revoke, message: data.oId })
      }
      store.commit('revoke', data.oId)
      break
    case MESSAGE_TYPE.redPacketStatus:
      messageEvent(data, false)
      if (port) {
        port.postMessage({ type: EVENT.redPacketStatus, message: data.oId })
      }
      store.commit('markRedPacket', data.oId)
      break
    default:
      messageEvent(data, true)
  }
}

chrome.runtime.onConnect.addListener(function (p) {
  clearBadgeText()
  port = p
  let message = {
    message: store.getters.message,
    online: store.getters.online 
  }
  p.postMessage({ type: EVENT.loadMessage, message: message})
  p.onMessage.addListener(function (msg) {
    switch (msg.type) {
      case EVENT.getMore:
        getMoreEvent()
        break
      case EVENT.syncUserInfo:
        store.commit('setUserInfo', msg.message)
        break;
      default:
        break
    }
  })
  p.onDisconnect.addListener(function () {
    port.disconnect()
    port = null
    if (pop_message) {
      return
    }
    pop_message = true
    while (store.getters.messageTotal > MAX_PAGE * MESSAGE_LIMIT) {
      store.commit('popMessage')
    }
    pop_message = false
  })
})

function messageEvent(message, isMsg) {
  store.commit('addMessage', { message: message, isMsg: isMsg })
  if (port) {
    port.postMessage({ type: EVENT.message, message: message })
  } else {
    if (
      message.type === MESSAGE_TYPE.msg &&
      message.md &&
      -1 !== message.md.indexOf('@' + store.getters.userInfo.userName)
    ) {
      notifications(message.userName + '@了你', message.md)
    }
    chrome.browserAction.setBadgeText({ text: '' + ++count })
  }
}

function getMoreEvent() {
  let pageParams = store.getters.pageParams
  more({ page: pageParams.page, apiKey: store.getters.key }).then((res) => {
    if (res.code === 0) {
      let data = res.data.slice(res.data.length - pageParams.length)
      store.commit('concatMessage', data)
      if (port) {
        port.postMessage({ type: EVENT.more, message: data })
      }
    }
  })
}

function clearBadgeText() {
  count = 0
  chrome.browserAction.setBadgeText({ text: '' })
}

new Vue({
  store,
  render: (h) => h(App),
}).$mount('#app')
