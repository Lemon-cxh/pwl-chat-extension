import { isRedPacket } from '@/common/utils/util'
import { MESSAGE_TYPE } from '@/common/constant/Constant'

/**
 * +1 消息折叠 —— 新消息到达时，与顶部消息 md 相同则合并 user 列表
 * @param {Array} messages - 消息数组
 * @param {Object} message - 新消息对象
 * @returns {boolean} 是否进行了折叠（true=折叠, false=新增）
 */
export function foldNewMessage(messages, message) {
  const last = messages[0]
  if (!last || isRedPacket(message) || message.md !== last.md) {
    messages.unshift(message)
    return false
  }
  const users = last.users ? [...last.users] : []
  users.push({
    userName: message.userName,
    userAvatarURL: message.userAvatarURL
  })
  last.users = users
  last.oIds = last.oIds ? [...last.oIds, message.oId] : [message.oId]
  return true
}

/**
 * 底部消息拼接与折叠 —— 加载历史消息时，边界消息内容相同则合并
 * @param {Array} messages - 消息数组
 * @param {Array} newData - 新加载的历史数据
 */
export function concatWithFold(messages, newData) {
  const index = messages.length - 1
  if (index < 0) {
    messages.push(...newData)
    return
  }
  const last = messages[index]
  const firstNew = newData[0]
  if (!last || last.content !== firstNew.content) {
    messages.push(...newData)
    return
  }
  // 合并 user 列表和 oId 列表
  const { users = [], oIds = [] } = firstNew
  users.push({
    userName: last.userName,
    userAvatarURL: last.userAvatarURL
  })
  oIds.push(last.oId)
  if (last.users) {
    firstNew.users = users.concat(last.users)
    firstNew.oIds = oIds.concat(last.oIds)
  } else {
    firstNew.users = users
    firstNew.oIds = oIds
  }
  messages[index] = firstNew
  messages.push(...newData.slice(1))
}

/**
 * 批量历史消息的顶部折叠 —— 遍历数组并将 md 相同的相邻消息折叠
 * @param {Array} arr - 消息数组
 * @param {Array} data - 待插入的历史数据
 */
export function unshiftWithFold(arr, data) {
  for (let index = 0; index < data.length; index++) {
    if (index === 0) {
      arr.unshift(data[index])
      continue
    }
    const e = data[index]
    const last = arr[0]
    if (last.content !== e.content) {
      arr.unshift(e)
      continue
    }
    const { users = [], oIds = [] } = last
    users.push({
      userName: e.userName,
      userAvatarURL: e.userAvatarURL
    })
    oIds.push(e.oId)
    arr[0].users = users
    arr[0].oIds = oIds
  }
}

/**
 * 更新红包领取状态
 * @param {Array} messages - 消息数组
 * @param {Object} data - { oId, got }
 * @returns {boolean} 是否找到并更新了消息
 */
export function updateRedPacketStatus(messages, data) {
  return messages.some((e) => {
    if (e.oId === data.oId && e.type !== MESSAGE_TYPE.redPacketStatus) {
      const msg = JSON.parse(e.content)
      if (msg.got >= msg.count) {
        return true
      }
      msg.got = data.got ? data.got : msg.count
      e.content = JSON.stringify(msg)
      return true
    }
    return false
  })
}

/**
 * 撤回消息 —— 标记消息为已撤回，支持折叠消息组内的 oId 查找
 * @param {Array} messages - 消息数组
 * @param {string|number} oId - 要撤回的消息 ID
 * @returns {boolean} 是否找到并标记了消息
 */
export function revokeMessage(messages, oId) {
  return messages.some((e) => {
    if (
      e.type === MESSAGE_TYPE.msg &&
      (e.oId === oId || (e.oIds && e.oIds.some((id) => id === oId)))
    ) {
      e.revoke = true
      return true
    }
    return false
  })
}
