import { setLocal, getLocal } from '@/common/utils/chromeUtil'
import { STORAGE } from '@/common/constant/Constant'
import { getUserInfo, getKey } from '@/popup/api/login'

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
      const r = await getKey(result[STORAGE.account])
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

export async function key() {
  return await getLocal([STORAGE.key])
}

export async function user() {
  return await getLocal([STORAGE.user])
}
