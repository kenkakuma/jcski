<template>
  <div class="category-page">
    <nav class="top-nav">
      <div class="nav-container">
        <div class="logo">
          <NuxtLink to="/">JCSKI BLOG</NuxtLink>
        </div>
        <ul class="nav-menu">
          <li><NuxtLink to="/">HOME</NuxtLink></li>
          <li><NuxtLink to="/about">ABOUT</NuxtLink></li>
          <li><NuxtLink to="/category/tech" :class="{ active: currentCategory === 'tech' }">TECH</NuxtLink></li>
          <li><NuxtLink to="/category/music" :class="{ active: currentCategory === 'music' }">MUSIC</NuxtLink></li>
          <li><NuxtLink to="/category/life" :class="{ active: currentCategory === 'life' }">LIFE</NuxtLink></li>
          <li><NuxtLink to="/contact">CONTACT</NuxtLink></li>
        </ul>
      </div>
    </nav>

    <div class="category-container">
      <!-- Category Header -->
      <header class="category-header">
        <div class="breadcrumb">
          <NuxtLink to="/">HOME</NuxtLink>
          <span>/</span>
          <span>{{ categoryInfo.name }}</span>
        </div>
        
        <div class="category-hero" :class="currentCategory">
          <div class="category-icon">{{ categoryInfo.icon }}</div>
          <div class="category-content">
            <h1 class="category-title">{{ categoryInfo.name }}</h1>
            <p class="category-description">{{ categoryInfo.description }}</p>
            <div class="category-stats">
              <span class="post-count">{{ articles.length }}記事</span>
              <span class="last-updated">最終更新: {{ lastUpdated }}</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Filter and Sort -->
      <div class="filter-section">
        <div class="filter-controls">
          <div class="sort-controls">
            <label>並び順:</label>
            <select v-model="sortOrder" @change="sortArticles">
              <option value="newest">新しい順</option>
              <option value="oldest">古い順</option>
              <option value="popular">人気順</option>
              <option value="title">タイトル順</option>
            </select>
          </div>
          
          <div class="view-controls">
            <button 
              :class="{ active: viewMode === 'grid' }" 
              @click="viewMode = 'grid'"
              class="view-btn"
            >
              📊 グリッド
            </button>
            <button 
              :class="{ active: viewMode === 'list' }" 
              @click="viewMode = 'list'"
              class="view-btn"
            >
              📋 リスト
            </button>
          </div>
        </div>
        
        <div class="search-box">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="この分類内で検索..."
            @input="filterArticles"
          >
          <button class="search-btn">🔍</button>
        </div>
      </div>

      <!-- Articles Grid/List -->
      <main class="articles-section">
        <div v-if="filteredArticles.length === 0" class="no-articles">
          <p>記事が見つかりませんでした。</p>
        </div>
        
        <div 
          v-else
          class="articles-container" 
          :class="{ 'grid-view': viewMode === 'grid', 'list-view': viewMode === 'list' }"
        >
          <article 
            v-for="article in paginatedArticles" 
            :key="article.slug"
            class="article-card"
          >
            <NuxtLink :to="`/posts/${article.slug}`" class="article-link">
              <!-- Article Image -->
              <div class="article-image" :class="currentCategory">
                <div class="image-placeholder">{{ categoryInfo.icon }}</div>
                <div class="read-time">{{ article.readTime }}分</div>
              </div>
              
              <!-- Article Content -->
              <div class="article-content">
                <div class="article-meta">
                  <time class="publish-date">{{ formatDate(article.publishedAt) }}</time>
                  <div class="article-tags">
                    <span 
                      v-for="tag in article.tags.slice(0, 2)" 
                      :key="tag" 
                      class="tag"
                    >
                      #{{ tag }}
                    </span>
                  </div>
                </div>
                
                <h2 class="article-title">{{ article.title }}</h2>
                <p class="article-excerpt">{{ article.excerpt }}</p>
                
                <div class="article-footer">
                  <div class="article-stats">
                    <span class="views">👁 {{ article.views }}</span>
                    <span class="likes">❤️ {{ article.likes }}</span>
                  </div>
                  <div class="read-more">続きを読む →</div>
                </div>
              </div>
            </NuxtLink>
          </article>
        </div>

        <!-- Pagination -->
        <nav class="pagination" v-if="totalPages > 1">
          <button 
            :disabled="currentPage === 1" 
            @click="goToPage(currentPage - 1)"
            class="page-btn"
          >
            ← 前へ
          </button>
          
          <div class="page-numbers">
            <button 
              v-for="page in visiblePages" 
              :key="page"
              :class="{ active: page === currentPage }"
              @click="goToPage(page)"
              class="page-number"
            >
              {{ page }}
            </button>
          </div>
          
          <button 
            :disabled="currentPage === totalPages" 
            @click="goToPage(currentPage + 1)"
            class="page-btn"
          >
            次へ →
          </button>
        </nav>
      </main>

      <!-- Category Sidebar -->
      <aside class="category-sidebar">
        <!-- Popular Tags -->
        <div class="widget popular-tags">
          <h3>人気タグ</h3>
          <div class="tag-cloud">
            <span 
              v-for="tag in popularTags" 
              :key="tag.name"
              class="tag-item"
              :style="{ fontSize: tag.size + 'px' }"
            >
              #{{ tag.name }}
            </span>
          </div>
        </div>
        
        <!-- Recent Articles from Other Categories -->
        <div class="widget recent-other">
          <h3>他の分類の新着記事</h3>
          <div class="recent-list">
            <article 
              v-for="article in recentOtherArticles" 
              :key="article.slug"
              class="recent-item"
            >
              <NuxtLink :to="`/posts/${article.slug}`">
                <div class="recent-category">{{ article.category }}</div>
                <h4>{{ article.title }}</h4>
                <time>{{ formatDate(article.publishedAt) }}</time>
              </NuxtLink>
            </article>
          </div>
        </div>
        
        <!-- Newsletter Signup -->
        <div class="widget newsletter">
          <h3>記事更新通知</h3>
          <p>新しい記事の更新をメールでお知らせします。</p>
          <form @submit.prevent="subscribeNewsletter" class="newsletter-form">
            <input 
              v-model="email" 
              type="email" 
              placeholder="メールアドレス"
              required
            >
            <button type="submit">登録</button>
          </form>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const currentCategory = route.params.category

