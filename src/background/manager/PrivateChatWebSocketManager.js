import { getKey } from '@/common/manager/StorageManager'

let webSocket = null
let webSocketReady = null // Promise<void> — WS open 后 resolve
let webSocketReadyReject = null // reject 函数引用，用于外部主动关闭时拒绝等待者
const wssUrl = 'wss://fishpi.cn/chat-channel'
const WS_READY_TIMEOUT = 10000 // 等待 WS 就绪的超时时间（毫秒）
let socketLock = false
let defaultMessageHandler = null
let currentToUser = null

/**
 * 拒绝当前 webSocketReady Promise
 * 用于 closePrivateChatWebSocket 和 openPrivateChatWebSocket（替换旧 WS）时，
 * 避免 sendPrivateChatMessage 中的 await webSocketReady 永久挂起。
 * 幂等：resolve 后 webSocketReadyReject 为 null，此调用无操作。
 */
function rejectReady(reason) {
  if (webSocketReadyReject) {
    webSocketReadyReject(new Error(reason))
    webSocketReadyReject = null
    webSocketReady = null
  }
}

/**
 * 打开私聊 WebSocket 连接
 *
 * 创建 webSocketReady Promise：
 * - resolve：收到 WebSocket open 事件
 * - reject：超时（WS_READY_TIMEOUT）或 open 之前 close
 *
 * **不在 error 事件时 reject**——WebSocket error 可能在 open 前
 * 以瞬态网络问题触发，之后仍可能成功 open。
 *
 * @param {string} toUser 对方用户名
 * @param {Function} messageHandler 消息回调 (event) => void
 */
export async function openPrivateChatWebSocket(toUser, messageHandler) {
  defaultMessageHandler = messageHandler
  currentToUser = toUser

  // 关闭旧连接，同时拒绝等待中的 webSocketReady（避免旧 awaiters 永久挂起）
  if (!isClosed()) {
    closePrivateChatWebSocket()
  }
  console.log('openPrivateChatWebSocket', { toUser })

  const apiKey = await getKey()
  webSocket = new WebSocket(`${wssUrl}?apiKey=${apiKey}&toUser=${toUser}`)

  // 创建就绪 Promise：open 时 resolve，超时/提前关闭时 reject
  webSocketReady = new Promise((resolve, reject) => {
    webSocketReadyReject = reject

    const timeoutId = setTimeout(() => {
      rejectReady('WebSocket 连接超时')
    }, WS_READY_TIMEOUT)

    webSocket.addEventListener('open', () => {
      console.log('Private Chat WebSocket connected')
      clearTimeout(timeoutId)
      webSocketReadyReject = null // resolve 后禁止外部拒绝
      resolve()
    }, { once: true })

    // 在 open 之前 close → 连接失败
    webSocket.addEventListener('close', (e) => {
      clearTimeout(timeoutId)
      rejectReady(`WebSocket 连接失败，关闭码: ${e.code}`)
    }, { once: true })
  })

  webSocket.onmessage = (event) => {
    console.log('Received WebSocket message:', event.data)
    defaultMessageHandler && defaultMessageHandler(event)
  }
  webSocket.onerror = (e) => {
    // error 事件仅记录日志，不改变 webSocketReady 状态
    // (WebSocket 可能在 error 之后仍然成功 open)
    console.error('Private Chat WebSocket error observed:', e)
  }
  webSocket.onclose = (e) => {
    console.log('Private Chat WebSocket closed:', e)
    webSocketReady = null
    webSocketReadyReject = null
    if (e.code !== 1000 && e.code !== 1001) {
      reconnect()
    }
  }
}

/**
 * 关闭私聊 WebSocket
 * 拒绝等待中的 webSocketReady，避免 sendPrivateChatMessage 永久挂起
 */
export function closePrivateChatWebSocket() {
  if (webSocket) {
    webSocket.onclose = null // 禁止触发 reconnect
    webSocket.close()
    webSocket = null
  }
  // 拒绝等待中的就绪 Promise
  rejectReady('WebSocket 连接已关闭')
}

/**
 * 发送私聊消息
 *
 * 调用流程：
 * 1. 若 WS 已关闭则先打开连接
 * 2. 等待 WS 就绪（webSocketReady），带超时兜底
 * 3. 就绪后二次确认 WS 仍为 OPEN 状态
 * 4. 发送内容
 *
 * 异常会向上抛给 handlePrivateChatMessage，由其通过 port 通知 popup
 *
 * @param {string} toUser 对方用户名
 * @param {string} content 消息内容（纯文本，非 JSON）
 */
export async function sendPrivateChatMessage(toUser, content) {
  // 如果连接已关闭，先重新打开
  if (isClosed()) {
    await openPrivateChatWebSocket(toUser, defaultMessageHandler)
  }
  // 等待 WebSocket 就绪（可能因关闭/超时而 reject）
  if (webSocketReady) {
    await webSocketReady
  }
  // 二次确认：等待期间连接可能又被关闭了
  if (isClosed() || webSocket.readyState !== WebSocket.OPEN) {
    throw new Error('WebSocket 未连接')
  }
  webSocket.send(content)
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
