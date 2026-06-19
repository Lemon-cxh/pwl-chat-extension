import { setLocal, getLocal, removeLocal } from '@/common/utils/chromeUtil'
import { STORAGE } from '@/common/constant/Constant'
import { getUserInfo, getKey as login } from '@/common/api/auth'
import { setApiKey } from '@/common/api/request'

/**
 * 刷新Key
 */
export function refreshKey() {
  return new Promise((resolve, reject) => {
    getLocal([STORAGE.key, STORAGE.account], async (result) => {
      // 没有则退出
      if (!result || !result[STORAGE.key]) {
        reject(new Error('还未登录'))
        return
      }
      // 先缓存 key，后续请求由拦截器自动注入
      setApiKey(result[STORAGE.key])
      const res = await getUserInfo()
      if (res.code === 0) {
        setLocal({ [STORAGE.user]: res.data })
        resolve()
        return
      }
      // key 过期，重新登录获取新 key
      const r = await login(result[STORAGE.account])
      if (r.code === 0) {
        setLocal({ [STORAGE.key]: r.Key })
        setApiKey(r.Key)
        setLocal({ [STORAGE.user]: res.data })
        resolve()
        return
      }
      reject(new Error('获取key失败'))
    })
  })
}

/**
 * 清空本地数据
 */
export function clean() {
  removeLocal([STORAGE.key, STORAGE.user, STORAGE.liveness,
    STORAGE.discussEnable, STORAGE.online, STORAGE.discuss])
}

export function setOnline(data) {
  setLocal({ [STORAGE.online]: data })
}

export function setDiscuss(data) {
  setLocal({ [STORAGE.discuss]: data })
}

export function getOnline() {
  return get(STORAGE.online)
}

export function getDiscuss() {
  return get(STORAGE.discuss)
}

export function getKey() {
  return get(STORAGE.key)
}

export function getUser() {
  return get(STORAGE.user)
}

async function get(key) {
  // eslint-disable-next-line no-undef
  const result = await chrome.storage.local.get([key])
  return result[key]
}
