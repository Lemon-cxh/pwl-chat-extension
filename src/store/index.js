import { createStore } from 'vuex'
import { user } from './module/user'
import { getUserInfo, getKey } from '../api/login'
import { MESSAGE_LIMIT, STORAGE, MESSAGE_TYPE } from '../constant/Constant'
import { redPacketType } from '../constant/RedPacketConstant'
import { setLocal, getLocal } from '../utils/chromeUtil'
import { isRedPacket } from '../utils/util'
import { openRedPacket } from '../api/chat'

export default createStore({
  modules: {
    user: user,
  },
  state: {
    message: [],
    messageTotal: 0,
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
    messageTotal: (state) => {
      return state.messageTotal
    },
    messageLength: (state) => {
      return state.message.length
    },
    pageParams: (state) => {
      let page = parseInt(state.messageTotal / MESSAGE_LIMIT) + 1
      return { page: page, length: page * MESSAGE_LIMIT - state.messageTotal }
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
      let m = state.message.pop()
      if (m && !m.revoke && m.content) {
        state.messageTotal -= m.users ? m.users.length + 1 : 1
      }
    },
    addMessage(state, message) {
      if (!message.isMsg) {
        state.message.unshift(message.message)
        return
      }
      state.messageTotal += 1
      if (isRedPacket(message.message)) {
        state.message.unshift(message.message)
        if (
          message.message.type === redPacketType.rockPaperScissors ||
          message.message.type === redPacketType.heartbeat
        ) {
          return
        }
        setTimeout(() => {
          openRedPacket({ oId: message.message.oId, apiKey: state.key }).then()
        }, 3000 + Math.ceil(Math.random() * 1000))
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
      state.messageTotal += data.size
      let index = state.message.length - 1
      let last = state.message[index]
      let message = data.message[0]
      // +1 消息折叠
      if (!last || last.content !== message.content) {
        state.message = state.message.concat(data.message)
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
      state.message = state.message.concat(data.message.slice(1))
    },
    clearMessage(state) {
      state.message = []
      state.messageTotal = 0
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
        if (e.oId == message.oId && e.type === MESSAGE_TYPE.msg) {
          msg = JSON.parse(e.content)
          if (msg.got >= msg.count) {
            return true
          }
          if (message.got > msg.got) {
            msg.got = message.got
            e.content = JSON.stringify(msg)
          }    
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
          state.messageTotal -= 1
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
