import { setLocal, getLocal } from '@/common/utils/chromeUtil'
import { STORAGE } from '@/common/constant/Constant'
import { getUserInfo, login } from '@/background/api/login'

/**
 * 刷新Key
 */
export function refreshKey() {
  return new Promise((resolve, reject) => {
    getLocal([STORAGE.key, STORAGE.account], async (result) => {
      // 没有则退出
      if (!result || !result[STORAGE.key]) {
        console.log('还未登录')
        reject(new Error('还未登录'))
        return
      }
      const res = await getUserInfo({ apiKey: result[STORAGE.key] })
      if (res.code === 0) {
        setLocal({ [STORAGE.user]: res.data })
        resolve()
        return
      }
      const r = await login(result[STORAGE.account])
      if (r.code === 0) {
        setLocal({ [STORAGE.key]: r.Key })
        setLocal({ [STORAGE.user]: res.data })
        resolve()
        return
      }
      reject(new Error('获取key失败'))
    })
  })
}

export async function getKey() {
  // eslint-disable-next-line no-undef
  const result = await chrome.storage.local.get([STORAGE.key])
  return result[STORAGE.key]
}

export async function getUser() {
  // eslint-disable-next-line no-undef
  const result = await chrome.storage.local.get([STORAGE.user])
  return result[STORAGE.user]
}
