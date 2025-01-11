import axios from 'axios'

const request = axios.create({
  baseURL: process.env.VUE_APP_BASE_URL,
  timeout: 10000
})

request.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

request.interceptors.response.use(
  (response) => {
    if (response.status === 200) {
      return response.data
    }
    return response
  },
  (error) => {
    console.dir(error)
    return Promise.reject(error)
  }
)

export function login(data) {
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

export function getChannel(params) {
  return request({
    url: '/chat-room/node/get',
    method: 'get',
    params
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
