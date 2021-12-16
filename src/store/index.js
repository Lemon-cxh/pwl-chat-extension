import Vue from 'vue'
import Vuex from 'vuex'
import { getUserInfo } from '../api/login'
import { mapMutations } from 'vuex'

Vue.use(Vuex)

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
      userURL: ''
    },
    message: [],
    page: 1,
    limit: 0
  },
  getters: {
    key: state => {
      return state.key
    },
    userInfo: state => {
      return state.userInfo
    },
    message: state => {
      return state.message
    },
    messageSize: state => {
      return state.message.length
    },
    page: state => {
      return state.page
    },
    limit: state => {
      return state.limit
    },
  },
  mutations: {
    setKey(state, key) {
      state.key = key
    },
    setUserInfo(state, userInfo) {
      state.userInfo = userInfo
    },
    setMessage(state, message) {
      state.message = message
    },
    addMessage(state, message) {
      state.message.unshift(message)
    },
    concatMessage(state, message) {
      state.message = state.message.concat(message);
    },
    clearMessage(state) {
      state.message = []
      state.page = 1;
    },
    pagePlus(state) {
      state.page += 1;
    },
    setPage(state, page) {
      state.page = page;
    },
    setLimit(state, limit) {
      state.limit = limit;
    },
  },
  actions: {
    getUser(context) {
      return new Promise((resolve, reject) => {
        chrome.storage.local.get(['key'], function (result) {
          if (result.key) {
            getUserInfo({ apiKey: result.key }).then((res) => {
              if (res.code !== 0) {
                chrome.storage.local.set({ key: '' })
                return
              }
              context.commit('setUserInfo', res.data)
              context.commit('setKey', result.key)
              resolve()
            })
          }
        })
      })
    },
  },
})
