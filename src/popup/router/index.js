import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: () => import('@/popup/views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/popup/views/Register.vue')
  },
  {
    path: '/chat-room',
    name: 'ChatRoom',
    component: () => import('@/popup/views/ChatRoom.vue')
  },
  {
    path: '/error',
    name: 'Error',
    component: () => import('@/popup/views/Error.vue')
  },
  {
    path: '/notification',
    name: 'Notification',
    component: () => import('@/popup/views/Notification.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
