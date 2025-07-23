<template>
    <div class="auth-container">
        <h2>注册</h2>
        <form @submit.prevent="handleRegister">
            <div class="form-group">
                <label for="username">用户名</label>
                <input type="text" v-model="username" id="username" required>
            </div>
            <div class="form-group">
                <label for="password">密码</label>
                <input type="password" v-model="password" id="password" required>
            </div>
            <button type="submit">注册</button>
            <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
            <p v-if="successMsg" class="success">{{ successMsg }}</p>
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
const successMsg = ref('');
const userStore = useUserStore();
const router = useRouter();

async function handleRegister() {
    errorMsg.value = '';
    successMsg.value = '';
    try {
        await userStore.register({ username: username.value, password: password.value });
        successMsg.value = '注册成功！正在跳转到登录页面...';
        setTimeout(() => {
            router.push('/login');
        }, 2000);
    } catch (error) {
        errorMsg.value = error.response?.data?.message || '注册失败';
    }
}
</script>

<style scoped>
/* (样式见文末) */
</style>