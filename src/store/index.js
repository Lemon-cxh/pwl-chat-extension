import { createStore } from 'vuex'
import { getUserInfo, getKey } from '../api/login'
import { MESSAGE_LIMIT, STORAGE, MESSAGE_TYPE } from '../constant/Constant'
import { setLocal, getLocal } from '../utils/chromeUtil'
import { isRedPacket } from '../utils/util'
import { openRedPacket } from '../api/chat'

export default createStore({
  state: {
    key: '',
    userInfo: {
      userCity: '',
      userOnlineFlag: false,
      userPoint: 0,
      userAppRole: '',
      userIntro: '',
      userNo: '',
      onlineMinute: 0,
      userAvatarURL: '',
      userNickname: '',
      oId: '',
      userName: '',
      cardBg: '',
      followingUserCount: 0,
      sysMetal: '',
      userRole: '',
      followerCount: 0,
      userURL: '',
    },
    message: [],
    messageTotal: 0,
    online: {
      onlineChatCnt: 0,
      users: [],
    },
  },
  getters: {
    key: (state) => {
      return state.key
    },
    userInfo: (state) => {
      return state.userInfo
    },
    message: (state) => {
      return state.message
    },
    messageTotal: (state) => {
      return state.messageTotal
    },
    pageParams: (state) => {
      let page = parseInt(state.messageTotal / MESSAGE_LIMIT) + 1
      return { page: page, length: page * MESSAGE_LIMIT - state.messageTotal }
    },
    online: (state) => {
      return state.online
    },
  },
  mutations: {
    setKey(state, key) {
      state.key = key
    },
    setUserInfo(state, userInfo) {
      state.userInfo = userInfo
    },
    popMessage(state) {
      let m = state.message.pop()
      if (!m || m.revoke) {
        return
      }
      state.messageTotal -= 1
      if (m.type && m.type === MESSAGE_TYPE.msg) {
        state.messageTotal -= m.users ? m.users.length : 0
        return
      }
    },
    addMessage(state, message) {
      if (!message.isMsg) {
        state.message.unshift(message.message)
        return
      }
      state.messageTotal += 1
      if (isRedPacket(message.message)) {
        setTimeout(() => {
          openRedPacket({ oId: message.message.oId, apiKey: state.key }).then()
        }, 3000 + Math.ceil(Math.random() * 1000))
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
    updateRedPacket(state, oId) {
      let msg
      state.message.some((e) => {
        if (e.oId == oId && e.type === MESSAGE_TYPE.msg) {
          msg = JSON.parse(e.content)
          if (msg.got >= msg.count) {
            return true
          }
          msg.got += 1
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
          state.messageTotal -= 1
          return true
        }
        return false
      })
    },
  },
  actions: {
    getUser(context) {
      return new Promise((resolve) => {
        getLocal([STORAGE.key, STORAGE.account], async (result) => {
          if (result && result[STORAGE.key]) {
            let key = result[STORAGE.key]
            let res = await getUserInfo({ apiKey: key })
            if (res.code !== 0) {
              let r = await getKey(result[STORAGE.account])
              if (r.code !== 0) {
                setLocal({ [STORAGE.key]: '' })
                return
              }
              key = r.key
              setLocal({ [STORAGE.key]: r.Key })
              res = await getUserInfo({ apiKey: key })
            }
            context.commit('setUserInfo', res.data)
            context.commit('setKey', key)
            resolve()
          }
        })
      })
    },
  },
})
