<template>
  <Navbar />
  <main class="main-content">
    <RouterView />
  </main>
</template>

<script setup>
import { RouterView } from 'vue-router';
import Navbar from '@/components/Navbar.vue';
</script>

<style>
/* 这里的样式确保了整体布局的正确性 */
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex-grow: 1;
  padding: 20px 40px;
  /* 增加左右内边距，让内容区更舒适 */
  margin-top: 60px;
  /* 留出顶部导航栏的高度 */
  width: 100%;
  box-sizing: border-box;
}
</style>