import { createStore } from 'vuex'
import { user } from './module/user'
import { getUserInfo, getKey } from '@/common/api/auth'
import { setApiKey } from '@/common/api/request'
import { STORAGE } from '@/common/constant/Constant'
import { setLocal, getLocal, removeLocal } from '@/common/utils/chromeUtil'
import {
  foldNewMessage,
  concatWithFold,
  updateRedPacketStatus,
  revokeMessage
} from '@/common/utils/messageUtil'

export default createStore({
  modules: {
    user
  },
  state: {
    message: [],
    discuss: {
      enable: false,
      content: ''
    },
    online: {
      onlineChatCnt: 0,
      users: []
    }
  },
  getters: {
    message: (state) => {
      return state.message
    },
    messageLength: (state) => {
      return state.message.length
    },
    lastMessageId: (state) => {
      const length = state.message.length
      return length > 0 ? state.message[length - 1].oId : 0
    },
    online: (state) => {
      return state.online
    },
    discuss: (state) => {
      return state.discuss
    }
  },
  mutations: {
    popMessage(state) {
      state.message.pop()
    },
    addMessage(state, message) {
      if (!message.isMsg) {
        state.message.unshift(message.message)
        return
      }
      foldNewMessage(state.message, message.message)
    },
    concatMessage(state, data) {
      concatWithFold(state.message, data)
    },
    cleanMessage(state) {
      state.message = []
    },
    logout(state) {
      state.message = []
      state.user.userInfo = {}
      state.user.key = ''
    },
    setOnline(state, online) {
      state.online = {
        onlineChatCnt: online.onlineChatCnt,
        users: online.users
      }
      state.discuss = online.discussing
    },
    changeDiscuss(state) {
      state.discuss.enable = !state.discuss.enable
    },
    setDiscussContent(state, content) {
      state.discuss.content = content
    },
    updateRedPacket(state, message) {
      updateRedPacketStatus(state.message, message)
    },
    revoke(state, oId) {
      revokeMessage(state.message, oId)
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

/**
 * 标记特殊关心和黑名单
 * @param {*} message
 */
// function markCareAndBlack(message) {
//   message.isCare =
//     options.care && options.care.some((e) => e === message.userName)
//   message.hidden =
//     options.blacklist && options.blacklist.some((e) => e === message.userName)
// }
