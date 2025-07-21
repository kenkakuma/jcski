<template>
  <div class="post-detail-page">
    <!-- Top Navigation Bar (JCSKI style) -->
    <nav class="top-nav">
      <div class="nav-container">
        <a href="/" class="top-logo">JCSKI BLOG</a>
        <div class="top-nav-menu">
          <a href="/music" class="top-nav-item">
            <span class="nav-title">MUSIC</span>
            <span class="nav-subtitle">音楽</span>
          </a>
          <a href="/skiing" class="top-nav-item">
            <span class="nav-title">SKIING</span>
            <span class="nav-subtitle">スキー</span>
          </a>
          <a href="/tech" class="top-nav-item">
            <span class="nav-title">TECH</span>
            <span class="nav-subtitle">テクノロジー</span>
          </a>
          <a href="/fishing" class="top-nav-item">
            <span class="nav-title">FISHING</span>
            <span class="nav-subtitle">釣り</span>
          </a>
          <a href="/about" class="top-nav-item">
            <span class="nav-title">ABOUT</span>
            <span class="nav-subtitle">プロフィール</span>
          </a>
        </div>
      </div>
    </nav>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">記事を読み込み中...</div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-message">
        <h2>記事が見つかりません</h2>
        <p>{{ error }}</p>
        <a href="/" class="back-home-btn">ホームに戻る</a>
      </div>
    </div>

    <!-- Article Content -->
    <div v-else-if="article" class="article-container">
      <!-- Breadcrumb -->
      <nav class="breadcrumb">
        <a href="/" class="breadcrumb-item">HOME</a>
        <span class="breadcrumb-separator">></span>
        <span class="breadcrumb-current">{{ article.title }}</span>
      </nav>

      <!-- Article Header -->
      <header class="article-header">
        <div class="article-meta-info">
          <div class="category-badge" :class="getCategoryClass(article.category)">
            {{ article.category }}
          </div>
          <span class="article-pin" v-if="article.isPinned">📌 PINNED</span>
          <time class="publish-date">{{ formatDate(article.createdAt) }}</time>
        </div>
        
        <h1 class="article-title">{{ article.title }}</h1>
        <p class="article-excerpt">{{ article.excerpt }}</p>
        
        <div class="article-author-info">
          <span class="author-label">著者:</span>
          <span class="author-name">{{ article.author?.username || 'JCSKI' }}</span>
        </div>

        <div class="article-tags" v-if="article.tags && article.tags.length > 0">
          <span 
            v-for="tag in article.tags" 
            :key="tag" 
            class="tag"
          >
            #{{ tag }}
          </span>
        </div>
      </header>

      <!-- Article Content -->
      <main class="article-main">
        <div class="article-content">
          <!-- Featured Image -->
          <div v-if="article.coverImage || article.featuredImage" class="featured-image">
            <img :src="article.coverImage || article.featuredImage" :alt="article.title" />
          </div>
          
          <!-- Audio Player -->
          <div v-if="article.audioFile" class="audio-player">
            <h3>🎵 この記事の音声版</h3>
            <audio controls :src="article.audioFile">
              Your browser does not support the audio element.
            </audio>
          </div>
          
          <!-- Article Body -->
          <div class="article-body" v-html="formattedContent"></div>
          
          <!-- Author Info -->
          <div class="author-section">
            <div class="author-avatar">JC</div>
            <div class="author-info">
              <h4>JCSKI</h4>
              <p>Web Developer & Music Producer</p>
              <p class="author-bio">
                技術と音楽の融合を探求するクリエイター。最新のWeb技術と音楽制作について発信しています。
              </p>
            </div>
          </div>
        </div>
        
        <!-- Sidebar -->
        <aside class="article-sidebar">
          <!-- Table of Contents -->
          <div class="toc-section">
            <h3>目次</h3>
            <nav class="table-of-contents">
              <ul>
                <li><a href="#introduction">はじめに</a></li>
                <li><a href="#main-content">メインコンテンツ</a></li>
                <li><a href="#examples">実例とサンプル</a></li>
                <li><a href="#conclusion">まとめ</a></li>
              </ul>
            </nav>
          </div>
          
          <!-- Share Buttons -->
          <div class="share-section">
            <h3>記事をシェア</h3>
            <div class="share-buttons">
              <button class="share-btn twitter" @click="shareToTwitter">
                🐦 Twitter
              </button>
              <button class="share-btn facebook" @click="shareToFacebook">
                📘 Facebook
              </button>
              <button class="share-btn copy" @click="copyUrl">
                🔗 URLコピー
              </button>
            </div>
          </div>
          
          <!-- Related Articles -->
          <div class="related-section">
            <h3>関連記事</h3>
            <div class="related-articles">
              <article 
                v-for="related in relatedArticles" 
                :key="related.slug"
                class="related-item"
              >
                <a :href="`/posts/${related.slug}`">
                  <div class="related-image">
                    <img 
                      :src="related.featuredImage || getDefaultImage(related.category)" 
                      :alt="related.title"
                      class="related-img"
                    />
                  </div>
                  <div class="related-content">
                    <span class="related-category">{{ related.category }}</span>
                    <h4>{{ related.title }}</h4>
                    <p>{{ related.excerpt }}</p>
                    <time class="related-date">{{ formatDate(related.createdAt) }}</time>
                  </div>
                </a>
              </article>
            </div>
          </div>
        </aside>
      </main>

      <!-- Navigation -->
      <nav class="article-navigation">
        <div class="nav-item prev" v-if="prevArticle">
          <a :href="`/posts/${prevArticle.slug}`">
            <span class="nav-label">← 前の記事</span>
            <span class="nav-title">{{ prevArticle.title }}</span>
          </a>
        </div>
        
        <div class="nav-item next" v-if="nextArticle">
          <a :href="`/posts/${nextArticle.slug}`">
            <span class="nav-label">次の記事 →</span>
            <span class="nav-title">{{ nextArticle.title }}</span>
          </a>
        </div>
      </nav>

      <!-- Comments Section -->
      <section class="comments-section">
        <h2>コメント</h2>
        <div class="comments-placeholder">
          <p>コメント機能は準備中です。ご意見・ご感想は<NuxtLink to="/contact">お問い合わせ</NuxtLink>からお寄せください。</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { BlogPost } from '~/types'

