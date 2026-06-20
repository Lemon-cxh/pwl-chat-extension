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

  webSocket.onopen = () => {
    console.log('Private Chat WebSocket connected')
  }
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
    webSocket.onclose = null // 禁止触发 reconnect
    webSocket.close()
    webSocket = null
  }
}

export async function sendPrivateChatMessage(toUser, content) {
  // 如果连接已关闭，重新打开（此路径在正常流程中不应触发，
  // 因为 openPrivateChat 会在进入聊天时先建立连接）
  if (isClosed()) {
    await openPrivateChatWebSocket(toUser, defaultMessageHandler)
  }
  try {
    webSocket.send(content)
  } catch (e) {
    console.error('发送私聊消息失败:', e)
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
