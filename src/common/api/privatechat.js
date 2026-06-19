import request from './request'

/**
 * 私聊 API 层
 *
 * 根据 fishpi 官方 npm 包（https://github.com/FishPiOffical/fishpi.js），
 * 所有 /chat/* 接口统一返回 { code, msg, data }，code === 0 表示成功。
 */

export function getChatList(params) {
  return request({
    url: '/chat/get-list',
    method: 'get',
    params
  })
}

export function getChatMessage(params) {
  return request({
    url: '/chat/get-message',
    method: 'get',
    params
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
 * 获取未读消息列表
 * 返回 { code, data }，data 为未读消息数组
 */
export function hasUnread(params) {
  return request({
    url: '/chat/has-unread',
    method: 'get',
    params
  })
}
