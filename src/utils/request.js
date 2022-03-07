import axios from 'axios'
import { ElMessage } from 'element-plus'

const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_URL,
  // timeout: 10000
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
    ElMessage.error(response.data)
  },
  error => {
    console.dir(error)
    ElMessage.error(error.message)
    return Promise.reject(error)
  })

export default service