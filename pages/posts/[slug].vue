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
            <SmartImage 
              :src="article.coverImage || article.featuredImage" 
              :alt="article.title"
              height="400px"
              :show-loading-placeholder="true"
              :show-error-placeholder="true"
            />
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
                    <SmartImage 
                      :src="related.featuredImage" 
                      :fallback="getDefaultImage(related.category)"
                      :alt="related.title"
                      :category="related.category"
                      class="related-img"
                      height="80px"
                      :show-loading-placeholder="true"
                      :show-error-placeholder="true"
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
import SmartImage from '~/components/SmartImage.vue'
import { getDefaultImage } from '~/utils/media'
import { parseMarkdownAdvanced, isMarkdownContent } from '~/utils/markdown'

const route = useRoute()
const slug = route.params.slug as string

// 使用混合数据源获取文章
const { data: article, pending: loading, error: fetchError } = await useHybridPost(slug)

// 转换错误格式
const error = computed(() => {
  if (fetchError.value) {
    return fetchError.value.message || '記事の読み込みに失敗しました'
  }
  if (!article.value) {
    return '記事が見つかりません'
  }
  return null
})

// 获取相关文章 - 根据分类
const { data: allPosts } = await useLatestPosts(20)
const relatedArticles = computed(() => {
  if (!article.value || !allPosts.value) return []
  
  return allPosts.value
    .filter(post => 
      post.category === article.value?.category && 
      post.slug !== article.value?.slug
    )
    .slice(0, 3)
})

// 导航文章（上一篇/下一篇）
const prevArticle = computed(() => {
  if (!article.value || !allPosts.value) return null
  
  const currentIndex = allPosts.value.findIndex(post => post.slug === article.value?.slug)
  return currentIndex > 0 ? allPosts.value[currentIndex - 1] : null
})

const nextArticle = computed(() => {
  if (!article.value || !allPosts.value) return null
  
  const currentIndex = allPosts.value.findIndex(post => post.slug === article.value?.slug)
  return currentIndex < allPosts.value.length - 1 ? allPosts.value[currentIndex + 1] : null
})

// Computed properties
const formattedContent = computed(() => {
  if (!article.value?.content) return ''
  
  // 检测是否为Markdown格式内容
  if (isMarkdownContent(article.value.content)) {
    // 使用Markdown解析器
    const { html } = parseMarkdownAdvanced(article.value.content)
    return html
  } else {
    // HTML内容处理：规范化富文本编辑器产生的HTML
    let content = article.value.content
    
    // 处理空的div标签和多余的换行
    content = content
      .replace(/<div><br><\/div>/g, '<br>')
      .replace(/<div><\/div>/g, '<br>')
      .replace(/<div>/g, '<p>')
      .replace(/<\/div>/g, '</p>')
      .replace(/(<br\s*\/?>){3,}/g, '<br><br>')  // 限制连续换行
      .replace(/^<p><\/p>/gm, '')  // 移除空段落
      .replace(/\n/g, ' ')  // 将换行符转换为空格，避免不必要的换行
    
    return content
  }
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

// getDefaultImage is now imported from utils/media

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

// SEO and JSON-LD setup
const { setArticleSEO } = useSEO()
const { generateArticleJsonLD, applyJsonLD } = useJsonLD()

// Watch for article changes to update SEO and JSON-LD
watch(article, (newArticle) => {
  if (newArticle) {
    setArticleSEO(newArticle)
    
    // 应用文章JSON-LD结构化数据
    const articleJsonLD = generateArticleJsonLD(newArticle)
    applyJsonLD(articleJsonLD)
  }
}, { immediate: true })
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

/* 确保HTML内容中的段落和标题正确显示 */
.article-body p {
  margin-bottom: 16px;
  line-height: 1.8;
}

.article-body p:empty {
  display: none;
}

/* 处理富文本编辑器产生的内联样式 */
.article-body strong {
  font-weight: bold;
  color: #2c3e50;
}

.article-body em {
  font-style: italic;
}

/* 确保代码显示正确 */
.article-body code {
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
  color: #e74c3c;
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
  overflow: hidden;
  border-radius: 4px 4px 0 0;
}

.related-img {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  display: block !important;
  border-radius: 4px 4px 0 0;
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