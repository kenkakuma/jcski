<template>
  <div class="news-grid">
    <div v-for="article in articles" :key="article.id" class="news-card">
      <div class="news-image">
        <img 
          v-if="article.imageUrl" 
          :src="article.imageUrl" 
          :alt="article.title"
          class="article-image"
        >
        <div v-else class="image-placeholder">
          <span class="category-label">{{ article.category }}</span>
        </div>
        
        <!-- Date overlay -->
        <div class="date-overlay">
          {{ formatDate(article.publishedAt) }}
        </div>
      </div>
      
      <div class="news-content">
        <h3 class="article-title">
          {{ article.title }}
        </h3>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Article {
  id: number
  title: string
  publishedAt: string
  imageUrl?: string
  category: string
}

defineProps<{
  articles: Article[]
}>()

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
}
</script>

<style scoped>
.news-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.news-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.3s ease;
}

.news-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.news-image {
  aspect-ratio: 16/9;
  background: #f3f4f6;
  position: relative;
  overflow: hidden;
}

.article-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #3b82f6, #1e40af);
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-label {
  color: white;
  font-weight: bold;
  font-size: 18px;
}

.date-overlay {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
}

.news-content {
  padding: 16px;
}

.article-title {
  font-weight: 500;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>