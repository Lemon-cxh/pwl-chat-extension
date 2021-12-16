import request from '@/utils/request'

export function more(data) {
  return request({
    url: '/chat-room/more',
    method: 'get',
    params: data
  })
}

export function send(data) {
  return request({
    url: '/chat-room/send',
    method: 'post',
    data: data
  })
}

export function openRedPacket(data) {
  return request({
    url: '/chat-room/red-packet/open',
    method: 'post',
    data: data
  })
}

export function upload(file) {
  let formData = new FormData()
  formData.append('file[]', file)
  return request({
    url: '/upload',
    method: 'post',
    data: formData
  })
}