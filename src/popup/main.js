import { createApp } from 'vue'
import App from './App.vue'
import store from '../store'
import router from '../router'
import IconSvg from '../components/Icon-svg'
import { ElMessage } from 'element-plus'
import 'element-plus/es/components/message/style/css'
import { getUserInfo } from '../api/login'
import { getLocal, setLocal } from '../utils/chromeUtil'
import { STORAGE } from '../constant/Constant'
document.documentElement.setAttribute('data-theme', 'dark');
['success', 'warning', 'info', 'error'].forEach(type => {
  ElMessage[type] = msg => {
    return ElMessage({
      message: msg,
      type: type,
      duration: 2000
    });
  };
});

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
    chrome.extension.getBackgroundPage().closeSocket()
    setLocal({ [STORAGE.key]: '' })
    router.push({ name: 'Login' })
  }).catch(() => {
    router.push({ name: 'Error' })
  })
})

createApp(App)
  .use(router)
  .use(store)
  .component('icon-svg', IconSvg)
  .provide('$message', ElMessage)
  .mount('#app')