// Category configurations
const categoryConfigs = {
  tech: {
    name: 'TECHNOLOGY',
    icon: '💻',
    description: 'Web開発、プログラミング、最新技術に関する記事をお届けします。JavaScript、TypeScript、フレームワークの活用法から開発ツールまで幅広くカバー。'
  },
  music: {
    name: 'MUSIC',
    icon: '🎵',
    description: '音楽制作、DTM、楽器演奏、音楽理論など音楽に関する様々なトピックを扱います。クリエイティブな音楽制作のコツやテクニックを共有。'
  },
  life: {
    name: 'LIFESTYLE',
    icon: '🌟',
    description: '日常生活、仕事術、趣味、旅行など、より豊かな生活を送るためのヒントやアイデアをシェアします。'
  }
}

const categoryInfo = computed(() => categoryConfigs[currentCategory] || categoryConfigs.tech)

// Reactive data
const viewMode = ref('grid')
const sortOrder = ref('newest')
const searchQuery = ref('')
const currentPage = ref(1)
const articlesPerPage = ref(6)
const email = ref('')

// Mock articles data
const articles = ref([
  {
    slug: 'nuxt3-vuetify-blog-system',
    title: 'Nuxt 3とVuetifyで構築するモダンブログシステム - 完全ガイド',
    excerpt: 'Nuxt 3とVuetifyを使用してモダンなブログシステムを構築する方法を詳しく解説します。TypeScriptの型安全性とSSR/SSGの最適化についても触れていきます。',
    publishedAt: '2025-07-13',
    readTime: 8,
    views: 1205,
    likes: 89,
    tags: ['Nuxt3', 'Vue.js', 'TypeScript', 'Web開発'],
    category: 'TECH'
  },
  {
    slug: 'typescript-best-practices',
    title: 'TypeScriptでの型安全なWeb開発 - ベストプラクティス集',
    excerpt: 'TypeScriptを使用したWeb開発における型安全性のベストプラクティスを紹介します。実際のプロジェクトで役立つテクニックを実例とともに解説。',
    publishedAt: '2025-07-12',
    readTime: 12,
    views: 892,
    likes: 67,
    tags: ['TypeScript', 'JavaScript', 'Web開発', 'ベストプラクティス'],
    category: 'TECH'
  },
  {
    slug: 'web-audio-api-guide',
    title: 'Web Audio APIで音楽アプリケーションを作る - 基礎から応用まで',
    excerpt: 'Web Audio APIを使用して音楽アプリケーションを構築する方法を詳しく解説します。音声処理の基礎からリアルタイム効果まで。',
    publishedAt: '2025-07-11',
    readTime: 15,
    views: 754,
    likes: 56,
    tags: ['WebAudio', 'JavaScript', '音楽', 'API'],
    category: 'TECH'
  },
  {
    slug: 'remote-work-optimization',
    title: 'リモートワーク環境の最適化 - 生産性を上げるツールとテクニック',
    excerpt: 'リモートワークで最高のパフォーマンスを発揮するための環境設定、ツール選択、時間管理のコツを紹介します。',
    publishedAt: '2025-07-10',
    readTime: 10,
    views: 623,
    likes: 45,
    tags: ['リモートワーク', '生産性', 'ツール', 'ワークフロー'],
    category: 'LIFE'
  },
  {
    slug: 'music-programming-creativity',
    title: '音楽制作とプログラミングの共通点 - クリエイティブな思考法',
    excerpt: '音楽制作とプログラミングに共通するクリエイティブな思考プロセスについて考察します。両方の分野での経験から得た洞察を共有。',
    publishedAt: '2025-07-09',
    readTime: 7,
    views: 445,
    likes: 38,
    tags: ['音楽制作', 'プログラミング', 'クリエイティブ', '思考法'],
    category: 'MUSIC'
  }
])

