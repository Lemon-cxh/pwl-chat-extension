import request from '@/utils/request'

export function liveness(data) {
  return request({
    url: '/user/liveness',
    method: 'get',
    params: data
  })
}

export function getLivenessReward(data) {
  return request({
    url: '/activity/yesterday-liveness-reward-api',
    method: 'get',
    params: data
  })
}

export function isCollectedLiveness(data) {
  return request({
    url: '/api/activity/is-collected-liveness',
    method: 'get',
    params: data
  })
}

export function getUserInfo(name, data) {
  return request({
    url: '/user/' + name,
    method: 'get',
    params: data
  })
}

export function getUserName(data) {
  return request({
    url: '/users/names',
    method: 'post',
    data: data
  })
}

export function countNotifications(data) {
  return request({
    url: '/notifications/unread/count',
    method: 'get',
    params: data
  })
}

export function makeReadAtNotifications(data) {
  return request({
    url: '/notifications/make-read/at',
    method: 'get',
    params: data
  })
}