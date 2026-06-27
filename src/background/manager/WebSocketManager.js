import { getKey } from '@/common/manager/StorageManager'
import { getChannel } from '@/common/api/channel'

let webSocket = null
let userWebSocket = null
let wssUrl = 'wss://fishpi.cn/chat-room-channel'
// 用于累计用户在线时间
const userChannelWssUrl = 'wss://fishpi.cn/user-channel?apiKey='
let socketLock = false
let connecting = false
let heartbeatInterval = null
let defaultMessageHandler = null

export async function openWebSocket(messageHandler) {
  // 防止并发调用导致创建多条 WS 连接
  if (connecting) {
    console.log('openWebSocket 已在进行中，跳过重复调用')
    return
  }
  connecting = true
  try {
    defaultMessageHandler = messageHandler
    closeWebSocket()
    console.log('openWebSocket')
    const apiKey = await getKey()
    const nodeData = await getChannel()
    if (nodeData.code === 0) {
      wssUrl = nodeData.data
    }
    webSocket = new WebSocket(wssUrl)

    startHeartbeat()

    webSocket.onmessage = (event) => defaultMessageHandler && defaultMessageHandler(event)
    webSocket.onerror = (e) => {
      console.log('WebSocket error observed:', e)
    }
    webSocket.onclose = (e) => {
      console.log('WebSocket close observed:', e)
      if (e.code !== 1000 && e.code !== 1001) {
        reconnect()
      }
    }

    userWebSocket = new WebSocket(userChannelWssUrl + apiKey)
  } finally {
    connecting = false
  }
}

export function closeWebSocket() {
  if (webSocket) {
    webSocket.onclose = null
    webSocket.close(1000, 'normal close')
    webSocket = null
  }
  if (userWebSocket) {
    userWebSocket.onclose = null
    userWebSocket.close(1000, 'normal close')
    userWebSocket = null
  }
  if (heartbeatInterval != null) {
    clearInterval(heartbeatInterval)
    heartbeatInterval = null
  }
}

function startHeartbeat() {
  if (heartbeatInterval !== undefined) {
    clearInterval(heartbeatInterval)
  }
  heartbeatInterval = setInterval(() => {
    try {
      webSocket.send('-hb-')
    } catch (e) {
      reconnect()
    }
  }, 20 * 1000)
}

async function reconnect() {
  if (socketLock) {
    return
  }
  socketLock = true
  if (isClosed()) {
    await openWebSocket(defaultMessageHandler)
    console.log('重新连接了')
  }
  socketLock = false
}

export function isClosed() {
  return (
    !webSocket ||
    webSocket.readyState === WebSocket.CLOSING ||
    webSocket.readyState === WebSocket.CLOSED
  )
}
