import request from '@/popup/utils/request'

export function getNotifications(params) {
  return request({
    url: '/api/getNotifications',
    method: 'get',
    params
  })
}

export function countNotifications(params) {
  return request({
    url: '/notifications/unread/count',
    method: 'get',
    params
  })
}

export function makeReadNotifications(type, params) {
  return request({
    url: `/notifications/make-read/${type}`,
    method: 'get',
    params
  })
}
