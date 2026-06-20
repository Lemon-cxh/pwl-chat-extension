import { notifications } from '@/common/utils/chromeUtil'
import { getUser } from '@/common/manager/StorageManager'
import { MESSAGE_TYPE } from '@/common/constant/Constant'

/* global chrome */

// 未读消息 badge 计数
let count = 0
// 上一轮特别关心在线列表（用于对比上下线）
let careOnline = []

/**
 * 检测特别关心用户的上线/下线变化并发送通知
 * @param {*} data WS 推送的 online 数据
 * @param {*} options 用户选项配置
 */
export function dispatchOnlineChange(data, { options }) {
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
 * @ 用户消息时发送浏览器通知 + 更新扩展 badge
 * @param {*} message 消息内容
 * @param {*} options 用户选项配置
 */
export async function dispatchAtNotification(message, { options }) {
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

/**
 * 清除 badge 并重置计数
 */
export function resetBadgeCount() {
  count = 0
  chrome.action.setBadgeText({ text: '' })
}
