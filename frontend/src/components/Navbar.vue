<template>
    <nav class="navbar">
        <div class="nav-left">
            <RouterLink to="/" class="nav-brand">我的网站</RouterLink>
            <div class="nav-links">
                <RouterLink to="/">首页</RouterLink>
                <RouterLink to="/forum">论坛</RouterLink>
                <RouterLink to="/gacha">抽卡</RouterLink>
                <RouterLink to="/store">商城</RouterLink>
            </div>
        </div>
        <div class="nav-right">
            <div v-if="userStore.isLoggedIn" class="user-menu">
                <span class="username">{{ userStore.username }}</span>
                <div class="dropdown">
                    <RouterLink to="/profile">个人空间</RouterLink>
                    <a @click="handleLogout">登出</a>
                </div>
            </div>
            <div v-else class="auth-links">
                <RouterLink to="/login">登录</RouterLink>
                <RouterLink to="/register">注册</RouterLink>
            </div>
        </div>
    </nav>
</template>

<script setup>
import { RouterLink } from 'vue-router';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();

function handleLogout() {
    userStore.logout();
}
</script>

<style scoped>
/* (样式见文末) */
</style>