// Filter articles by category
const categoryArticles = computed(() => {
  if (currentCategory === 'all') return articles.value
  return articles.value.filter(article => 
    article.category.toLowerCase() === currentCategory
  )
})

const filteredArticles = ref(categoryArticles.value)

// Computed properties
const lastUpdated = computed(() => {
  if (categoryArticles.value.length === 0) return '未更新'
  const latest = categoryArticles.value[0].publishedAt
  return formatDate(latest)
})

const totalPages = computed(() => 
  Math.ceil(filteredArticles.value.length / articlesPerPage.value)
)

const paginatedArticles = computed(() => {
  const start = (currentPage.value - 1) * articlesPerPage.value
  const end = start + articlesPerPage.value
  return filteredArticles.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// Mock data for sidebar
const popularTags = ref([
  { name: 'JavaScript', size: 16 },
  { name: 'Vue.js', size: 14 },
  { name: 'TypeScript', size: 13 },
  { name: 'Nuxt3', size: 12 },
  { name: 'Web開発', size: 15 },
  { name: 'プログラミング', size: 11 }
])

const recentOtherArticles = ref([
  {
    slug: 'other-article-1',
    title: '他のカテゴリの記事1',
    publishedAt: '2025-07-13',
    category: 'MUSIC'
  },
  {
    slug: 'other-article-2', 
    title: '他のカテゴリの記事2',
    publishedAt: '2025-07-12',
    category: 'LIFE'
  }
])

// Methods
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long', 
    day: 'numeric'
  })
}

const sortArticles = () => {
  const sorted = [...filteredArticles.value]
  
  switch (sortOrder.value) {
    case 'newest':
      sorted.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      break
    case 'oldest':
      sorted.sort((a, b) => new Date(a.publishedAt) - new Date(b.publishedAt))
      break
    case 'popular':
      sorted.sort((a, b) => b.views - a.views)
      break
    case 'title':
      sorted.sort((a, b) => a.title.localeCompare(b.title))
      break
  }
  
  filteredArticles.value = sorted
  currentPage.value = 1
}

const filterArticles = () => {
  if (!searchQuery.value) {
    filteredArticles.value = categoryArticles.value
  } else {
    filteredArticles.value = categoryArticles.value.filter(article =>
      article.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchQuery.value.toLowerCase()))
    )
  }
  currentPage.value = 1
}

const goToPage = (page) => {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const subscribeNewsletter = () => {
  // Mock newsletter subscription
  alert(`${email.value} でニュースレター登録を受け付けました！`)
  email.value = ''
}

// Initialize
onMounted(() => {
  sortArticles()
})

// SEO
useHead({
  title: `${categoryInfo.value.name} - JCSKI Blog`,
  meta: [
    { name: 'description', content: categoryInfo.value.description }
  ]
})
</script>

<style scoped>
.category-page {
  min-height: 100vh;
  background-color: #ffffff;
}

.category-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 60px;
}

.category-header {
  grid-column: 1 / -1;
  padding: 40px 0;
}

.breadcrumb {
  font-size: 14px;
  color: #666;
  margin-bottom: 30px;
}

.breadcrumb a {
  color: #4a90e2;
  text-decoration: none;
}

.breadcrumb span {
  margin: 0 8px;
}

.category-hero {
  display: flex;
  gap: 30px;
  align-items: center;
  padding: 40px;
  border-radius: 20px;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
}

