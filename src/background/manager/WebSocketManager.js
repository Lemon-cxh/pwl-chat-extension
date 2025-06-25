import { getKey } from '@/common/manager/StorageManager'
import { getChannel } from '@/background/api/index'

let webSocket = null
let userWebSocket = null
let wssUrl = 'wss://fishpi.cn/chat-room-channel'
// 用于累计用户在线时间
const userChannelWssUrl = 'wss://fishpi.cn/user-channel?apiKey='
let socketLock = false
let heartbeatInterval = null
let defaultMessageHandler = null

export async function openWebSocket(messageHandler) {
  defaultMessageHandler = messageHandler
  if (!isClosed()) {
    closeWebSocket()
  }
  console.log('openWebSocket')
  const apiKey = await getKey()
  const nodeData = await getChannel({ apiKey })
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
}

export function closeWebSocket() {
  webSocket && webSocket.close()
  userWebSocket && userWebSocket.close()
  if (heartbeatInterval !== undefined) {
    clearInterval(heartbeatInterval)
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

function isClosed() {
  return (
    !webSocket ||
    webSocket.readyState === WebSocket.CLOSING ||
    webSocket.readyState === WebSocket.CLOSED
  )
}