const route = useRoute()
const slug = route.params.slug as string

// Reactive data
const article = ref<BlogPost | null>(null)
const relatedArticles = ref<BlogPost[]>([])
const prevArticle = ref<BlogPost | null>(null)
const nextArticle = ref<BlogPost | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

// Fetch post data
const fetchPost = async () => {
  try {
    loading.value = true
    error.value = null
    
    const response = await $fetch(`/api/posts/${slug}`)
    
    if (response && response.success && response.data) {
      // 解析tags字段（如果是JSON字符串）
      const articleData = { ...response.data }
      if (typeof articleData.tags === 'string') {
        try {
          articleData.tags = JSON.parse(articleData.tags)
        } catch (e) {
          console.warn('Failed to parse tags JSON:', e)
          articleData.tags = []
        }
      }
      
      article.value = articleData
      relatedArticles.value = response.related || []
      prevArticle.value = response.navigation?.previous || null
      nextArticle.value = response.navigation?.next || null
    } else {
      error.value = '記事が見つかりません'
    }
  } catch (err: any) {
    console.error('Error fetching post:', err)
    error.value = '記事の読み込みに失敗しました'
  } finally {
    loading.value = false
  }
}

// Initialize
onMounted(() => {
  fetchPost()
})

// Computed properties
const formattedContent = computed(() => {
  if (!article.value?.content) return ''
  
  // Simple HTML formatting for now
  // In the future, this could support Markdown rendering
  return article.value.content.replace(/\n/g, '<br>')
})

// Helper functions
const formatDate = (date: Date | string) => {
  const d = new Date(date)
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '.')
}

const getCategoryClass = (category: string) => {
  const categoryMap: { [key: string]: string } = {
    'MUSIC': 'category-music',
    'TECH': 'category-tech', 
    'SKIING': 'category-skiing',
    'FISHING': 'category-fishing',
    'BLOG': 'category-blog',
    'NEWS': 'category-news',
    'GAMING': 'category-gaming',
    'PODCAST': 'category-podcast'
  }
  return categoryMap[category] || 'category-default'
}

const getDefaultImage = (category: string) => {
  const imageMap: { [key: string]: string } = {
    'MUSIC': '/images/music.jpg',
    'TECH': '/images/tech.jpg',
    'SKIING': '/images/skiing.jpg',
    'FISHING': '/images/fishing.jpg',
    'BLOG': '/images/news.jpg',
    'NEWS': '/images/news.jpg',
    'GAMING': '/images/gaming.jpg',
    'PODCAST': '/images/music.jpg'
  }
  return imageMap[category] || '/images/news.jpg'
}

const shareToTwitter = () => {
  const url = encodeURIComponent(window.location.href)
  const text = encodeURIComponent(article.value.title)
  window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`)
}

const shareToFacebook = () => {
  const url = encodeURIComponent(window.location.href)
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`)
}

