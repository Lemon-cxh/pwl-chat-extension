import request from './request'

export function getChannel(params) {
  return request({
    url: '/chat-room/node/get',
    method: 'get',
    params
  })
}
