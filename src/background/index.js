import {
  refreshKey,
  getKey,
  getUser,
  setOnline,
  setDiscuss
} from '@/common/manager/StorageManager'
import {
  openWebSocket,
  closeWebSocket
} from '@/background/manager/WebSocketManager'
import { send, openRedPacket } from '@/background/api/index'
import {
  notifications,
  sendTabsMessage,
  getOptions,
  formatOptions
} from '@/common/utils/chromeUtil'
import {
  MESSAGE_TYPE,
  EVENT,
  TABS_EVENT,
  defaultOptions
} from '@/common/constant/Constant'

// 与popup页面的通信
let port = null
// 未读消息数
let count = 0
let options = defaultOptions
let careOnline = []

chrome.runtime.onInstalled.addListener(() => {
  // eslint-disable-next-line no-undef
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false })
})

/**
 * 获取设置
 */
getOptions().then((result) => {
  options = formatOptions(result)
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

function init() {
  refreshKey()
    .then(() => openWebSocket(messageHandler))
    .catch(() => closeWebSocket())
}

init()

/**
 * WS的消息类型处理
 * 如果port连接存在，需要同步信息
 * @param {*} event
 */
function messageHandler(event) {
  const data = JSON.parse(event.data)
  switch (data.type) {
    case MESSAGE_TYPE.online:
      setOnline(data)
      setDiscuss(data.discussing)
      if (port) {
        port.postMessage({ type: EVENT.online, data })
      }
      onlineEvent(data)
      break
    case MESSAGE_TYPE.revoke:
      if (port) {
        port.postMessage({ type: EVENT.revoke, data: data.oId })
      }
      break
    case MESSAGE_TYPE.redPacketStatus:
      if (options.hideRedPacketMessage) {
        data.hidden = true
      }
      messageEvent(data, false)
      if (port) {
        port.postMessage({ type: EVENT.redPacketStatus, data })
      }
      break
    case MESSAGE_TYPE.discussChanged:
      messageEvent(data, false)
      setDiscuss(data.newDiscuss)
      if (port) {
        port.postMessage({ type: EVENT.discussChanged, data: data.newDiscuss })
      }
      break
    case MESSAGE_TYPE.msg:
      messageEvent(data, data.type === MESSAGE_TYPE.msg)
      break
    default:
      break
  }
}

/**
 * 监听扩展页面、Devtools与background的长连接
 */
chrome.runtime.onConnect.addListener((p) => {
  clearBadgeText()
  console.log(p)
  port = p
  port.onMessage.addListener((msg) => {
    switch (msg.type) {
      case EVENT.getMore:
        // getMoreEvent()
        break
      case EVENT.markRedPacket:
        // store.commit('updateRedPacket', msg.data)
        break
      // case EVENT.sendMessage:
      //   sendMessage(msg.data)
      //   break
      case EVENT.openRedPacket:
        // openRedPacket({ oId: msg.data, apiKey: store.getters.key })
        break
      default:
        break
    }
  })
  port.onDisconnect.addListener(() => {
    port = null
  })
})

/**
 * 监听content-scripts的短链接
 */
chrome.runtime.onMessage.addListener((request) => {
  // 登录事件触发链接 WebSocket
  if (EVENT.LOGIN === request.type) {
    openWebSocket()
  }
  if (TABS_EVENT.sendMessage === request.type) {
    sendMessage(request.data)
    return
  }
  if (TABS_EVENT.openRedPacket === request.type) {
    getKey().then((apiKey) => {
      openRedPacket({ oId: request.data, apiKey }).then(async (res) => {
        sendTabsMessage({
          type: TABS_EVENT.markRedPacket,
          data: {
            data: res,
            userName: await getUser().userName,
            oId: request.data
          }
        })
      })
    })
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
  if (port) {
    port.postMessage({ type: EVENT.message, data: message })
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
    openWebSocket()
    return true
  }
  matchMsg = message.md.match(/你的连接被管理员断开/)
  if (matchMsg) {
    openWebSocket()
    return true
  }
}

/**
 * @用户的消息时，浏览器提示
 * @param {*} message 消息内容
 */
async function atNotifications(message) {
  if (options.showUnReadCount && message.type === MESSAGE_TYPE.msg) {
    chrome.action.setBadgeText({ text: '' + ++count })
    chrome.action.setBadgeBackgroundColor({ color: [64, 158, 255, 1] })
  }
  if (message.isCare) {
    notifications(message.userName, message.md, message.userAvatarURL)
    return
  }
  if (
    options.atNotification &&
    message.md &&
    message.md.indexOf('@' + (await getUser()).userName) !== -1
  ) {
    notifications(`${message.userName}@了你`, message.md, message.userAvatarURL)
  }
}

function sendMessage(data) {
  getKey().then((apiKey) => {
    send({
      content: data,
      apiKey
    })
  })
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
