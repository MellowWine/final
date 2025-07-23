<template>
    <div class="auth-container">
        <h2>登录</h2>
        <form @submit.prevent="handleLogin">
            <div class="form-group">
                <label for="username">用户名</label>
                <input type="text" v-model="username" id="username" required>
            </div>
            <div class="form-group">
                <label for="password">密码</label>
                <input type="password" v-model="password" id="password" required>
            </div>
            <button type="submit">登录</button>
            <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
        </form>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

const username = ref('');
const password = ref('');
const errorMsg = ref('');
const userStore = useUserStore();
const router = useRouter();

async function handleLogin() {
    errorMsg.value = '';
    try {
        await userStore.login({ username: username.value, password: password.value });
        router.push('/'); // 登录成功后跳转到首页
    } catch (error) {
        errorMsg.value = error.response?.data?.message || '登录失败';
    }
}
</script>

<style scoped>
/* (样式见文末) */
</style>