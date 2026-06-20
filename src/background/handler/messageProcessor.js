import { openWebSocket } from '@/background/manager/WebSocketManager'
import { send } from '@/common/api/chatroom'
import { dispatchAtNotification } from './notificationHandler'
import { sendTabsMessage } from '@/common/utils/chromeUtil'
import { EVENT, TABS_EVENT } from '@/common/constant/Constant'

/**
 * 解析消息并路由分发
 * — 重连检测 → 标记关心/黑名单 → 推送到 popup 或发送浏览器通知
 *
 * @param {*} message 消息内容
 * @param {boolean} isMsg 是否是聊天消息
 * @param {Object} ctx 上下文依赖
 * @param {*} ctx.port popup 长连接端口
 * @param {*} ctx.options 用户选项配置
 * @param {Function} ctx.messageHandler WS 消息回调（供重连使用）
 */
export function processMessage(message, isMsg, { port, options, messageHandler }) {
  if (isMsg) {
    if (reconnectCheck(message, messageHandler)) {
      return
    }
    markCareAndBlack(message, options)
  }
  // 如果 Popup 页面处于打开状态则直接推送消息
  if (port) {
    port.postMessage({ type: EVENT.message, data: message })
    return
  }
  if (!isMsg || message.hidden) {
    return
  }
  // 未启用弹幕消息则直接通知
  if (!options.barrageOptions.enable) {
    dispatchAtNotification(message, { options })
    return
  }
  sendTabsMessage({ type: TABS_EVENT.message, data: message }, (res) => {
    // 推送消息给 content-scripts 时：标签页不存在或隐藏时发送通知
    if (!res || res.hidden) {
      dispatchAtNotification(message, { options })
    }
  })
}

/**
 * 检测巡逻机器人重连消息
 * @param {*} message 消息内容
 * @param {Function} messageHandler WS 消息回调
 * @returns {boolean} 是否触发了重连
 */
export function reconnectCheck(message, messageHandler) {
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
  return false
}

/**
 * 标记特别关心和黑名单
 * @param {*} message 消息对象（原地修改）
 * @param {*} options 用户选项配置
 */
export function markCareAndBlack(message, options) {
  message.isCare =
    options.care && options.care.some((e) => e === message.userName)
  message.hidden =
    options.blacklist && options.blacklist.some((e) => e === message.userName)
}

/**
 * 发送公聊消息（content-scripts 触发的场景）
 * @param {*} data 消息数据
 */
export function sendChatMessage(data) {
  send({ content: data })
}
