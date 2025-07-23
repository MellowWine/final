// src/stores/user.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const API_URL = 'http://localhost:3001/api'; // 后端API地址

export const useUserStore = defineStore('user', () => {
    const router = useRouter();

    // State
    const user = ref(null);
    const token = ref(localStorage.getItem('token') || null);

    // Set axios default header
    if (token.value) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
    }

    // Getters
    const isLoggedIn = computed(() => !!token.value);
    const username = computed(() => user.value?.username || '');

    // Actions
    async function register(credentials) {
        await axios.post(`${API_URL}/register`, credentials);
    }

    async function login(credentials) {
        const response = await axios.post(`${API_URL}/login`, credentials);
        const data = response.data;

        user.value = data.user;
        token.value = data.token;
        localStorage.setItem('token', data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    }

    function logout() {
        user.value = null;
        token.value = null;
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        router.push('/login'); // 登出后跳转到登录页
    }

    // Action to fetch user info if token exists (e.g., on page refresh)
    // This is a more advanced step, for now we just store basic info from login
    // A full implementation would call a `/api/me` endpoint here.

    return { user, token, isLoggedIn, username, register, login, logout };
});