.category-hero.tech {
  background: linear-gradient(135deg, #4a90e2, #357abd);
  color: white;
}

.category-hero.music {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
}

.category-hero.life {
  background: linear-gradient(135deg, #26de81, #20bf6b);
  color: white;
}

.category-icon {
  font-size: 80px;
  flex-shrink: 0;
}

.category-title {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 15px;
}

.category-description {
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 20px;
  opacity: 0.9;
}

.category-stats {
  display: flex;
  gap: 20px;
  font-size: 14px;
  opacity: 0.8;
}

.filter-section {
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px 0;
  border-bottom: 2px solid #f0f0f0;
  margin-bottom: 40px;
  flex-wrap: wrap;
  gap: 20px;
}

.filter-controls {
  display: flex;
  gap: 30px;
  align-items: center;
}

.sort-controls select {
  padding: 8px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  font-size: 14px;
}

.view-controls {
  display: flex;
  gap: 10px;
}

.view-btn {
  padding: 8px 15px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.view-btn.active {
  background: #4a90e2;
  color: white;
  border-color: #4a90e2;
}

.search-box {
  display: flex;
  max-width: 300px;
  width: 100%;
}

.search-box input {
  flex: 1;
  padding: 10px 15px;
  border: 2px solid #e0e0e0;
  border-right: none;
  border-radius: 8px 0 0 8px;
  outline: none;
}

.search-btn {
  padding: 10px 15px;
  background: #4a90e2;
  color: white;
  border: 2px solid #4a90e2;
  border-radius: 0 8px 8px 0;
  cursor: pointer;
}

.articles-section {
  grid-column: 1;
}

.no-articles {
  text-align: center;
  padding: 60px 20px;
  color: #666;
  font-size: 16px;
}

.articles-container.grid-view {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
}

.articles-container.list-view {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.article-card {
  background: #ffffff;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.article-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.15);
}

.list-view .article-card {
  display: flex;
  height: 200px;
}

.list-view .article-image {
  flex: 0 0 250px;
  height: 100%;
}

.list-view .article-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.article-link {
  display: block;
  text-decoration: none;
  color: inherit;
  height: 100%;
}

.article-image {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: linear-gradient(135deg, #74b9ff, #0984e3);
}

.article-image.tech {
  background: linear-gradient(135deg, #4a90e2, #357abd);
}

.article-image.music {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
}

.article-image.life {
  background: linear-gradient(135deg, #26de81, #20bf6b);
}

.image-placeholder {
  font-size: 48px;
  color: white;
}

.read-time {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(0,0,0,0.7);
  color: white;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 12px;
}

.article-content {
  padding: 25px;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
}

.publish-date {
  font-size: 14px;
  color: #666;
}

.article-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  background: #f0f0f0;
  color: #666;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.article-title {
  font-size: 20px;
  font-weight: bold;
  color: #000;
  margin-bottom: 12px;
  line-height: 1.4;
}

.article-excerpt {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.article-stats {
  display: flex;
  gap: 15px;
  font-size: 13px;
  color: #999;
}

.read-more {
  color: #4a90e2;
  font-size: 14px;
  font-weight: 500;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 60px;
  padding: 30px 0;
}

.page-btn, .page-number {
  padding: 10px 15px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-number.active {
  background: #4a90e2;
  color: white;
  border-color: #4a90e2;
}

.page-numbers {
  display: flex;
  gap: 5px;
}

.category-sidebar {
  grid-column: 2;
  position: sticky;
  top: 20px;
  height: fit-content;
}

.widget {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 15px;
  margin-bottom: 30px;
}

.widget h3 {
  font-size: 18px;
  font-weight: bold;
  color: #000;
  margin-bottom: 20px;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag-item {
  background: #4a90e2;
  color: white;
  padding: 6px 12px;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tag-item:hover {
  background: #357abd;
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.recent-item a {
  display: block;
  text-decoration: none;
  color: inherit;
  padding: 15px;
  background: white;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.recent-item a:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.recent-category {
  font-size: 12px;
  color: #4a90e2;
  font-weight: bold;
  margin-bottom: 5px;
}

.recent-item h4 {
  font-size: 14px;
  font-weight: bold;
  color: #000;
  margin-bottom: 8px;
  line-height: 1.4;
}

.recent-item time {
  font-size: 12px;
  color: #666;
}

.newsletter p {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
  line-height: 1.6;
}

.newsletter-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.newsletter-form input {
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  outline: none;
}

.newsletter-form button {
  padding: 12px 20px;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.newsletter-form button:hover {
  background: #357abd;
}

.nav-menu .active {
  color: #4a90e2;
  font-weight: bold;
}

@media (max-width: 1200px) {
  .category-container {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  
  .category-sidebar {
    grid-column: 1;
    position: static;
  }
}

@media (max-width: 768px) {
  .category-hero {
    flex-direction: column;
    text-align: center;
    padding: 30px 20px;
  }
  
  .category-title {
    font-size: 36px;
  }
  
  .filter-section {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
  
  .filter-controls {
    flex-direction: column;
    gap: 15px;
  }
  
  .articles-container.grid-view {
    grid-template-columns: 1fr;
  }
  
  .articles-container.list-view .article-card {
    flex-direction: column;
    height: auto;
  }
  
  .list-view .article-image {
    flex: none;
    height: 200px;
  }
  
  .pagination {
    flex-wrap: wrap;
  }
}
</style>