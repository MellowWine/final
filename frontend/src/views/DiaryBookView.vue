<template>
    <div class="diary-book-container">
        <h2>日记簿</h2>
        <p class="subtitle">记录下每一个心动的瞬间吧</p>

        <!-- 发布日记区域 -->
        <div class="post-area">
            <textarea v-model="newDiaryContent" placeholder="今天发生了什么有趣的事呢..." rows="4"></textarea>
            <button @click="postDiary" :disabled="isPosting">
                {{ isPosting ? '发布中...' : '发布' }}
            </button>
        </div>

        <!-- 日记列表区域 -->
        <div class="diary-list">
            <div v-if="isLoading" class="loading">正在加载日记...</div>
            <div v-else-if="diaries.length === 0" class="empty">还没有人写日记哦，快来发布第一篇吧！</div>
            <div v-else v-for="diary in diaries" :key="diary.id" class="diary-item">
                <div class="diary-header">
                    <span class="author">{{ diary.username }}</span>
                    <span class="timestamp">{{ formatTimestamp(diary.created_at) }}</span>
                </div>
                <p class="diary-content">{{ diary.content }}</p>
                <div class="diary-footer">
                    <!-- 打心区域 -->
                    <div class="likes-section">
                        <!-- 如果是作者本人 -->
                        <div v-if="diary.user_id === userStore.user?.id" class="author-view">
                            获得 <span class="heart-count">{{ diary.total_hearts || 0 }}</span> 颗心
                        </div>
                        <!-- 如果是其他用户 -->
                        <div v-else class="liker-view">
                            <span v-for="i in 5" :key="i" class="heart" :class="{ 'filled': i <= diary.my_rating }"
                                @click="handleLike(diary.id, i)">❤</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useUserStore } from '@/stores/user';

const API_URL = 'http://localhost:3001/api';
const userStore = useUserStore();

const newDiaryContent = ref('');
const diaries = ref([]);
const isLoading = ref(true);
const isPosting = ref(false);

// 获取日记列表
async function fetchDiaries() {
    isLoading.value = true;
    try {
        const response = await axios.get(`${API_URL}/diaries`);
        diaries.value = response.data;
    } catch (error) {
        console.error('获取日记失败:', error);
    } finally {
        isLoading.value = false;
    }
}

// 发布日记
async function postDiary() {
    if (newDiaryContent.value.trim() === '') {
        alert('日记内容不能为空哦！');
        return;
    }
    isPosting.value = true;
    try {
        await axios.post(`${API_URL}/diaries`, { content: newDiaryContent.value });
        newDiaryContent.value = ''; // 清空文本框
        await fetchDiaries(); // 重新加载列表
    } catch (error) {
        console.error('发布日记失败:', error);
        alert(error.response?.data?.message || '发布失败，请稍后再试');
    } finally {
        isPosting.value = false;
    }
}

// 打心
async function handleLike(diaryId, rating) {
    try {
        await axios.post(`${API_URL}/diaries/${diaryId}/like`, { rating });
        await fetchDiaries(); // 重新加载以更新心数
    } catch (error) {
        console.error('打心失败:', error);
        alert(error.response?.data?.message || '操作失败');
    }
}

// 格式化时间戳
function formatTimestamp(ts) {
    const date = new Date(ts);
    return date.toLocaleString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// 组件加载时获取日记
onMounted(() => {
    fetchDiaries();
});
</script>

<style scoped>
.diary-book-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    color: var(--color-text);
}

h2 {
    text-align: center;
    font-size: 2.5rem;
    color: var(--color-primary-pink);
}

.subtitle {
    text-align: center;
    margin-bottom: 2rem;
    color: var(--color-text);
}

/* 发布区域 */
.post-area {
    position: relative;
    margin-bottom: 2rem;
    background-color: #fff;
    border-radius: 12px;
    padding: 1rem;
    box-shadow: 0 4px 15px rgba(174, 198, 207, 0.2);
}

.post-area textarea {
    width: 100%;
    border: none;
    background-color: transparent;
    resize: vertical;
    min-height: 80px;
    padding-right: 100px;
    /* 为按钮留出空间 */
    box-sizing: border-box;
    color: var(--color-text);
}

.post-area textarea:focus {
    outline: none;
}

.post-area button {
    position: absolute;
    right: 1rem;
    bottom: 1rem;
    padding: 0.5rem 1.5rem;
    border-radius: 8px;
    border: none;
    background-color: var(--color-primary-pink);
    color: #fff;
    cursor: pointer;
    transition: background-color 0.3s;
}

.post-area button:hover {
    background-color: var(--color-accent-coral);
}

.post-area button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

/* 日记列表 */
.diary-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.diary-item {
    background-color: var(--color-card-bg, #F9D5E5);
    padding: 1.5rem;
    border-radius: 12px;
    border: 1px solid var(--color-accent-pearl);
}

.diary-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    font-size: 0.9rem;
}

.author {
    font-weight: bold;
    color: var(--color-primary-pink);
}

.timestamp {
    color: var(--color-text);
    opacity: 0.7;
}

.diary-content {
    line-height: 1.6;
    white-space: pre-wrap;
    /* 保留换行和空格 */
    margin-bottom: 1.5rem;
}

.diary-footer {
    text-align: right;
}

.heart-count {
    font-weight: bold;
    color: var(--color-accent-coral);
}

.heart {
    cursor: pointer;
    font-size: 1.5rem;
    color: #ccc;
    /* 未填充的心 */
    transition: color 0.2s, transform 0.2s;
    margin: 0 2px;
}

.heart.filled {
    color: var(--color-accent-coral);
    /* 已填充的心 */
}

.heart:hover {
    transform: scale(1.2);
}
</style>