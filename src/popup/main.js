import Vue from 'vue'
import App from './App.vue'
import router from '../router'
import store from '../store'
import '/src/plugins/element.js'
import { getUserInfo } from "../api/login";
import { closeSocket } from "../utils/chromeUtil"

Vue.config.productionTip = false

chrome.storage.local.get(["key"], function (result) {
  if (result.key) {
    getUserInfo({ apiKey: result.key }).then((res) => {
      console.log(result.key, res)
      if (res.code === 0) {
        store.commit('setKey', result.key);
        store.commit('setUserInfo', res.data);
        router.push({name: 'ChatRoom'})
        return
      }
    }).catch(error => {
      this.$message.error(error)
      closeSocket();
      store.commit('clearMessage')
    });
  }
  console.log(result.key)
  router.push({name: 'Login'})
});

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app')
