import { createApp } from 'vue'
import store from './store/index'
import { more, getMessages, send, openRedPacket } from './api/chat'
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

/**
 * 获取设置
 */
getSync({ [STORAGE.options]: defaultOptions }, (result) => {
  options = formatOptions(result.options)
})

/**
 * 监听storage修改
 */
chrome.storage.onChanged.addListener((changes) => {
  if (changes.options) {
    options = formatOptions(changes.options.newValue)
    sendTabsMessage({ type: TABS_EVENT.syncOptions, data: options })
  }
})

window.openSocket = () => {
  store
    .dispatch('getUser')
    .then(() => {
      initWebSocket()
      if (port) {
        port.postMessage({ type: EVENT.userInfo, data: store.getters.userInfo })
      }
    })
    .catch(() => {
      window.webSocket && window.webSocket.close()
    })
}

window.closeSocket = () => {
  window.webSocket && window.webSocket.close()
  store.commit('logout')
}

window.openSocket()

/**
 * 创建WS连接
 */
function initWebSocket() {
  window.closeSocket()
  getLocal([STORAGE.key], (result) => {
    window.webSocket = new WebSocket(URL + '?apiKey=' + result[STORAGE.key])
    if (intervalId != undefined) {
      clearInterval(intervalId)
    }
    intervalId = setInterval(() => {
      window.webSocket.send('-hb-')
    }, 1000 * 60)
    window.webSocket.onmessage = (event) => messageHandler(event)
    window.webSocket.onerror = (e) => {
      console.log('WebSocket error observed:', e)
    }
    window.webSocket.onclose = (e) => {
      console.log('WebSocket close observed:', e)
      reconnect()
    }
    getMoreEvent()
  })
}

/**
 * WS的消息类型处理
 * 如果port连接存在，需要同步信息
 * @param {*} event
 */
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

/**
 * 监听扩展页面、Devtools与background的长连接
 */
chrome.runtime.onConnect.addListener((p) => {
  clearBadgeText()
  if (isClosed()) {
    reconnect()
  }
  port = p
  port.postMessage({ type: EVENT.userInfo, data: store.getters.userInfo })
  port.postMessage({
    type: EVENT.loadMessage,
    data: {
      message: store.getters.message,
      online: store.getters.online,
      discuss: store.getters.discuss,
    },
  })
  port.onMessage.addListener((msg) => {
    switch (msg.type) {
      case EVENT.getMore:
        getMoreEvent()
        break
      case EVENT.markRedPacket:
        store.commit('updateRedPacket', msg.data)
        break
      case EVENT.sendMessage:
        sendMessage(msg.data)
        break
      case EVENT.openRedPacket:
        openRedPacket({ oId: msg.data, apiKey: store.getters.key })
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

/**
 * 监听content-script的短链接
 */
chrome.runtime.onMessage.addListener((request) => {
  if (TABS_EVENT.sendMessage === request.type) {
    sendMessage(request.data)
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

/**
 * 解析消息
 * @param {*} message 消息内容
 * @param {*} isMsg 是否是消息
 * @returns
 */
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

/**
 * @用户的消息时，浏览器提示
 * @param {*} message 消息内容
 */
function atNotifications(message) {
  chrome.browserAction.setBadgeText({ text: '' + ++count })
  chrome.browserAction.setBadgeBackgroundColor({ color: [64, 158, 255, 1] })
  if (message.isCare) {
    notifications(message.userName, message.md)
    return
  }
  if (
    options.atNotification &&
    message.md &&
    -1 !== message.md.indexOf('@' + store.getters.userInfo.userName)
  ) {
    notifications(
      `${message.userName}@了你`,
      message.md.substring(0, message.md.lastIndexOf('<span class='))
    )
  }
}

/**
 * 获取聊天记录
 */
async function getMoreEvent() {
  let lastId = store.getters.lastMessageId
  let res = lastId
    ? await getMessages({
        apiKey: store.getters.key,
        oId: lastId,
        mode: 1,
        size: MESSAGE_LIMIT,
      })
    : await more({ apiKey: store.getters.key, page: 1 })
  if (res.code !== 0) {
    return
  }
  let data = lastId ? res.data.slice(1).reverse() : res.data.reverse()
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
  store.commit('concatMessage', arr)
  if (port) {
    port.postMessage({ type: EVENT.more, data: arr })
  }
}

function sendMessage(data) {
  send({
    content: data + getMessageMark(),
    apiKey: store.getters.key,
  }).then()
}

/**
 * 标记特殊关心和黑名单
 * @param {*} message
 */
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

function isClosed() {
  return (
    !window.webSocket ||
    window.webSocket.readyState === WebSocket.CLOSING ||
    window.webSocket.readyState === WebSocket.CLOSED
  )
}

function reconnect() {
  if (socketLock) {
    return
  }
  socketLock = true
  if (isClosed()) {
    window.openSocket()
    console.log('重新连接了')
  }
  socketLock = false
}

createApp().use(store)
