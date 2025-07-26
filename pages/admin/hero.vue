<template>
  <NuxtLayout name="admin">
    <div class="admin-hero-page">
      <div class="page-header">
        <h1 class="page-title">🎆 Hero管理</h1>
        <p class="page-description">管理首页Hero区域的内容和展示效果</p>
      </div>
      
      <div class="page-content">
        <AdminHero />
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AdminHero from '~/components/AdminHero.vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth'
})

useHead({
  title: 'Hero管理 - JCSKI Admin',
  meta: [
    { name: 'robots', content: 'noindex' }
  ]
})
</script>

<style scoped>
.admin-hero-page {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;
  text-align: center;
}

.page-title {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 10px;
  font-weight: 600;
}

.page-description {
  font-size: 1.1rem;
  color: #666;
  margin: 0;
}

.page-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}
</style>