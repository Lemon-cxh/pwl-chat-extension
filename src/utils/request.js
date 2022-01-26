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
    ElMessage.error({
      message: response.data,
      type: 'error',
      duration: 2000
    })
  },
  error => {
    console.dir(error)
    ElMessage.error({
      message: error.message,
      type: 'error',
      duration: 2000
    })
    return Promise.reject(error)
  })

export default service