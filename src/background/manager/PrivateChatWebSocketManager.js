import { getKey } from '@/common/manager/StorageManager'

let webSocket = null
let webSocketReady = null // Promise，在 onopen 时 resolve
const wssUrl = 'wss://fishpi.cn/chat-channel'
let socketLock = false
let defaultMessageHandler = null
let currentToUser = null

/**
 * 打开私聊 WebSocket 连接
 * 返回一个在连接就绪时 resolve、出错时 reject 的 Promise
 */
export async function openPrivateChatWebSocket(toUser, messageHandler) {
  defaultMessageHandler = messageHandler
  currentToUser = toUser
  if (!isClosed()) {
    closePrivateChatWebSocket()
  }
  console.log('openPrivateChatWebSocket', { toUser })

  const apiKey = await getKey()
  webSocket = new WebSocket(`${wssUrl}?apiKey=${apiKey}&toUser=${toUser}`)

  // 创建就绪 Promise，供 sendPrivateChatMessage 等待
  webSocketReady = new Promise((resolve, reject) => {
    const onOpen = () => {
      console.log('Private Chat WebSocket connected')
      resolve()
    }
    const onError = (e) => {
      console.error('Private Chat WebSocket error observed:', e)
      reject(new Error('WebSocket 连接失败'))
    }
    webSocket.addEventListener('open', onOpen, { once: true })
    webSocket.addEventListener('error', onError, { once: true })
  })

  webSocket.onmessage = (event) => {
    console.log('Received WebSocket message:', event.data)
    defaultMessageHandler && defaultMessageHandler(event)
  }
  webSocket.onclose = (e) => {
    console.log('Private Chat WebSocket close observed:', e)
    webSocketReady = null // 连接关闭后清除就绪 Promise
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
  webSocketReady = null
}

/**
 * 发送私聊消息
 * 自动等待 WebSocket 连接就绪后再发送
 */
export async function sendPrivateChatMessage(toUser, content) {
  // 如果连接已关闭，先重新打开
  if (isClosed()) {
    await openPrivateChatWebSocket(toUser, defaultMessageHandler)
  }
  // 等待 WebSocket 就绪
  if (webSocketReady) {
    try {
      await webSocketReady
    } catch (e) {
      console.error('等待 WebSocket 就绪失败:', e)
      throw e
    }
  }
  // 二次确认：就绪后可能又被关闭了
  if (isClosed() || webSocket.readyState !== WebSocket.OPEN) {
    throw new Error('WebSocket 未连接')
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
