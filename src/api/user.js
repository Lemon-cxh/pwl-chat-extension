import request from '@/utils/request'

export function liveness(params) {
  return request({
    url: '/user/liveness',
    method: 'get',
    params
  })
}

export function getLivenessReward(params) {
  return request({
    url: '/activity/yesterday-liveness-reward-api',
    method: 'get',
    params
  })
}

export function isCollectedLiveness(params) {
  return request({
    url: '/api/activity/is-collected-liveness',
    method: 'get',
    params
  })
}

export function getUserInfo(name, params) {
  return request({
    url: '/user/' + name,
    method: 'get',
    params
  })
}

export function getUserName(data) {
  return request({
    url: '/users/names',
    method: 'post',
    data
  })
}
