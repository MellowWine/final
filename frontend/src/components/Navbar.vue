<template>
    <nav class="navbar">
        <!-- ... (模板部分保持不变) ... -->
        <div class="nav-left">
            <RouterLink to="/" class="nav-brand">
                <div class="brand-title">糖罐日记</div>
                <div class="brand-subtitle">恋链LinkLove</div>
            </RouterLink>

            <div class="nav-links">
                <RouterLink to="/">💖 首页 💖</RouterLink>
                <RouterLink to="/forum">日记簿</RouterLink>
                <RouterLink to="/gacha">每日一抽</RouterLink>
                <RouterLink to="/store">积分商城</RouterLink>
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
/* ... (大部分样式保持不变) ... */
.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    height: 60px;
    background: var(--gradient-navbar);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    box-shadow: 0 2px 8px rgba(174, 198, 207, 0.3);
}

.nav-left {
    display: flex;
    align-items: center;
}

.nav-brand {
    font-weight: bold;
    margin-right: 2rem;
    line-height: 1.2;
    text-align: center;
    text-decoration: none;
}

.brand-title,
.brand-subtitle,
.nav-links a,
.auth-links a,
.user-menu .username {
    color: #fff;
    text-shadow: -1px -1px 0 var(--color-text), 1px -1px 0 var(--color-text), -1px 1px 0 var(--color-text), 1px 1px 0 var(--color-text);
}

.brand-title {
    font-size: 1.2rem;
}

.brand-subtitle {
    font-size: 0.8rem;
    letter-spacing: 1px;
}

.nav-links a,
.auth-links a {
    text-decoration: none;
    padding: 0 1rem;
    font-weight: 500;
    transition: color 0.3s, text-shadow 0.3s;
}

.nav-links a:hover,
.auth-links a:hover {
    color: var(--color-accent-coral);
    text-shadow: none;
}

.router-link-exact-active {
    color: #D96680 !important;
    font-weight: 700;
    text-shadow: 0 0 6px rgba(255, 255, 255, 0.9) !important;
}

.nav-right {
    position: relative;
}

.user-menu {
    cursor: pointer;
    position: relative;
}

.user-menu .username {
    padding: 0 1rem;
    font-weight: bold;
}

.user-menu .dropdown {
    display: none;
    position: absolute;
    right: 0;
    top: 100%;
    background-color: #fff;
    border: 1px solid var(--color-accent-pearl);
    border-radius: 8px;
    min-width: 120px;
    /* !!修改点: 移除这个制造空隙的 margin-top */
    /* margin-top: 5px; */
    box-shadow: 0 4px 15px rgba(174, 198, 207, 0.2);
    overflow: hidden;
    /* !!新增: 可以用一个轻微的 padding-top 来创造视觉上的间距，而不会产生交互空隙 */
    padding-top: 5px;
}

.user-menu:hover .dropdown {
    display: block;
}

.dropdown a {
    display: block;
    padding: 0.75rem 1rem;
    color: var(--color-text);
    text-decoration: none;
    white-space: nowrap;
}

.dropdown a:hover {
    background-color: var(--color-page-bg-subtle);
    color: var(--color-primary-pink);
}
</style>