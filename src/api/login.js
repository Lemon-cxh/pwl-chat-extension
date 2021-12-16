import request from '@/utils/request'

export function getKey(data) {
  return request({
    url: '/api/getKey',
    method: 'post',
    data: data
  })
}

export function getUserInfo(parsms) {
  return request({
    url: '/api/user',
    method: 'get',
    params: parsms
  })
}