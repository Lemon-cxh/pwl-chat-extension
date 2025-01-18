import { createApp } from 'vue'
import App from '@/popup/App.vue'
import store from '@/popup/store/index'
import router from '@/popup/router'
import IconSvg from '@/popup/components/Icon-svg'
import { ElMessage } from 'element-plus'
import 'element-plus/es/components/message/style/css'

// 设置ElMessage显示时间
;['success', 'warning', 'info', 'error'].forEach((type) => {
  ElMessage[type] = (msg) => {
    return ElMessage({
      message: msg,
      type,
      duration: 1000
    })
  }
})

// 自定义的SVG组件配置：导入svg
const requireAll = (requireContext) => requireContext.keys().map(requireContext)
const req = require.context('@/popup/svg', true, /\.svg$/)
requireAll(req)

store
  .dispatch('init')
  .then(() => {
    router.push({ name: 'ChatRoom' })
  })
  .catch(() => {
    router.push({ name: 'Login' })
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
      el.children[0].children[0].focus()
    }
  })
  .mount('#app')
