import request from './request'

/**
 * 私聊 API 层
 *
 * 根据 fishpi 官方 npm 包（https://github.com/FishPiOffical/fishpi.js），
 * npm 包以 code 字段判断成功与否，但实际 /chat/* 端点返回的字段名是 result。
 * 本模块在 API 层统一将 result 映射为 code，上层调用者统一使用 code === 0 判断。
 * URL 格式：chat/xxx（相对路径，由 baseURL 'https://fishpi.cn' 拼接）。
 */

/**
 * 将 /chat/* 端点的响应字段 result 映射为 code，保持与项目其他 API 一致。
 * /chat/* 返回：{ result, data, cached }
 * 映射后：     { code, data, cached }
 */
function normalizeResponse(res) {
  if (res && 'result' in res && !('code' in res)) {
    res.code = res.result
  }
  return res
}

/**
 * 获取私聊会话列表
 * @param {Object} params — 可选查询参数
 * @returns {Promise<{code, data}>} data 为会话数组
 */
export function getChatList(params) {
  return request({
    url: 'chat/get-list',
    method: 'get',
    params
  }).then(normalizeResponse)
}

/**
 * 获取与指定用户的聊天记录
 * @param {Object} params — { toUser, page, pageSize }
 * @returns {Promise<{code, data}>} data 为消息数组（倒序）
 */
export function getChatMessage(params) {
  return request({
    url: 'chat/get-message',
    method: 'get',
    params
  }).then(normalizeResponse)
}

/**
 * 将指定用户的私聊消息标记为已读
 * @param {Object} params — { fromUser }
 * @returns {Promise<{code, msg}>}
 */
export function markAsRead(params) {
  return request({
    url: 'chat/mark-as-read',
    method: 'get',
    params
  }).then(normalizeResponse)
}

/**
 * 获取未读消息列表
 * @param {Object} params — 可选查询参数
 * @returns {Promise<{code, data}>} data 为未读消息数组
 */
export function hasUnread(params) {
  return request({
    url: 'chat/has-unread',
    method: 'get',
    params
  }).then(normalizeResponse)
}

/**
 * 获取未读私聊消息数（简化版，UserInfo 使用）
 * @returns {Promise<number>} 未读消息数，失败返回 0
 */
export async function getUnreadChatCount() {
  try {
    const res = await hasUnread()
    if (res.code === 0 && Array.isArray(res.data)) {
      return res.data.length
    }
    return 0
  } catch {
    return 0
  }
}
