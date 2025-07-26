<template>
  <NuxtLayout name="admin">
    <div class="admin-settings-page">
      <div class="page-header">
        <h1 class="page-title">⚙️ 网站设置</h1>
        <p class="page-description">配置网站的基本信息和功能设置</p>
      </div>
      
      <div class="page-content">
        <AdminSiteSettings />
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AdminSiteSettings from '~/components/AdminSiteSettings.vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth'
})

useHead({
  title: '网站设置 - JCSKI Admin',
  meta: [
    { name: 'robots', content: 'noindex' }
  ]
})
</script>

<style scoped>
.admin-settings-page {
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