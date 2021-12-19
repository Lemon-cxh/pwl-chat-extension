import Vue from 'vue'
import App from './App.vue'
import router from '../router'
import store from '../store'
import '/src/plugins/element.js'
import IconSvg from '../components/Icon-svg'
import { getUserInfo } from '../api/login'
import { getLocal, setLocal } from '../utils/chromeUtil'
import { STORAGE } from '../constant/Constant'

Vue.config.productionTip = false
Vue.component('icon-svg', IconSvg)
const requireAll = requireContext => requireContext.keys().map(requireContext)
const req = require.context('../svg', false, /\.svg$/)
requireAll(req)


getLocal([STORAGE.key], function (result) {
  if (!result[STORAGE.key]) {
    router.push({ name: 'Login' })
    return
  }
  getUserInfo({ apiKey: result[STORAGE.key] }).then((res) => {
    if (res && 0 === res.code) {
      store.commit('setKey', result[STORAGE.key])
      store.commit('setUserInfo', res.data)
      router.push({ name: 'ChatRoom' })
      return
    }
    setLocal({ [STORAGE.key]: '' })
    router.push({ name: 'Login' })
  })
})

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app')
