// src/stores/user.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const API_URL = 'http://localhost:3001/api';

export const useUserStore = defineStore('user', () => {
    const router = useRouter();
    const user = ref(null);
    const token = ref(localStorage.getItem('token') || null);

    // !!修改点: 封装设置 Authorization 头部的逻辑
    function setAuthorizationHeader(tokenValue) {
        if (tokenValue) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${tokenValue}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }

    const isLoggedIn = computed(() => !!token.value);
    const username = computed(() => user.value?.username || '');

    async function register(credentials) {
        await axios.post(`${API_URL}/register`, credentials);
    }

    async function login(credentials) {
        const response = await axios.post(`${API_URL}/login`, credentials);
        const data = response.data;
        user.value = data.user;
        token.value = data.token;
        localStorage.setItem('token', data.token);
        setAuthorizationHeader(data.token);
    }

    function logout() {
        user.value = null;
        token.value = null;
        localStorage.removeItem('token');
        setAuthorizationHeader(null);
        if (router) {
            router.push('/login');
        }
    }

    // !!新增: 获取用户信息 Action
    async function fetchUser() {
        if (!token.value) return; // 如果没有token，直接返回
        try {
            const response = await axios.get(`${API_URL}/me`);
            user.value = response.data;
        } catch (error) {
            console.error('Failed to fetch user, token might be invalid.', error);
            // token 无效或过期，执行登出操作清理状态
            logout();
        }
    }

    // !!修改点: 在 store 初始化时就设置一次 header
    setAuthorizationHeader(token.value);
    
    // !!新增: 并在 store 初始化时尝试获取用户信息
    fetchUser();

    return { user, token, isLoggedIn, username, register, login, logout, fetchUser };
});