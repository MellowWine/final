<template>
    <div class="gacha-container">
        <h1 class="page-title">🎁 每日一抽 🎁</h1>
        <p class="page-subtitle">看看今天我们之间有什么小惊喜？</p>

        <!-- 主抽奖区域 -->
        <div v-if="userStore.isLoggedIn" class="gacha-main">
            <!-- 抽奖机 -->
            <div class="gacha-machine">
                <div class="machine-body">
                    <div class="prize-display" :class="{ 'reveal': !!lastPrize }">
                        <span v-if="isDrawing">...🤔...</span>
                        <span v-else-if="lastPrize">{{ lastPrize }}</span>
                        <span v-else>???</span>
                    </div>
                </div>
                <button @click="handleDraw" :disabled="!canDraw || isDrawing" class="draw-button">
                    {{ getButtonText() }}
                </button>
                <p v-if="!canDraw && !isDrawing" class="cooldown-text">
                    今日已抽，请明天再来哦~
                </p>
            </div>

            <!-- 抽奖历史 -->
            <div class="history-section">
                <h2>我的抽卡记录</h2>
                <div v-if="isLoadingHistory" class="loading-state">加载记录中...</div>
                <div v-else-if="history.length === 0" class="empty-state">还没有抽奖记录哦。</div>
                <ul v-else class="history-list">
                    <li v-for="(item, index) in history" :key="index">
                        <span class="history-prize">{{ item.prize_name }}</span>
                        <span class="history-date">{{ formatDate(item.drawn_at) }}</span>
                    </li>
                </ul>
            </div>
        </div>

        <!-- 未登录提示 -->
        <div v-else class="login-prompt">
            <p>请<RouterLink to="/login">登录</RouterLink>后参与每日一抽！</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import axios from 'axios';
import { RouterLink } from 'vue-router';

const API_URL = 'http://localhost:3001/api/gacha';
const userStore = useUserStore();

const canDraw = ref(false);
const isDrawing = ref(false);
const isLoadingHistory = ref(true);
const lastPrize = ref(null);
const history = ref([]);

// 获取抽奖资格
const fetchGachaStatus = async () => {
    try {
        const response = await axios.get(`${API_URL}/status`);
        canDraw.value = response.data.canDraw;
    } catch (error) {
        console.error("获取抽奖状态失败:", error);
    }
};

// 获取抽奖历史
const fetchHistory = async () => {
    isLoadingHistory.value = true;
    try {
        const response = await axios.get(`${API_URL}/history`);
        history.value = response.data;
    } catch (error) {
        console.error("获取抽奖历史失败:", error);
    } finally {
        isLoadingHistory.value = false;
    }
};

// 执行抽奖
const handleDraw = async () => {
    if (!canDraw.value || isDrawing.value) return;

    isDrawing.value = true;
    lastPrize.value = null; // 重置奖品展示区

    try {
        const response = await axios.post(`${API_URL}/draw`);
        lastPrize.value = response.data.prize;
        canDraw.value = false; // 立即更新UI状态
        // 抽奖成功后刷新历史记录
        await fetchHistory();
    } catch (error) {
        alert(error.response?.data?.message || '抽奖失败，请稍后再试。');
    } finally {
        isDrawing.value = false;
    }
};

// 动态获取按钮文字
const getButtonText = () => {
    if (isDrawing.value) return '抽取中...';
    if (!canDraw.value) return '今日已抽';
    return '✨ 立即抽卡 ✨';
};

// 格式化日期
const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleString('zh-CN', options);
};

// 组件加载时执行
onMounted(() => {
    if (userStore.isLoggedIn) {
        fetchGachaStatus();
        fetchHistory();
    }
});
</script>

<style scoped>
.gacha-container {
    max-width: 900px;
    margin: 0 auto;
    text-align: center;
}

.page-title {
    color: var(--color-primary-pink);
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
}

.page-subtitle {
    color: var(--color-text-subtle);
    margin-bottom: 3rem;
}

.login-prompt {
    margin-top: 4rem;
    font-size: 1.2rem;
}

.login-prompt a {
    color: var(--color-accent-coral);
    font-weight: bold;
}

.gacha-main {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    justify-content: center;
}

.gacha-machine {
    flex: 1;
    min-width: 320px;
    max-width: 400px;
    background: #fff;
    padding: 2rem;
    border-radius: 20px;
    box-shadow: 0 8px 25px rgba(174, 198, 207, 0.4);
    display: flex;
    flex-direction: column;
    align-items: center;
}

.machine-body {
    width: 100%;
    height: 150px;
    background: var(--color-page-bg-subtle);
    border-radius: 15px;
    margin-bottom: 1.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 3px dashed var(--color-accent-pearl);
}

.prize-display {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--color-primary-pink);
    padding: 1rem;
    opacity: 0;
    transform: scale(0.5);
    transition: all 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

.prize-display.reveal {
    opacity: 1;
    transform: scale(1);
}

.prize-display span {
    display: inline-block;
}

.draw-button {
    padding: 0.8rem 2.5rem;
    border: none;
    background: var(--gradient-button);
    color: white;
    font-size: 1.2rem;
    font-weight: bold;
    border-radius: 30px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(217, 102, 128, 0.2);
}

.draw-button:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 7px 20px rgba(217, 102, 128, 0.4);
}

.draw-button:disabled {
    background: #ccc;
    cursor: not-allowed;
    box-shadow: none;
}

.cooldown-text {
    margin-top: 1rem;
    color: var(--color-text-subtle);
    font-style: italic;
}

.history-section {
    flex: 1;
    min-width: 320px;
    max-width: 400px;
    text-align: left;
    background: #fff;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(174, 198, 207, 0.2);
}

.history-section h2 {
    margin-top: 0;
    text-align: center;
    border-bottom: 1px solid var(--color-accent-pearl);
    padding-bottom: 1rem;
    margin-bottom: 1rem;
}

.history-list {
    list-style: none;
    padding: 0;
    max-height: 300px;
    overflow-y: auto;
}

.history-list li {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem 0.5rem;
    border-bottom: 1px solid var(--color-page-bg-subtle);
}

.history-list li:nth-child(odd) {
    background-color: var(--color-page-bg-subtle);
}

.history-prize {
    font-weight: 500;
    color: var(--color-text);
}

.history-date {
    font-size: 0.85rem;
    color: var(--color-text-subtle);
}

.loading-state,
.empty-state {
    text-align: center;
    padding: 2rem;
    color: var(--color-text-subtle);
}
</style>