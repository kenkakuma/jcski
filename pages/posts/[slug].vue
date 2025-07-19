<template>
  <div class="article-page">
    <nav class="top-nav">
      <div class="nav-container">
        <div class="logo">
          <NuxtLink to="/">JCSKI BLOG</NuxtLink>
        </div>
        <ul class="nav-menu">
          <li><NuxtLink to="/">HOME</NuxtLink></li>
          <li><NuxtLink to="/about">ABOUT</NuxtLink></li>
          <li><NuxtLink to="/category/tech">TECH</NuxtLink></li>
          <li><NuxtLink to="/category/music">MUSIC</NuxtLink></li>
          <li><NuxtLink to="/category/life">LIFE</NuxtLink></li>
          <li><NuxtLink to="/contact">CONTACT</NuxtLink></li>
        </ul>
      </div>
    </nav>

    <div class="article-container">
      <!-- Article Header -->
      <header class="article-header">
        <div class="breadcrumb">
          <NuxtLink to="/">HOME</NuxtLink>
          <span>/</span>
          <NuxtLink :to="`/category/${article.category.toLowerCase()}`">{{ article.category }}</NuxtLink>
          <span>/</span>
          <span>{{ article.title }}</span>
        </div>
        
        <div class="article-meta-info">
          <div class="category-badge" :class="article.category.toLowerCase()">
            {{ article.category }}
          </div>
          <time class="publish-date">{{ formatDate(article.publishedAt) }}</time>
          <div class="read-time">{{ article.readTime }} min read</div>
        </div>
        
        <h1 class="article-title">{{ article.title }}</h1>
        <p class="article-excerpt">{{ article.excerpt }}</p>
        
        <div class="article-tags">
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
          <div v-if="article.coverImage" class="featured-image">
            <img :src="article.coverImage" :alt="article.title" />
          </div>
          
          <!-- Audio Player -->
          <div v-if="article.audioFile" class="audio-player">
            <h3>🎵 この記事の音声版</h3>
            <audio controls :src="article.audioFile">
              Your browser does not support the audio element.
            </audio>
          </div>
          
          <!-- Article Body -->
          <div class="article-body" v-html="article.content"></div>
          
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
                <NuxtLink :to="`/posts/${related.slug}`">
                  <div class="related-image">{{ related.category }}</div>
                  <h4>{{ related.title }}</h4>
                  <p>{{ related.excerpt }}</p>
                </NuxtLink>
              </article>
            </div>
          </div>
        </aside>
      </main>

      <!-- Navigation -->
      <nav class="article-navigation">
        <div class="nav-item prev" v-if="prevArticle">
          <NuxtLink :to="`/posts/${prevArticle.slug}`">
            <span class="nav-label">← 前の記事</span>
            <span class="nav-title">{{ prevArticle.title }}</span>
          </NuxtLink>
        </div>
        
        <div class="nav-item next" v-if="nextArticle">
          <NuxtLink :to="`/posts/${nextArticle.slug}`">
            <span class="nav-label">次の記事 →</span>
            <span class="nav-title">{{ nextArticle.title }}</span>
          </NuxtLink>
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

<script setup>
const route = useRoute()
const slug = route.params.slug

// Mock article data - replace with actual API call
const article = ref({
  slug: slug,
  title: 'Nuxt 3とVuetifyで構築するモダンブログシステム - 完全ガイド',
  excerpt: 'Nuxt 3とVuetifyを使用してモダンなブログシステムを構築する方法を詳しく解説します。TypeScriptの型安全性とSSR/SSGの最適化についても触れていきます。',
  content: `
    <h2 id="introduction">はじめに</h2>
    <p>現代のWeb開発において、パフォーマンスとユーザーエクスペリエンスの両方を満たすブログシステムの構築は重要な課題です。この記事では、Nuxt 3とVuetifyを組み合わせて、高速で美しいブログシステムを構築する方法を解説します。</p>
    
    <h2 id="main-content">Nuxt 3の基本設定</h2>
    <p>まずは、Nuxt 3プロジェクトのセットアップから始めましょう。</p>
    
    <pre><code>npx nuxi@latest init my-blog
cd my-blog
npm install</code></pre>
    
    <p>次に、必要な依存関係をインストールします：</p>
    
    <pre><code>npm install @nuxt/content
npm install vuetify
npm install @mdi/font</code></pre>
    
    <h2 id="examples">実例とサンプル</h2>
    <p>以下は、実際のコンポーネントの例です。</p>
    
    <h2 id="conclusion">まとめ</h2>
    <p>Nuxt 3とVuetifyの組み合わせにより、モダンで高速なブログシステムを構築することができました。TypeScriptの型安全性とSSR/SSGの恩恵を受けながら、美しいUIを実現できます。</p>
  `,
  category: 'TECH',
  tags: ['Nuxt3', 'Vue.js', 'TypeScript', 'Web開発'],
  publishedAt: '2025-07-13',
  readTime: 8,
  coverImage: null,
  audioFile: null
})

// Mock related articles
const relatedArticles = ref([
  {
    slug: 'typescript-best-practices',
    title: 'TypeScriptでの型安全なWeb開発 - ベストプラクティス集',
    excerpt: 'TypeScriptを使用したWeb開発における型安全性のベストプラクティスを紹介します。',
    category: 'TECH'
  },
  {
    slug: 'web-audio-api-guide',
    title: 'Web Audio APIで音楽アプリケーションを作る - 基礎から応用まで',
    excerpt: 'Web Audio APIを使用して音楽アプリケーションを構築する方法を詳しく解説します。',
    category: 'TECH'
  }
])

// Mock navigation articles
const prevArticle = ref({
  slug: 'previous-article',
  title: '前の記事のタイトル'
})

const nextArticle = ref({
  slug: 'next-article', 
  title: '次の記事のタイトル'
})

// Helper functions
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
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

// SEO
useHead({
  title: `${article.value.title} - JCSKI Blog`,
  meta: [
    { name: 'description', content: article.value.excerpt },
    { property: 'og:title', content: article.value.title },
    { property: 'og:description', content: article.value.excerpt },
    { property: 'og:type', content: 'article' },
    { name: 'keywords', content: article.value.tags.join(', ') }
  ]
})
</script>

<style scoped>
.article-page {
  min-height: 100vh;
  background-color: #ffffff;
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

.category-badge.tech {
  background: #4a90e2;
}

.category-badge.music {
  background: #ff6b6b;
}

.category-badge.life {
  background: #26de81;
}

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