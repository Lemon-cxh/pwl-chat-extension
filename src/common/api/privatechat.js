import request from './request'

/**
 * 私聊 API 层 — 统一响应字段约定
 *
 * 根据摸鱼派 API 文档 V2.3.2，标准响应使用 code 字段（0=成功，-1=失败）。
 * /chat/* 私信接口尚未纳入文档（文档标注"请先自行抓包"），
 * 实际返回 result 字段作为状态码。此处做兼容映射，使调用方统一
 * 使用 code === 0 判断成功，与项目其他 API 保持一致。
 */

export function getChatList(params) {
  return request({
    url: '/chat/get-list',
    method: 'get',
    params
  }).then((res) => {
    // 兼容映射：服务端返回 result 时转为 code
    if (res.result !== undefined) {
      res.code = res.result
    }
    return res
  })
}

export function getChatMessage(params) {
  return request({
    url: '/chat/get-message',
    method: 'get',
    params
  }).then((res) => {
    // 兼容映射：服务端返回 result 时转为 code
    if (res.result !== undefined) {
      res.code = res.result
    }
    return res
  })
}

export function markAsRead(params) {
  return request({
    url: '/chat/mark-as-read',
    method: 'get',
    params
  })
}

/**
 * hasUnread 返回的 result 字段语义为未读计数（非成功状态码），
 * 调用方使用 response.result > 0 判断，不做 code 映射。
 */
export function hasUnread(params) {
  return request({
    url: '/chat/has-unread',
    method: 'get',
    params
  })
}
