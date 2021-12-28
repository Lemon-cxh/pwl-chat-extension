import request from '@/utils/request'

export function more(data) {
  return request({
    url: '/chat-room/more',
    method: 'get',
    params: data
  })
}

export function getMd(oId) {
  return request({
    url: '/cr/raw/' + oId,
    method: 'get',
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

export function revoke(oId, data) {
  return request({
    url: '/chat-room/revoke/' + oId,
    method: 'delete',
    data: data
  })
}

export function getEmoji(data) {
  return request({
    url: '/users/emotions',
    method: 'get',
    params: data
  })
}

export function getCloudImage(data) {
  return request({
    url: '/api/cloud/get',
    method: 'post',
    data: data
  })
}

export function syncCloudImage(data) {
  return request({
    url: '/api/cloud/sync',
    method: 'post',
    data: data
  })
}