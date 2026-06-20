import {
  refreshKey,
  getUser,
  setOnline,
  setDiscuss
} from '@/common/manager/StorageManager'
import {
  openWebSocket,
  closeWebSocket,
  isClosed
} from '@/background/manager/WebSocketManager'
import {
  openPrivateChatWebSocket,
  closePrivateChatWebSocket,
  sendPrivateChatMessage
} from './manager/PrivateChatWebSocketManager'
import { send, openRedPacket } from '@/common/api/chatroom'
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
let privateChatPort = null
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
  // 监听 key 变化：新 key 写入说明已登录或 key 已刷新，尝试建立 WS 连接
  if (changes.keyStorage && changes.keyStorage.newValue) {
    if (isClosed()) {
      openWebSocket(messageHandler)
    }
  }
  // 监听 key 被清除：说明已登出，关闭 WS
  if (changes.keyStorage && !changes.keyStorage.newValue) {
    closeWebSocket()
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
const messageHandler = function messageHandler(event) {
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
        port.postMessage({ type: EVENT.discussChanged, data })
      }
      break
    default:
      messageEvent(data, data.type === MESSAGE_TYPE.msg)
      break
  }
}

/**
 * 监听扩展页面、Devtools与background的长连接
 */
chrome.runtime.onConnect.addListener((p) => {
  // 私聊端口
  if (p.name === 'privateChat') {
    privateChatPort = p
    privateChatPort.onMessage.addListener((msg) => {
      handlePrivateChatMessage(msg).catch((e) =>
        console.error('处理私聊消息失败:', e)
      )
    })
    privateChatPort.onDisconnect.addListener(() => {
      // 只有当前活跃的端口断开时才清理 WS（防止旧端口晚于新端口触发）
      if (privateChatPort === p) {
        closePrivateChatWebSocket()
        privateChatPort = null
      }
    })
    return
  }
  // 公聊端口（ChatRoom）
  clearBadgeText()
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
    openWebSocket(messageHandler)
  }
  if (EVENT.LOGIN_OUT === request.type) {
    closeWebSocket()
  }
  if (TABS_EVENT.sendMessage === request.type) {
    sendMessage(request.data)
    return
  }
  if (TABS_EVENT.openRedPacket === request.type) {
    openRedPacket({ oId: request.data }).then(async (res) => {
      sendTabsMessage({
        type: TABS_EVENT.markRedPacket,
        data: {
          data: res,
          userName: await getUser().userName,
          oId: request.data
        }
      })
    })
  }
  // 私聊相关事件
  if (TABS_EVENT.openPrivateChat === request.type) {
    openPrivateChatWebSocket(request.data.toUser, (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'msg') {
        sendTabsMessage({
          type: TABS_EVENT.privateMessage,
          data
        })
      }
    })
  }
  if (TABS_EVENT.closePrivateChat === request.type) {
    closePrivateChatWebSocket()
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
  // 如果Popup页面处于打开状态则推送消息
  if (port) {
    port.postMessage({ type: EVENT.message, data: message })
    return
  }
  if (!isMsg || message.hidden) {
    return
  }
  // 没有启用弹幕消息则直接通知
  if (!options.barrageOptions.enable) {
    atNotifications(message)
    return
  }
  sendTabsMessage({ type: TABS_EVENT.message, data: message }, (res) => {
    // 推送消息给content-scripts时：如果标签页不存在 || 标签页隐藏时
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
    openWebSocket(messageHandler)
    return true
  }
  matchMsg = message.md.match(/你的连接被管理员断开/)
  if (matchMsg) {
    openWebSocket(messageHandler)
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
    notifications(
      `${message.userName}@了你`,
      message.md,
      message.userAvatarURL
    )
  }
}

function sendMessage(data) {
  send({ content: data })
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

/**
 * 处理私聊端口消息（异步，确保 WS 操作完成）
 * @param {*} msg 从 popup 端口接收的消息
 */
async function handlePrivateChatMessage(msg) {
  switch (msg.type) {
    case EVENT.openPrivateChat:
      await openPrivateChatWebSocket(msg.data.toUser, (event) => {
        const data = JSON.parse(event.data)
        if (data.type === 'msg') {
          privateChatPort.postMessage({
            type: EVENT.privateMessage,
            data
          })
        }
      })
      break
    case EVENT.closePrivateChat:
      closePrivateChatWebSocket()
      break
    case EVENT.sendPrivateMessage:
      try {
        await sendPrivateChatMessage(msg.data.toUser, msg.data.content)
      } catch (e) {
        console.error('发送私聊消息失败:', e)
        if (privateChatPort) {
          privateChatPort.postMessage({
            type: EVENT.privateMessage,
            data: { type: 'error', msg: '发送失败，请重试' }
          })
        }
      }
      break
    default:
      break
  }
}
