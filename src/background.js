import { createApp } from 'vue'
import store from './store/index'
import { more, send, openRedPacket } from './api/chat'
import {
  notifications,
  getLocal,
  sendTabsMessage,
  getSync,
} from './utils/chromeUtil'
import { getMessageMark } from './utils/util'
import {
  MESSAGE_TYPE,
  STORAGE,
  EVENT,
  MESSAGE_LIMIT,
  TABS_EVENT,
  defaultOptions,
} from './constant/Constant'

const URL = 'wss://fishpi.cn/chat-room-channel'
let socketLock = false
let webSocket
// 最大保留两页消息
const MAX_PAGE = 2
let intervalId = undefined
// 与popup页面的通信
let port = null
let deleteMessage = false
// 未读消息数
let count = 0
let options = defaultOptions
let careOnline = []

getSync({ [STORAGE.options]: defaultOptions }, (result) => {
  options = formatOptions(result.options)
})

chrome.storage.onChanged.addListener((changes) => {
  if (changes.options) {
    options = formatOptions(changes.options.newValue)
    sendTabsMessage({ type: TABS_EVENT.syncOptions, data: options })
  }
})

window.openSocket = () => {
  if (socketLock) {
    return
  }
  socketLock = true
  store
    .dispatch('getUser')
    .then(() => {
      initWebSocket()
    })
    .catch(() => {
      webSocket && webSocket.close()
    })
  socketLock = false
}

window.closeSocket = () => {
  webSocket && webSocket.close()
  store.commit('clearMessage')
}

window.openSocket()

function initWebSocket() {
  window.closeSocket()
  getLocal([STORAGE.key], (result) => {
    webSocket = new WebSocket(URL + '?apiKey=' + result[STORAGE.key])
    if (intervalId != undefined) {
      clearInterval(intervalId)
    }
    intervalId = setInterval(() => {
      webSocket.send('-hb-')
    }, 1000 * 60)
    webSocket.onmessage = (event) => messageHandler(event)
    webSocket.onerror = (e) => {
      console.log('WebSocket error observed:', e)
      window.openSocket()
    }
    webSocket.onclose = (e) => {
      console.log('WebSocket close observed:', e)
      window.openSocket()
    }
    getMoreEvent()
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
      onlineEvent(data)
      break
    case MESSAGE_TYPE.revoke:
      if (port) {
        port.postMessage({ type: EVENT.revoke, data: data.oId })
      }
      store.commit('revoke', data.oId)
      break
    case MESSAGE_TYPE.redPacketStatus:
      if (options.hideRedPacketMessage) {
        data.hidden = true
      }
      messageEvent(data, false)
      if (port) {
        port.postMessage({ type: EVENT.redPacketStatus, data: data })
      }
      store.commit('updateRedPacket', data)
      break
    case MESSAGE_TYPE.discussChanged:
      messageEvent(data, false)
      if (port) {
        port.postMessage({ type: EVENT.discussChanged, data: data.newDiscuss })
      }
      store.commit('setDiscuss', data.newDiscuss)
      break
    default:
      messageEvent(data, true)
      clearMessage()
  }
}

chrome.runtime.onConnect.addListener((p) => {
  clearBadgeText()
  port = p
  let message = {
    message: store.getters.message,
    online: store.getters.online,
    discuss: store.getters.discuss,
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
      case EVENT.markRedPacket:
        store.commit('markRedPacket', msg.data)
        break
      default:
        break
    }
  })
  port.onDisconnect.addListener(() => {
    port = null
    clearMessage()
  })
})

chrome.runtime.onMessage.addListener((request) => {
  if (TABS_EVENT.sendMessage === request.type) {
    send({
      content: request.data + getMessageMark(),
      apiKey: store.getters.key,
    }).then()
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
  if (isMsg) {
    markCareAndBlack(message)
  }
  store.commit('addMessage', { message: message, isMsg: isMsg })
  if (port) {
    port.postMessage({ type: EVENT.message, data: message })
    return
  }
  if (!isMsg || message.hidden) {
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

async function getMoreEvent() {
  let pageParams = store.getters.pageParams
  let res = await more({ page: pageParams.page, apiKey: store.getters.key })
  if (res.code !== 0) {
    return
  }
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

function markCareAndBlack(message) {
  message.isCare =
    options.care && options.care.some((e) => e === message.userName)
  message.hidden =
    options.blacklist && options.blacklist.some((e) => e === message.userName)
}

function clearBadgeText() {
  count = 0
  chrome.browserAction.setBadgeText({ text: '' })
}

function clearMessage() {
  if (port || deleteMessage) {
    return
  }
  deleteMessage = true
  while (store.getters.messageLength > MAX_PAGE * MESSAGE_LIMIT) {
    store.commit('popMessage')
  }
  deleteMessage = false
}

function formatOptions(options) {
  if (options.blacklist) {
    options.blacklist = JSON.parse(options.blacklist)
  }
  if (options.care) {
    options.care = JSON.parse(options.care)
  }
  return options
}

createApp().use(store)
