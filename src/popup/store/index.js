import { createStore } from 'vuex'
import { user } from './module/user'
import { getUserInfo, getKey } from '@/common/api/auth'
import { setApiKey } from '@/common/api/request'
import { STORAGE } from '@/common/constant/Constant'
import { setLocal, getLocal, removeLocal } from '@/common/utils/chromeUtil'

export default createStore({
  modules: {
    user
  },
  state: {
    discuss: {
      enable: false,
      content: ''
    }
  },
  getters: {
    discuss: (state) => {
      return state.discuss
    }
  },
  mutations: {
    changeDiscuss(state) {
      state.discuss.enable = !state.discuss.enable
    },
    setDiscussContent(state, content) {
      state.discuss.content = content
    }
  },
  actions: {
    init(context) {
      return new Promise((resolve, reject) => {
        getLocal([STORAGE.key, STORAGE.account], async (result) => {
          let key = result[STORAGE.key]
          // 没有key先登录
          if (!key) {
            const r = await getKey(result[STORAGE.account])
            if (r.code !== 0) {
              removeLocal([STORAGE.key])
              reject(new Error(r.msg ? r.msg : '获取key请求失败'))
              return
            }
            key = r.Key
          }
          setLocal({ [STORAGE.key]: key })
          context.commit('setKey', key)
          // 先缓存 apiKey，后续请求由拦截器自动注入
          setApiKey(key)
          const res = await getUserInfo()
          if (res.code !== 0) {
            reject(new Error(res.msg ? res.msg : '获取用户信息失败'))
            return
          }
          context.commit('setUserInfo', res.data)
          resolve()
        })
      })
    }
  }
})
