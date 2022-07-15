import { createStore } from 'vuex'
import { user } from './module/user'
import { getUserInfo, getKey } from '../api/login'
import { STORAGE, MESSAGE_TYPE } from '../constant/Constant'
import { setLocal, getLocal } from '../utils/chromeUtil'
import { isRedPacket } from '../utils/util'

export default createStore({
  modules: {
    user: user,
  },
  state: {
    message: [],
    discuss: '',
    online: {
      onlineChatCnt: 0,
      users: [],
    },
  },
  getters: {
    message: (state) => {
      return state.message
    },
    messageLength: (state) => {
      return state.message.length
    },
    lastMessageId: (state) => {
      let length = state.message.length
      return length > 0 ? state.message[length - 1].oId : 0
    },
    online: (state) => {
      return state.online
    },
    discuss: (state) => {
      return state.discuss
    },
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
      if (isRedPacket(message.message)) {
        state.message.unshift(message.message)
        return
      }
      // +1 消息折叠
      let last = state.message[0]
      if (!last || message.message.md !== last.md) {
        state.message.unshift(message.message)
        return
      }
      let { users = [], oIds = [] } = last
      users.push({
        userName: message.message.userName,
        userAvatarURL: message.message.userAvatarURL,
      })
      oIds.push(message.oId)
      state.message[0].users = users
      state.message[0].oIds = oIds
    },
    concatMessage(state, data) {
      let index = state.message.length - 1
      let last = state.message[index]
      let message = data[0]
      // +1 消息折叠
      if (!last || last.content !== message.content) {
        state.message = state.message.concat(data)
        return
      }
      let { users = [], oIds = [] } = message
      users.push({
        userName: last.userName,
        userAvatarURL: last.userAvatarURL,
      })
      oIds.push(last.oId)
      if (last.users) {
        message.users = users.concat(last.users)
        message.oIds = oIds.concat(last.oIds)
      } else {
        message.users = users
        message.oIds = oIds
      }
      state.message[index] = message
      state.message = state.message.concat(data.slice(1))
    },
    clearMessage(state) {
      state.message = []
    },
    setOnline(state, online) {
      state.online = {
        onlineChatCnt: online.onlineChatCnt,
        users: online.users,
      }
      state.discuss = online.discussing
    },
    setDiscuss(state, discuss) {
      state.discuss = discuss
    },
    markRedPacket(state, oId) {
      let msg
      state.message.some((e) => {
        if (e.oId == oId && e.type === MESSAGE_TYPE.msg) {
          msg = JSON.parse(e.content)
          msg.got = msg.count
          e.content = JSON.stringify(msg)
          return true
        }
        return false
      })
    },
    updateRedPacket(state, message) {
      let msg
      state.message.some((e) => {
        if (e.oId == message.oId && e.type !== MESSAGE_TYPE.redPacketStatus) {
          msg = JSON.parse(e.content)
          if (msg.got >= msg.count) {
            return true
          }
          msg.got = message.got
          e.content = JSON.stringify(msg)
          return true
        }
        return false
      })
    },
    revoke(state, oId) {
      state.message.some((e) => {
        if (
          e.type === MESSAGE_TYPE.msg &&
          (e.oId == oId || (e.oIds && e.oIds.some((e) => e === oId)))
        ) {
          e.revoke = true
          return true
        }
        return false
      })
    },
  },
  actions: {
    getUser(context) {
      return new Promise((resolve, reject) => {
        getLocal([STORAGE.key, STORAGE.account], async (result) => {
          if (!result || !result[STORAGE.key]) {
            reject()
            return
          }
          let key = result[STORAGE.key]
          let res = await getUserInfo({ apiKey: key })
          if (res.code === undefined) {
            reject()
            return
          }
          if (res.code !== 0) {
            let r = await getKey(result[STORAGE.account])
            if (res.code === undefined) {
              reject()
              return
            }
            if (r.code !== 0) {
              setLocal({ [STORAGE.key]: '' })
              reject()
              return
            }
            key = r.Key
            setLocal({ [STORAGE.key]: key })
            res = await getUserInfo({ apiKey: key })
            if (res.code === undefined || r.code !== 0) {
              reject()
              return
            }
            reject()
          }
          context.commit('setUserInfo', res.data)
          context.commit('setKey', key)
          resolve()
        })
      })
    },
  },
})
