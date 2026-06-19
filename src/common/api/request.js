import axios from 'axios'

let cachedApiKey = null
let errorHandler = (error) => {
  console.dir(error)
}

export function setApiKey(key) { cachedApiKey = key }
export function getApiKey() { return cachedApiKey }

export function setErrorHandler(handler) { errorHandler = handler }

const request = axios.create({
  baseURL: process.env.VUE_APP_BASE_URL,
  timeout: Number(process.env.VUE_APP_API_TIMEOUT) || 10000
})

// 请求拦截器：自动注入 apiKey
request.interceptors.request.use(
  (config) => {
    if (!cachedApiKey) return config // 尚未登录，跳过
    if (config.data instanceof FormData) return config // FormData 由 upload() 自行处理
    if (['get', 'head', 'delete'].includes(config.method)) {
      config.params = { apiKey: cachedApiKey, ...config.params }
    } else {
      config.data = { apiKey: cachedApiKey, ...(config.data || {}) }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器：200 时返回 response.data
request.interceptors.response.use(
  (response) => response.status === 200 ? response.data : response,
  (error) => {
    errorHandler(error)
    return Promise.reject(error)
  }
)

export default request