const copyUrl = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href)
    alert('URLをコピーしました！')
  } catch (err) {
    console.error('Failed to copy URL:', err)
  }
}

// SEO Meta
useHead({
  title: computed(() => article.value ? `${article.value.title} | JCSKI BLOG` : 'Loading... | JCSKI BLOG'),
  meta: [
    {
      name: 'description',
      content: computed(() => article.value?.excerpt || 'JCSKI Blog Article')
    },
    {
      property: 'og:title',
      content: computed(() => article.value?.title || 'JCSKI BLOG')
    },
    {
      property: 'og:description', 
      content: computed(() => article.value?.excerpt || 'JCSKI Blog Article')
    },
    {
      property: 'og:image',
      content: computed(() => article.value?.featuredImage || article.value?.coverImage || '/images/news.jpg')
    },
    {
      property: 'og:type',
      content: 'article'
    },
    {
      name: 'keywords',
      content: computed(() => article.value?.tags?.join(', ') || 'JCSKI, Blog')
    }
  ]
})
</script>

<style scoped>
/* Base Styles */
.post-detail-page {
  font-family: 'Noto Sans SC', 'Noto Sans JP', 'Noto Sans', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background: #fff;
  min-height: 100vh;
}

/* Top Navigation (JCSKI style) */
.top-nav {
  background: #fff;
  border-bottom: 1px solid #000;
  padding: 20px 0;
}

