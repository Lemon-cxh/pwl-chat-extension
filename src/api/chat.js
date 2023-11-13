import request from '@/utils/request'

export function unread(params) {
  return request({
    url: 'chat/has-unread',
    method: 'get',
    params
  })
}

export function list(params) {
  return request({
    url: 'chat/get-list',
    method: 'get',
    params
  })
}
