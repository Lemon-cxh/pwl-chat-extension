import request from '@/utils/request'

export function getKey(data) {
  return request({
    url: '/api/getKey',
    method: 'post',
    data
  })
}

export function getUserInfo(params) {
  return request({
    url: '/api/user',
    method: 'get',
    params
  })
}
