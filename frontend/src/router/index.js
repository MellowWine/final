// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import RegisterView from '../views/RegisterView.vue';
import LoginView from '../views/LoginView.vue';
import DiaryBookView from '../views/DiaryBookView.vue'; // !!新增: 引入新页面

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    // !!修改点: 将 /forum 路由指向真正的组件
    { path: '/forum', name: 'diarybook', component: DiaryBookView },
    { path: '/gacha', name: 'gacha', component: { template: '<div><h1>每日一抽 页面</h1></div>' } },
    { path: '/store', name: 'store', component: { template: '<div><h1>积分商城 页面</h1></div>' } },
    { path: '/profile', name: 'profile', component: { template: '<div><h1>个人空间 页面</h1></div>' } },
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/login', name: 'login', component: LoginView },
  ]
});

export default router;