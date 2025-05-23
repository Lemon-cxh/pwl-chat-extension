import { getKey } from '@/common/manager/StorageManager'

let webSocket = null
const wssUrl = 'wss://fishpi.cn/chat-channel'
let socketLock = false
let defaultMessageHandler = null
let currentToUser = null

export async function openPrivateChatWebSocket(toUser, messageHandler) {
  defaultMessageHandler = messageHandler
  currentToUser = toUser
  if (!isClosed()) {
    closePrivateChatWebSocket()
  }
  console.log('openPrivateChatWebSocket', { toUser })
  const apiKey = await getKey()
  webSocket = new WebSocket(`${wssUrl}?apiKey=${apiKey}&toUser=${toUser}`)

  webSocket.onmessage = (event) => {
    console.log('Received WebSocket message:', event.data)
    defaultMessageHandler && defaultMessageHandler(event)
  }
  webSocket.onerror = (e) => {
    console.error('Private Chat WebSocket error observed:', e)
  }
  webSocket.onclose = (e) => {
    console.log('Private Chat WebSocket close observed:', e)
    if (e.code !== 1000 && e.code !== 1001) {
      reconnect()
    }
  }
}

export function closePrivateChatWebSocket() {
  if (webSocket) {
    webSocket.close()
    webSocket = null
  }
}

export async function sendPrivateChatMessage(toUser, content) {
  if (isClosed()) {
    await openPrivateChatWebSocket(toUser, defaultMessageHandler)
  }
  try {
    webSocket.send(content)
  } catch (e) {
    console.error('Failed to send private chat message:', e)
    throw e
  }
}

async function reconnect() {
  if (socketLock) {
    return
  }
  socketLock = true
  try {
    if (isClosed() && currentToUser && defaultMessageHandler) {
      await openPrivateChatWebSocket(currentToUser, defaultMessageHandler)
      console.log('重新连接了私聊')
    }
  } catch (error) {
    console.error('重连失败:', error)
  } finally {
    socketLock = false
  }
}

function isClosed() {
  return (
    !webSocket ||
    webSocket.readyState === WebSocket.CLOSING ||
    webSocket.readyState === WebSocket.CLOSED
  )
}
