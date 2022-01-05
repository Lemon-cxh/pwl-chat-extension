import Vue from 'vue'
import Vuex from 'vuex'
import { getUserInfo } from '../api/login'
import { MESSAGE_LIMIT, STORAGE, MESSAGE_TYPE } from '../constant/Constant'
import { setLocal, getLocal } from '../utils/chromeUtil'
import { isRedPacket } from '../utils/util'
import { send } from '../api/chat'

Vue.use(Vuex)

async function sendMessage(content, key) {
  send({ content: content, apiKey: key }).then()
}

function verifyPlusOne(message) {
  return (
    !/^(小冰|嘿siri|小爱同学)/.test(message) &&
    !/^~\s{1}[\u4e00-\u9fa5]{4,}$/.test(message)
  )
}

export default new Vuex.Store({
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
      if (message.isMsg) {
        state.messageTotal += 1
        let last = state.message[0]
        if (
          last &&
          last.md &&
          message.message.md === last.md &&
          !isRedPacket(message.message)
        ) {
          let users = last.users,
            oIds = last.oIds
          if (!last.users) {
            users = []
            oIds = []
          }
          let length = users.push({
            userName: message.message.userName,
            userAvatarURL: message.message.userAvatarURL,
          })
          oIds.push(message.oId)
          state.message[0].users = users
          state.message[0].oIds = oIds
          if (
            message.plusOne &&
            length === 3 &&
            last.userName !== state.userInfo.userName &&
            verifyPlusOne(message.message.md)
          ) {
            sendMessage(message.message.md, state.key)
          }
          return
        }
      }
      state.message.unshift(message.message)
    },
    concatMessage(state, message) {
      state.message = state.message.concat(message)
      state.messageTotal += message.length
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
      return new Promise((resolve, reject) => {
        getLocal([STORAGE.key], function (result) {
          if (result && result[STORAGE.key]) {
            getUserInfo({ apiKey: result[STORAGE.key] }).then((res) => {
              if (res.code !== 0) {
                setLocal({ [STORAGE.key]: '' })
                return
              }
              context.commit('setUserInfo', res.data)
              context.commit('setKey', result[STORAGE.key])
              resolve()
            })
          }
        })
      })
    },
  },
})
