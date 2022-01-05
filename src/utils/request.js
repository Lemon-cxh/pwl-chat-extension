import axios from 'axios'
import Vue from 'vue'

const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_URL,
  timeout: 5000
})

service.interceptors.request.use(config => {
  return config
}, error => {
  Promise.reject(error)
})

service.interceptors.response.use(
  response => {
    if (response.status === 200) {
      return response.data
    }
    Vue.prototype.$message.error(response.data)
  },
  error => {
    Vue.prototype.$message.error(error)
    return Promise.reject(error)
  })

export default service