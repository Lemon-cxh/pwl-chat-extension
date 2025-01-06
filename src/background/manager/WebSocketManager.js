import { getKey } from '@/background/manager/StorageManager'
import { getChannel } from '@/background/api/login'

let webSocket = null
let wssUrl = 'wss://fishpi.cn/chat-room-channel'
let socketLock = false
let heartbeatInterval = null
let defaultMessageHandler = null

export async function openWebSocket(messageHandler) {
  defaultMessageHandler = messageHandler
  if (!isClosed()) {
    closeWebSocket()
  }
  console.log('openWebSocket')
  const nodeData = await getChannel({ apiKey: await getKey() })
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
}

export function closeWebSocket() {
  webSocket && webSocket.close()
  if (heartbeatInterval !== undefined) {
    clearInterval(heartbeatInterval)
  }
}

function startHeartbeat() {
  if (heartbeatInterval !== undefined) {
    clearInterval(heartbeatInterval)
  }
  heartbeatInterval = setInterval(() => {
    webSocket.send('-hb-')
  }, 20 * 1000)
}

async function reconnect() {
  if (socketLock) {
    return
  }
  socketLock = true
  if (isClosed()) {
    await open()
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
