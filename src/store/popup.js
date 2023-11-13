import { createStore } from 'vuex'
import { user } from './module/user'

export default createStore({
  modules: {
    user
  },
  state: {
    discuss: {
      content: '',
      enable: false
    }
  },
  getters: {
    discuss: (state) => {
      return state.discuss
    }
  },
  mutations: {
    setDiscussContent(state, content) {
      state.discuss.content = content
    },
    changeDiscuss(state) {
      state.discuss.enable = !state.discuss.enable
    }
  }
})
