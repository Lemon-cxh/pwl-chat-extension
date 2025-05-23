import request from '@/popup/utils/request'

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
export function hasUnread(params) {
  return request({
    url: '/chat/has-unread',
    method: 'get',
    params
  })
}
