<template>
  <NuxtLayout name="admin">
    <div class="admin-media-page">
      <div class="page-header">
        <h1 class="page-title">🖼️ 媒体管理</h1>
        <p class="page-description">上传、管理和组织图片、音频等媒体文件</p>
      </div>
      
      <div class="page-content">
        <AdminMedia />
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AdminMedia from '~/components/AdminMedia.vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth'
})

useHead({
  title: '媒体管理 - JCSKI Admin',
  meta: [
    { name: 'robots', content: 'noindex' }
  ]
})
</script>

<style scoped>
.admin-media-page {
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