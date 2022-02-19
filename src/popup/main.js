import { createApp } from 'vue'
import App from './App.vue'
import store from '../store'
import router from '../router'
import IconSvg from '../components/Icon-svg'
import { ElMessage } from 'element-plus'
import 'element-plus/es/components/message/style/css'
import { getUserInfo, getKey } from '../api/login'
import { getLocal, setLocal } from '../utils/chromeUtil'
import { STORAGE } from '../constant/Constant'

// 设置ElMessage显示时间
;['success', 'warning', 'info', 'error'].forEach((type) => {
  ElMessage[type] = (msg) => {
    return ElMessage({
      message: msg,
      type: type,
      duration: 2000,
    })
  }
})

// 导入svg
const requireAll = (requireContext) => requireContext.keys().map(requireContext)
const req = require.context('../svg', false, /\.svg$/)
requireAll(req)

getLocal([STORAGE.key, STORAGE.account], async (result) => {
  let key = result[STORAGE.key]
  if (!key) {
    router.push({ name: 'Login' })
    return
  }
  let res = await getUserInfo({ apiKey: key })
  if (typeof res.code === 'undefined') {
    router.push({ name: 'Error' })
    return
  }
  if (res.code !== 0) {
    let r = await getKey(result[STORAGE.account])
    if (r.code !== 0) {
      chrome.extension.getBackgroundPage().closeSocket()
      setLocal({ [STORAGE.key]: '' })
      router.push({ name: 'Login' })
      return
    }
    key = r.Key
    res = await getUserInfo({ apiKey: key })
    setLocal({ [STORAGE.key]: key })
  }
  store.commit('setKey', key)
  store.commit('setUserInfo', res.data)
  router.push({ name: 'ChatRoom' })
})

// Icon-svg、ElMessage注册为全局组件，
createApp(App)
  .use(router)
  .use(store)
  .component('icon-svg', IconSvg)
  .provide('$message', ElMessage)
  // 自定义 v-focus 指令
  .directive('focus', {
    mounted(el) {
      el.children[0].focus()
    }
  })
  .mount('#app')
