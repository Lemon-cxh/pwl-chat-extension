import { createApp } from 'vue'
import App from './App.vue'

createApp(App)
  .directive('focus', {
    mounted(el) {
      el.children[0].focus()
    },
  })
  .mount('#app')
