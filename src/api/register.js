import request from '@/utils/request'

export function register(data) {
  return request({
    url: '/register',
    method: 'post',
    data: data,
  })
}

export function verify(code) {
  return request({
    url: '/verify',
    method: 'post',
    params: {'code':code}
  })
}

export function register2(data) {
  return request({
    url: '/register2',
    method: 'post',
    data: data,
    params: {'r': process.env.VUE_APP_INVITE}
  })
}