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

<style scoped>
.main-content {
  padding: 20px;
  margin-top: 60px;
  /* 留出导航栏的高度 */
}
</style>