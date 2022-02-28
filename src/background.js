import { createApp } from 'vue'
import store from './store'
import { more, send, openRedPacket } from './api/chat'
import {
  notifications,
  getLocal,
  sendTabsMessage,
  getSync,
} from './utils/chromeUtil'
import {
  MESSAGE_TYPE,
  STORAGE,
  EVENT,
  MESSAGE_LIMIT,
  TABS_EVENT,
  defaultOptions,
} from './constant/Constant'

const URL = 'wss://fishpi.cn/chat-room-channel'
// 最大保留两页消息
const MAX_PAGE = 2
let intervalId = undefined
// 与popup页面的通信
let port = null
// 未读消息数
let count = 0
// 是否删除多余消息
let pop_message = false
let options = defaultOptions
let careOnline = []

getSync({ [STORAGE.options]: defaultOptions }, (result) => {
  if (result.options.blacklist) {
    result.options.blacklist = JSON.parse(result.options.blacklist)
  }
  if (result.options.care) {
    result.options.care = JSON.parse(result.options.care)
  }
  options = result.options
})

window.openSocket = () => {
  store.dispatch('getUser').then(() => {
    initWebSocket()
  })
}

window.closeSocket = () => {
  if (socketIsOpen()) {
    window.mySocket.close()
  }
  store.commit('clearMessage')
}

window.openSocket()

function initWebSocket() {
  getLocal([STORAGE.key], (result) => {
    if (!result[STORAGE.key]) {
      window.closeSocket()
      return
    }
    if (socketIsOpen()) {
      return
    }
    window.mySocket = new WebSocket(URL + '?apiKey=' + result[STORAGE.key])
    if (intervalId != undefined) {
      clearInterval(intervalId)
    }
    intervalId = setInterval(() => {
      if (!socketIsOpen()) {
        window.openSocket()
      }
    }, 1000 * 60)
    window.mySocket.onmessage = (event) => messageHandler(event)
    window.mySocket.onerror = (e) => {
      console.log('WebSocket error observed:', e)
    }
    window.mySocket.onclose = (e) => {
      console.log('WebSocket close observed:', e)
      window.closeSocket()
      window.openSocket()
    }
    getMoreEvent()
  })
}

function socketIsOpen() {
  return (
    window.mySocket &&
    (window.mySocket.readyState === WebSocket.OPEN ||
      window.mySocket.readyState === WebSocket.CONNECTING)
  )
}

function messageHandler(event) {
  let data = JSON.parse(event.data)
  switch (data.type) {
    case MESSAGE_TYPE.online:
      if (port) {
        port.postMessage({ type: EVENT.online, data: data })
      }
      store.commit('setOnline', data)
      onlineEvent(data)
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

chrome.runtime.onConnect.addListener((p) => {
  clearBadgeText()
  port = p
  let message = {
    message: store.getters.message,
    online: store.getters.online,
  }
  port.postMessage({ type: EVENT.loadMessage, data: message })
  port.onMessage.addListener((msg) => {
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
  port.onDisconnect.addListener(() => {
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

chrome.runtime.onMessage.addListener((request) => {
  if (TABS_EVENT.sendMessage === request.type) {
    send({ content: request.data, apiKey: store.getters.key }).then()
    return
  }
  if (TABS_EVENT.openRedPacket === request.type) {
    openRedPacket({ oId: request.data, apiKey: store.getters.key }).then(
      (res) => {
        sendTabsMessage({
          type: TABS_EVENT.markRedPacket,
          data: {
            data: res,
            userName: store.getters.userInfo.userName,
            oId: request.data,
          },
        })
      }
    )
  }
})

function messageEvent(message, isMsg) {
  markCareAndBlack(message)
  store.commit('addMessage', { message: message, isMsg: isMsg })
  if (port) {
    port.postMessage({ type: EVENT.message, data: message })
    return
  }
  if (!isMsg || message.isBlack) {
    return
  }
  if (!options.barrageOptions.enable) {
    atNotifications(message)
    return
  }
  sendTabsMessage({ type: TABS_EVENT.message, data: message }, (res) => {
    if (!res || res.hidden) {
      atNotifications(message)
    }
  })
}

function onlineEvent(data) {
  if (!options.care || options.care.length === 0) {
    return
  }
  let currentOnline = data.users
    .filter((element) => options.care.some((e) => e === element.userName))
    .flatMap((e) => e.userName)
  currentOnline
    .filter((current) => !careOnline.some((e) => current === e))
    .forEach((e) => {
      notifications('特别关心', `[${e}]上线了`)
    })
  careOnline
    .filter((e) => !currentOnline.some((current) => current === e))
    .forEach((e) => {
      notifications('特别关心', `[${e}]下线了`)
    })
  careOnline = currentOnline
}

function atNotifications(message) {
  chrome.browserAction.setBadgeText({ text: '' + ++count })
  if (message.isCare) {
    notifications(message.userName, message.md)
    return
  }
  if (
    options.atNotification &&
    message.md &&
    -1 !== message.md.indexOf('@' + store.getters.userInfo.userName)
  ) {
    notifications(`${message.userName}@了你`, message.md)
  }
}

function getMoreEvent() {
  let pageParams = store.getters.pageParams
  more({ page: pageParams.page, apiKey: store.getters.key }).then((res) => {
    if (res.code === 0) {
      let data = res.data.slice(res.data.length - pageParams.length).reverse()
      let arr = []
      for (let index = 0; index < data.length; index++) {
        if (index === 0) {
          markCareAndBlack(data[index])
          arr.unshift(data[index])
          continue
        }
        let e = data[index]
        let last = arr[0]
        if (last.content !== e.content) {
          markCareAndBlack(e)
          arr.unshift(e)
          continue
        }
        let { users = [], oIds = [] } = last
        users.push({
          userName: e.userName,
          userAvatarURL: e.userAvatarURL,
        })
        oIds.push(e.oId)
        arr[0].users = users
        arr[0].oIds = oIds
      }
      store.commit('concatMessage', { message: arr, size: data.length })
      if (port) {
        port.postMessage({ type: EVENT.more, data: arr })
      }
    }
  })
}

function markCareAndBlack(message) {
  message.isCare =
    options.care && options.care.some((e) => e === message.userName)
  message.isBlack =
    options.blacklist && options.blacklist.some((e) => e === message.userName)
}

function clearBadgeText() {
  count = 0
  chrome.browserAction.setBadgeText({ text: '' })
}

createApp().use(store)
