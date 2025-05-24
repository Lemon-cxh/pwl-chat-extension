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
  },
  {
    path: '/private-chat-list',
    name: 'PrivateChatList',
    component: () => import('@/popup/views/PrivateChatList.vue')
  },
  {
    path: '/private-chat/:username',
    name: 'PrivateChat',
    component: () => import('@/popup/components/PrivateChat.vue')
  },
  {
    path: '/article-list',
    name: 'ArticleList',
    component: () => import('@/popup/views/ArticleList.vue')
  },
  {
    path: '/breezemoon',
    name: 'BreezemoonList',
    component: () => import('@/popup/views/BreezemoonList.vue')
  },
  {
    path: '/breezemoon/post',
    name: 'BreezemoonPost',
    component: () => import('@/popup/views/BreezemoonPost.vue')
  },
  {
    path: '/article/:id',
    name: 'ArticleDetail',
    component: () => import('@/popup/views/ArticleDetail.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
