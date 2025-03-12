import request from '@/popup/utils/request'
import store from '@/popup/store/index'

export function more(params) {
  return request({
    url: '/chat-room/more',
    method: 'get',
    params
  })
}

export function getMessages(params) {
  return request({
    url: '/chat-room/getMessage',
    method: 'get',
    params
  })
}

export function getMd(oId) {
  return request({
    url: `/cr/raw/${oId}`,
    method: 'get'
  })
}

export function send(data) {
  data.client =
    (navigator.userAgent.indexOf('Edg') > -1 ? 'Edge' : 'Chrome') +
    '/v' +
    process.env.VUE_APP_VERSION
  return request({
    url: '/chat-room/send',
    method: 'post',
    data
  })
}

export function openRedPacket(data) {
  return request({
    url: '/chat-room/red-packet/open',
    method: 'post',
    data
  })
}

export function upload(file, apiKey) {
  const formData = new FormData()
  formData.append('file[]', file)
  formData.append('apiKey', store.getters.key)
  return request({
    url: '/upload',
    method: 'post',
    data: formData
  })
}

export function revoke(oId, data) {
  return request({
    url: `/chat-room/revoke/${oId}`,
    method: 'delete',
    data: {
      ...data,
      apiKey: store.getters.key
    }
  })
}

export function getEmoji(params) {
  return request({
    url: '/users/emotions',
    method: 'get',
    params
  })
}

export function getCloudImage(data) {
  return request({
    url: '/api/cloud/get',
    method: 'post',
    data
  })
}

export function syncCloudImage(data) {
  return request({
    url: '/api/cloud/sync',
    method: 'post',
    data
  })
}