.nav-container {
  max-width: 1300px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.top-logo {
  font-family: "Special Gothic Expanded One", sans-serif;
  font-weight: 400;
  font-style: normal;
  font-size: 18px;
  letter-spacing: 2px;
  color: #000;
  text-decoration: none;
}

.top-nav-menu {
  display: flex;
  gap: 24px;
}

.top-nav-item {
  color: #000;
  text-decoration: none;
  padding: 8px 16px;
  position: relative;
  overflow: hidden;
  transition: all 0.4s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.top-nav-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: #000;
  transition: left 0.4s ease;
  z-index: 1;
}

.top-nav-item:hover::before {
  left: 0;
}

.top-nav-item:hover .nav-title,
.top-nav-item:hover .nav-subtitle {
  color: #fff;
}

.nav-title {
  font-family: "Special Gothic Expanded One", sans-serif;
  font-weight: 400;
  font-style: normal;
  font-size: 14px;
  letter-spacing: 1px;
  color: #000;
  margin-bottom: 2px;
  line-height: 1;
  transition: color 0.4s ease;
  position: relative;
  z-index: 2;
}

.nav-subtitle {
  font-size: 10px;
  font-weight: 400;
  color: #666;
  letter-spacing: 0.5px;
  line-height: 1;
  transition: color 0.4s ease;
  position: relative;
  z-index: 2;
}

/* Loading and Error States */
.loading-container, .error-container {
  max-width: 1300px;
  margin: 0 auto;
  padding: 80px 20px;
  text-align: center;
}

.loading-spinner {
  font-size: 18px;
  color: #666;
}

.error-message h2 {
  font-family: "Special Gothic Expanded One", sans-serif;
  font-size: 24px;
  margin-bottom: 16px;
  color: #000;
}

.error-message p {
  color: #666;
  margin-bottom: 24px;
}

.back-home-btn {
  display: inline-block;
  background: #000;
  color: #fff;
  padding: 12px 24px;
  text-decoration: none;
  font-weight: 600;
  transition: background 0.3s ease;
}

.back-home-btn:hover {
  background: #333;
}

.article-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.article-header {
  padding: 40px 0 60px;
  border-bottom: 2px solid #f0f0f0;
  margin-bottom: 40px;
}

.breadcrumb {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
}

.breadcrumb a {
  color: #4a90e2;
  text-decoration: none;
}

.breadcrumb span {
  margin: 0 8px;
}

.article-meta-info {
  display: flex;
  gap: 20px;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.category-badge {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  color: white;
}

/* Category Colors (JCSKI style) */
.category-music { background: #9C27B0; }
.category-tech { background: #2196F3; }
.category-skiing { background: #00BCD4; }
.category-fishing { background: #4CAF50; }
.category-blog { background: #FF9800; }
.category-news { background: #F44336; }
.category-gaming { background: #E91E63; }
.category-podcast { background: #795548; }
.category-default { background: #000; }

.publish-date, .read-time {
  font-size: 14px;
  color: #666;
}

.article-title {
  font-size: 42px;
  font-weight: bold;
  color: #000;
  line-height: 1.3;
  margin-bottom: 20px;
}

.article-excerpt {
  font-size: 18px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 30px;
}

.article-tags {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.tag {
  background: #f0f0f0;
  color: #666;
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 13px;
  font-weight: 500;
}

.article-main {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 60px;
  margin-bottom: 80px;
}

.article-content {
  max-width: none;
}

.featured-image {
  margin-bottom: 40px;
}

.featured-image img {
  width: 100%;
  height: auto;
  border-radius: 12px;
}

.audio-player {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 40px;
}

.audio-player h3 {
  margin-bottom: 15px;
  color: #333;
}

.audio-player audio {
  width: 100%;
}

.article-body {
  font-size: 16px;
  line-height: 1.8;
  color: #333;
}

.article-body h2 {
  font-size: 28px;
  font-weight: bold;
  color: #000;
  margin: 40px 0 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #4a90e2;
}

.article-body h3 {
  font-size: 22px;
  font-weight: bold;
  color: #000;
  margin: 30px 0 15px;
}

.article-body p {
  margin-bottom: 20px;
}

.article-body pre {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 25px 0;
}

.article-body code {
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

.author-section {
  display: flex;
  gap: 20px;
  background: #f8f9fa;
  padding: 30px;
  border-radius: 12px;
  margin-top: 60px;
}

.author-avatar {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #4a90e2, #357abd);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  font-weight: bold;
  flex-shrink: 0;
}

.author-info h4 {
  font-size: 20px;
  font-weight: bold;
  color: #000;
  margin-bottom: 5px;
}

.author-info p {
  color: #666;
  margin-bottom: 10px;
}

.author-bio {
  font-size: 14px;
  line-height: 1.6;
}

.article-sidebar {
  position: sticky;
  top: 20px;
  height: fit-content;
}

.toc-section, .share-section, .related-section {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 30px;
}

.toc-section h3, .share-section h3, .related-section h3 {
  font-size: 18px;
  font-weight: bold;
  color: #000;
  margin-bottom: 20px;
}

.table-of-contents ul {
  list-style: none;
  padding: 0;
}

.table-of-contents li {
  margin-bottom: 10px;
}

.table-of-contents a {
  color: #4a90e2;
  text-decoration: none;
  font-size: 14px;
}

.table-of-contents a:hover {
  text-decoration: underline;
}

.share-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.share-btn {
  padding: 10px 15px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.share-btn.twitter {
  background: #1da1f2;
  color: white;
}

.share-btn.facebook {
  background: #4267b2;
  color: white;
}

.share-btn.copy {
  background: #6c757d;
  color: white;
}

.share-btn:hover {
  opacity: 0.8;
}

.related-articles {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.related-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.related-item:hover {
  transform: translateY(-2px);
}

.related-item a {
  display: block;
  text-decoration: none;
  color: inherit;
}

.related-image {
  height: 80px;
  background: linear-gradient(45deg, #74b9ff, #0984e3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.related-item h4 {
  font-size: 14px;
  font-weight: bold;
  color: #000;
  margin: 15px 15px 10px;
}

.related-item p {
  font-size: 12px;
  color: #666;
  margin: 0 15px 15px;
  line-height: 1.4;
}

.article-navigation {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 60px;
  padding-top: 40px;
  border-top: 2px solid #f0f0f0;
}

.nav-item a {
  display: block;
  padding: 25px;
  background: #f8f9fa;
  border-radius: 12px;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
}

.nav-item a:hover {
  background: #e9ecef;
}

.nav-item.next {
  text-align: right;
}

.nav-label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.nav-title {
  display: block;
  font-size: 16px;
  font-weight: bold;
  color: #000;
  line-height: 1.4;
}

.comments-section {
  padding: 40px 0;
  border-top: 2px solid #f0f0f0;
}

.comments-section h2 {
  font-size: 28px;
  font-weight: bold;
  color: #000;
  margin-bottom: 30px;
}

.comments-placeholder {
  background: #f8f9fa;
  padding: 40px;
  text-align: center;
  border-radius: 12px;
}

.comments-placeholder p {
  color: #666;
  font-size: 16px;
}

.comments-placeholder a {
  color: #4a90e2;
  text-decoration: none;
}

@media (max-width: 1024px) {
  .article-main {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  
  .article-sidebar {
    position: static;
    order: -1;
  }
  
  .toc-section, .share-section, .related-section {
    margin-bottom: 20px;
  }
}

@media (max-width: 768px) {
  .article-title {
    font-size: 32px;
  }
  
  .article-excerpt {
    font-size: 16px;
  }
  
  .article-navigation {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .nav-item.next {
    text-align: left;
  }
  
  .article-meta-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .author-section {
    flex-direction: column;
    text-align: center;
  }
  
  .author-avatar {
    align-self: center;
  }
}
</style>