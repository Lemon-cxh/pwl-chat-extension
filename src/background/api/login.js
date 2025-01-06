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
