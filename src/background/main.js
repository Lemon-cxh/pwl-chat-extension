import Vue from 'vue'
import App from './App.vue'
import store from '../store'
import { more, send, openRedPacket } from '../api/chat'
import { notifications, getLocal, sendTabsMessage } from '../utils/chromeUtil'
import {
  MESSAGE_TYPE,
  STORAGE,
  EVENT,
  MESSAGE_LIMIT,
  TABS_EVENT,
} from '../constant/Constant'

Vue.config.productionTip = false
const URL = 'wss://pwl.icu/chat-room-channel'
const MAX_PAGE = 4
let port = null
let count = 0
let pop_message = false
let options = {
  atNotification: true,
  plusOne: true,
  barrageOptions: {
    enable: false
  }
}

store.dispatch('getUser').then(() => {
  init()
})

window.openSocket = function () {
  store.dispatch('getUser').then(() => {
    init()
  })
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
      window.closeSocket()
      return
    }
    if (
      window.mySocket &&
      (window.mySocket.readyState === WebSocket.OPEN ||
        window.mySocket.readyState === WebSocket.CONNECTING)
    ) {
      return
    }
    window.mySocket = new WebSocket(URL + '?apiKey=' + result[STORAGE.key])
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
        port.postMessage({ type: EVENT.online, data: data })
      }
      store.commit('setOnline', data)
      break
    case MESSAGE_TYPE.revoke:
      if (port) {
        port.postMessage({ type: EVENT.revoke, data: data.oId })
      }
      store.commit('revoke', data.oId)
      break
    case MESSAGE_TYPE.redPacketStatus:
      messageEvent(data, false)
      if (port) {
        port.postMessage({ type: EVENT.redPacketStatus, data: data.oId })
      }
      store.commit('updateRedPacket', data.oId)
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
    online: store.getters.online,
  }
  p.postMessage({ type: EVENT.loadMessage, data: message })
  p.onMessage.addListener(function (msg) {
    switch (msg.type) {
      case EVENT.getMore:
        getMoreEvent()
        break
      case EVENT.syncUserInfo:
        store.commit('setUserInfo', msg.data)
        break
      case EVENT.syncOptions:
        options = msg.data
        sendTabsMessage({ type: TABS_EVENT.syncOptions, data: msg.data })
        break
      case EVENT.markRedPacket:
        store.commit('markRedPacket', msg.data)
        break
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

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (TABS_EVENT.sendMessage === request.type) {
    send({ content: request.data, apiKey: store.getters.key }).then()
    return
  }
  if (TABS_EVENT.openRedPacket === request.type) {
    openRedPacket({ oId: request.data, apiKey: store.getters.key }).then(res => {
      sendResponse({data: res, userName: store.getters.userInfo.userName})
      return
    })
  }
})

function messageEvent(message, isMsg) {
  store.commit('addMessage', { message: message, isMsg: isMsg, plusOne: options.plusOne })
  if (port) {
    port.postMessage({ type: EVENT.message, data: message })
    return
  }
  if (!isMsg) {
    return
  }
  if (options.barrageOptions.enable) {
    sendTabsMessage({ type: TABS_EVENT.message, data: message }, (res) => {
      if (!res || res.hidden) {
        atNotifications(message)
      }
    })
    return
  }
  atNotifications(message)
}

function atNotifications(message) {
  if (
    options.atNotification &&
    message.type === MESSAGE_TYPE.msg &&
    message.md &&
    -1 !== message.md.indexOf('@' + store.getters.userInfo.userName)
  ) {
    notifications(message.userName + '@了你', message.md)
  }
  chrome.browserAction.setBadgeText({ text: '' + ++count })
}

function getMoreEvent() {
  let pageParams = store.getters.pageParams
  more({ page: pageParams.page, apiKey: store.getters.key }).then((res) => {
    if (res.code === 0) {
      let data = res.data.slice(res.data.length - pageParams.length)
      store.commit('concatMessage', data)
      if (port) {
        port.postMessage({ type: EVENT.more, data: data })
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
