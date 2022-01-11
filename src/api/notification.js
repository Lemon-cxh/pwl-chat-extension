import request from '@/utils/request'

export function getNotifications(data) {
  return request({
    url: '/api/getNotifications',
    method: 'get',
    params: data
  })
}

export function countNotifications(data) {
  return request({
    url: '/notifications/unread/count',
    method: 'get',
    params: data
  })
}

export function makeReadNotifications(type, data) {
  return request({
    url: '/notifications/make-read/' + type,
    method: 'get',
    params: data
  })
}