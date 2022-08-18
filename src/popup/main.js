import { createApp } from 'vue'
import App from './App.vue'
import store from '../store/popup'
import router from '../router'
import IconSvg from '../components/Icon-svg'
import { ElMessage } from 'element-plus'
import 'element-plus/es/components/message/style/css'
import { getLocal } from '../utils/chromeUtil'
import { STORAGE } from '../constant/Constant'

// 设置ElMessage显示时间
;['success', 'warning', 'info', 'error'].forEach((type) => {
  ElMessage[type] = (msg) => {
    return ElMessage({
      message: msg,
      type: type,
      duration: 1500,
    })
  }
})

// 自定义的SVG组件配置：导入svg
const requireAll = (requireContext) => requireContext.keys().map(requireContext)
const req = require.context('../svg', false, /\.svg$/)
requireAll(req)

getLocal([STORAGE.key, STORAGE.account], async (result) => {
  let key = result[STORAGE.key]
  if (!key) {
    router.push({ name: 'Login' })
    return
  }
  store.commit('setKey', key)
  router.push({ name: 'ChatRoom' })
})

// 自定义的SVG组件Icon-svg、ElMessage注册为全局组件，
createApp(App)
  .use(router)
  .use(store)
  .component('icon-svg', IconSvg)
  .provide('$message', ElMessage)
  // 自定义 v-focus 指令
  .directive('focus', {
    mounted(el) {
      el.children[0].focus()
    },
  })
  .mount('#app')
