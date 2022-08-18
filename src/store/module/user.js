export const user = {
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
    }
  },
  getters: {
    key: (state) => {
      return state.key
    },
    userInfo: (state) => {
      return state.userInfo
    }
  },
  mutations: {
    setKey(state, key) {
      state.key = key
    },
    setUserInfo(state, userInfo) {
      state.userInfo = userInfo
    }
  }
}
