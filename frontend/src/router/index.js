import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RegisterView from '../views/RegisterView.vue'; // 引入
import LoginView from '../views/LoginView.vue';     // 引入

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
     {
      path: '/register',
      name: 'register',
      component: RegisterView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
     { path: '/forum', name: 'forum', component: { template: '<div><h1>论坛页面</h1></div>' } },
    { path: '/gacha', name: 'gacha', component: { template: '<div><h1>抽卡页面</h1></div>' } },
    { path: '/store', name: 'store', component: { template: '<div><h1>商城页面</h1></div>' } },
    { path: '/profile', name: 'profile', component: { template: '<div><h1>个人空间</h1></div>' } },
  ],
})

export default router
