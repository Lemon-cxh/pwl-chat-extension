import store from '../store/index'
import {
  more,
  getMessages,
  send,
  openRedPacket,
  getChannel
} from '../api/chatroom'
import {
  notifications,
  getLocal,
  sendTabsMessage,
  getOptions,
  formatOptions
} from '../utils/chromeUtil'
import {
  MESSAGE_TYPE,
  STORAGE,
  EVENT,
  MESSAGE_LIMIT,
  TABS_EVENT,
  defaultOptions
} from '../constant/Constant'

let URL = 'wss://fishpi.cn/chat-room-channel'
let socketLock = false
// 是否为主动关闭
let isIntentionalClose = false
// 最大保留两页消息
const MAX_PAGE = 2
let intervalId
// 与popup页面的通信
let port = null
let deleteMessage = false
// 未读消息数
let count = 0
let options = defaultOptions
let careOnline = []
let webSocket

/**
 * 获取设置
 */
getOptions().then((result) => {
  options = formatOptions(result)
})

/**
 * 右键扩展图标时弹出的菜单
 */
chrome.contextMenus.create({
  title: '刷新',
  contexts: ['browser_action'],
  onclick: function () {
    initWebSocket()
  }
})

/**
 * 监听storage修改
 */
/* global chrome */
chrome.storage.onChanged.addListener((changes) => {
  if (changes.options) {
    options = formatOptions(changes.options.newValue)
    sendTabsMessage({ type: TABS_EVENT.syncOptions, data: options })
  }
})

function openSocket() {
  store
    .dispatch('getUser')
    .then(() => {
      initWebSocket()
      if (port) {
        port.postMessage({ type: EVENT.userInfo, data: store.getters.userInfo })
      }
    })
    .catch(() => {
      !isClosed() && closeSocket()
    })
}

/**
 * 手动关闭连接
 */
function closeSocket() {
  isIntentionalClose = true
  webSocket && webSocket.close()
  if (intervalId !== undefined) {
    clearInterval(intervalId)
  }
}

openSocket()

/**
 * 创建WS连接
 */
function initWebSocket() {
  if (!isClosed()) {
    closeSocket()
  }
  getLocal([STORAGE.key], async (result) => {
    isIntentionalClose = false
    const nodeData = await getChannel({ apiKey: store.getters.key })
    if (nodeData.code === 0) {
      URL = nodeData.data
    }
    webSocket = new WebSocket(URL)
    if (intervalId !== undefined) {
      clearInterval(intervalId)
    }
    intervalId = setInterval(() => {
      webSocket.send('-hb-')
    }, 1000 * 60 * 3)
    webSocket.onmessage = (event) => messageHandler(event)
    webSocket.onerror = (e) => {
      console.log('WebSocket error observed:', e)
    }
    webSocket.onclose = (e) => {
      console.log('WebSocket close observed:', e)
      if (!isIntentionalClose && e.code !== 1000 && e.code !== 1001) {
        reconnect()
      }
    }
    store.commit('cleanMessage')
    getMoreEvent()
  })
}

/**
 * WS的消息类型处理
 * 如果port连接存在，需要同步信息
 * @param {*} event
 */
function messageHandler(event) {
  const data = JSON.parse(event.data)
  switch (data.type) {
    case MESSAGE_TYPE.online:
      if (port) {
        port.postMessage({ type: EVENT.online, data })
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
        port.postMessage({ type: EVENT.redPacketStatus, data })
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
      messageEvent(data, data.type === MESSAGE_TYPE.msg)
      clearMessage()
  }
}

/**
 * 监听扩展页面、Devtools与background的长连接
 */
chrome.runtime.onConnect.addListener((p) => {
  clearBadgeText()
  port = p
  port.postMessage({ type: EVENT.userInfo, data: store.getters.userInfo })
  port.postMessage({
    type: EVENT.loadMessage,
    data: {
      message: store.getters.message,
      online: store.getters.online,
      discuss: store.getters.discuss
    }
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
 * 监听content-scripts的短链接
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
            oId: request.data
          }
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
    if (reconnectEvent(message)) {
      return
    }
    markCareAndBlack(message)
  }
  store.commit('addMessage', { message, isMsg })
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
  const currentOnline = data.users
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
 * 重连消息事件处理
 */
function reconnectEvent(message) {
  if (message.userName !== '摸鱼派官方巡逻机器人') {
    return false
  }
  let matchMsg = message.md.match(/您超过6小时未活跃/)
  if (matchMsg) {
    initWebSocket()
    return true
  }
  matchMsg = message.md.match(/你的连接被管理员断开/)
  if (matchMsg) {
    initWebSocket()
    return true
  }
}

/**
 * @用户的消息时，浏览器提示
 * @param {*} message 消息内容
 */
function atNotifications(message) {
  if (options.showUnReadCount && message.type === MESSAGE_TYPE.msg) {
    chrome.browserAction.setBadgeText({ text: '' + ++count })
    chrome.browserAction.setBadgeBackgroundColor({ color: [64, 158, 255, 1] })
  }
  if (message.isCare) {
    notifications(message.userName, message.md)
    return
  }
  if (
    options.atNotification &&
    message.md &&
    message.md.indexOf('@' + store.getters.userInfo.userName) !== -1
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
  const lastId = store.getters.lastMessageId
  const res = lastId
    ? await getMessages({
      apiKey: store.getters.key,
      oId: lastId,
      mode: 1,
      size: MESSAGE_LIMIT
    })
    : await more({ apiKey: store.getters.key, page: 1 })
  if (res.code !== 0) {
    return
  }
  const data = lastId ? res.data.slice(1).reverse() : res.data.reverse()
  const arr = []
  for (let index = 0; index < data.length; index++) {
    if (index === 0) {
      markCareAndBlack(data[index])
      arr.unshift(data[index])
      continue
    }
    const e = data[index]
    const last = arr[0]
    if (last.content !== e.content) {
      markCareAndBlack(e)
      arr.unshift(e)
      continue
    }
    const { users = [], oIds = [] } = last
    users.push({
      userName: e.userName,
      userAvatarURL: e.userAvatarURL
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
    content: data,
    apiKey: store.getters.key
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
  chrome.action.setBadgeText({ text: '' })
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

function isClosed() {
  return (
    !webSocket ||
    webSocket.readyState === WebSocket.CLOSING ||
    webSocket.readyState === WebSocket.CLOSED
  )
}

async function reconnect() {
  if (socketLock) {
    return
  }
  socketLock = true
  if (isClosed()) {
    await initWebSocket()
    console.log('重新连接了')
  }
  socketLock = false
}
