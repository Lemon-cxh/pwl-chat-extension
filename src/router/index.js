import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/chat-room',
    name: 'ChatRoom',
    component: () => import('../views/ChatRoom.vue')
  },
  {
    path: '/error',
    name: 'Error',
    component: () => import('../views/Error.vue')
  },
]

const router = new VueRouter({
  routes
})

export default router
