<template>
  <div class="home-container">
    <div class="welcome-section">
      <h1 class="welcome-title">欢迎来到恋爱小屋</h1>
    </div>

    <div class="timer-section">
      <p v-if="userStore.isLoggedIn && daysInLove !== null">
        我们已经相爱 <span class="days">{{ daysInLove }}</span> 天
      </p>
      <p v-else>
        我们已经相爱 <span class="days">——</span> 天
      </p>
    </div>

    <div class="quote-section">
      <p class="daily-quote">{{ dailyQuote }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();

// 计算恋爱天数
const daysInLove = computed(() => {
  // 确保用户已登录且有开始日期
  if (!userStore.isLoggedIn || !userStore.user?.love_start_date) {
    return null;
  }

  const startDate = new Date(userStore.user.love_start_date);
  const today = new Date();

  // 忽略时分秒，只比较日期
  startDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const differenceInTime = today.getTime() - startDate.getTime();
  const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24)) + 1; // +1 表示第一天也算一天

  return differenceInDays;
});

// 每日情话库
const quotes = [
  "今天也想听见你的声音 ❤",
  "遇见你，是我所有浪漫的开始。",
  "星河滚烫，你是人间理想。",
  "我的世界，因为你而闪亮。",
  "想和你一起，看遍世间所有风景。",
  "风是甜的，云是软的，你也是。",
  "答案很长，我准备用一生来回答你。",
  "你是我的光，是我所有期待的远方。",
];

// 根据今天的日期，每天显示一句不同的情话
const dailyQuote = computed(() => {
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  const index = dayOfYear % quotes.length;
  return quotes[index];
});
</script>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  /* 减去导航栏高度，让内容在可视区域垂直居中 */
  min-height: calc(100vh - 100px);
  padding: 2rem;
  color: var(--color-text);
  /* 使用全局文字颜色 */
}

/* 欢迎语区域 */
.welcome-section {
  margin-bottom: 2rem;
}

.welcome-title {
  font-size: 2.5rem;
  font-weight: 600;
  color: var(--color-primary-pink);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  animation: fadeIn 1.5s ease-in-out;
}

/* 计时器区域 */
.timer-section {
  font-size: 1.5rem;
  margin-bottom: 3rem;
  animation: fadeIn 2s ease-in-out;
}

.days {
  font-size: 2.2rem;
  font-weight: bold;
  color: var(--color-accent-coral);
  margin: 0 0.5rem;
}

/* 每日情话区域 */
.quote-section {
  padding: 1rem 2rem;
  border-top: 1px solid var(--color-accent-pearl);
  animation: fadeIn 2.5s ease-in-out;
}

.daily-quote {
  font-size: 1.2rem;
  font-style: italic;
  color: var(--color-text);
}

/* 添加一个简单的淡入动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>