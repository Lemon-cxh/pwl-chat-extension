import request from '@/popup/utils/request'

export function register(data) {
  return request({
    url: '/register',
    method: 'post',
    data
  })
}

export function verify(code) {
  return request({
    url: '/verify',
    method: 'get',
    params: { code }
  })
}

export function register2(data) {
  return request({
    url: '/register2',
    method: 'post',
    data,
    params: { r: process.env.VUE_APP_INVITE }
  })
}
