<template>
  <div class="jwave-page">
    <!-- Top Navigation Bar -->
    <nav class="top-nav">
      <div class="nav-container">
        <h1 class="top-logo">JCSKI BLOG</h1>
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
    
    <!-- Main Content -->
    <div class="main-container">
      <main class="main-content">
        <!-- Hero Frame Section -->
        <section class="hero-frame">
          <div class="hero-container">
            <!-- Left Navigation (40%) -->
            <div class="hero-left">
              <div class="hero-nav">
                <h2 class="hero-main-title">JCSKI</h2>
                <p class="hero-subtitle">PERSONAL BLOG <span style="color: #4CAF50; font-size: 12px;">[jcski.com 域名部署]</span></p>
                
                <nav class="hero-menu">
                  <a href="/music" class="hero-menu-item" :class="{ active: activeHero?.type === 'music' }" @mouseenter="handleMenuHover('music')" @mouseleave="handleMenuLeave">
                    <span class="menu-title">MUSIC<span class="menu-subtitle-inline">音楽</span></span>
                  </a>
                  <a href="/skiing" class="hero-menu-item" :class="{ active: activeHero?.type === 'skiing' }" @mouseenter="handleMenuHover('skiing')" @mouseleave="handleMenuLeave">
                    <span class="menu-title">SKIING<span class="menu-subtitle-inline">スキー</span></span>
                  </a>
                  <a href="/tech" class="hero-menu-item" :class="{ active: activeHero?.type === 'tech' }" @mouseenter="handleMenuHover('tech')" @mouseleave="handleMenuLeave">
                    <span class="menu-title">TECH<span class="menu-subtitle-inline">テクノロジー</span></span>
                  </a>
                  <a href="/fishing" class="hero-menu-item" :class="{ active: activeHero?.type === 'fishing' }" @mouseenter="handleMenuHover('fishing')" @mouseleave="handleMenuLeave">
                    <span class="menu-title">FISHING<span class="menu-subtitle-inline">釣り</span></span>
                  </a>
                  <a href="/about" class="hero-menu-item" :class="{ active: activeHero?.type === 'about' }" @mouseenter="handleMenuHover('about')" @mouseleave="handleMenuLeave">
                    <span class="menu-title">ABOUT<span class="menu-subtitle-inline">プロフィール</span></span>
                  </a>
                </nav>
                
                <div class="hero-search">
                  <input type="text" class="hero-search-input" placeholder="Search...">
                  <button class="hero-search-btn">🔍</button>
                </div>
              </div>
            </div>
            
            <!-- Right Image Area (60%) -->
            <div class="hero-right">
              <div class="hero-image-container">
                <div class="hero-image" :class="{ 'fade-transition': isChanging }">
                  <div class="sky-background">
                    <div class="sun"></div>
                    <div class="cloud cloud-1"></div>
                    <div class="cloud cloud-2"></div>
                    <div class="cloud cloud-3"></div>
                  </div>
                  <div class="hero-content" :class="{ 'fade-transition': isChanging }">
                    <h2 class="hero-title">{{ activeHero?.title || '熱中症予防' }}</h2>
                    <h3 class="hero-subtitle-text">{{ activeHero?.subtitle || 'ワンポイントアドバイス' }}</h3>
                    <div class="hero-label">JCSKI BLOG</div>
                  </div>
                  <div class="info-tag">INFO</div>
                </div>
                <div class="hero-info" :class="{ 'fade-transition': isChanging }">
                  <p class="info-text">{{ activeHero?.title || '熱中症にご注意ください' }}</p>
                  <div class="info-details">
                    <p>{{ activeHero?.description || 'JCSKIでは、熱中症を予防するワンポイントアドバイスをまとめました。熱中症は生命にかかわります。ここで読んだ皆さん、熱中症にならないようにお気をつけください。' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <!-- News Section -->
        <section class="news-section">
          <div class="section-header">
            <h2 class="section-title">JCSKI NEWS</h2>
            <p class="section-subtitle">置頂記事・特別企画の情報</p>
            <a href="#" class="view-all">VIEW ALL →</a>
          </div>
          
          <div class="news-grid-six">
            <article v-for="(post, index) in pinnedPosts.slice(0, 6)" :key="post.id" class="news-program-card">
              <a :href="`/posts/${post.slug}`" class="news-card-link">
                <div class="program-image">
                  <OptimizedImage 
                    :src="post.featuredImage || getDefaultImage(post.category)" 
                    :alt="post.title" 
                    class="program-img"
                    height="200px"
                    :placeholder="true"
                  />
                  <div class="program-status-bar"></div>
                </div>
                <div class="program-info">
                  <div class="program-meta">
                    <span class="program-date">{{ formatDate(post.createdAt) }} ON AIR</span>
                    <span class="program-status">{{ post.category }}</span>
                  </div>
                  <h3 class="program-title">📌 {{ post.title }}</h3>
                  <p class="program-description">
                    {{ post.excerpt }}
                  </p>
                </div>
              </a>
            </article>
            
            <!-- 如果置顶文章数量不足6篇，用占位符填充 -->
            <article v-for="i in Math.max(0, 6 - pinnedPosts.length)" :key="`placeholder-${i}`" class="news-program-card placeholder">
              <div class="program-image">
                <LazyImage 
                  src="/images/news.jpg" 
                  alt="Coming Soon" 
                  class="program-img"
                  height="200px"
                  :placeholder="true"
                />
                <div class="program-status-bar"></div>
              </div>
              <div class="program-info">
                <div class="program-meta">
                  <span class="program-date">COMING SOON</span>
                  <span class="program-status">NEWS</span>
                </div>
                <h3 class="program-title">更多置顶内容</h3>
                <p class="program-description">
                  将文章设为置顶后，会显示在这个区域。敬请期待更多精彩内容！
                </p>
              </div>
            </article>

          </div>
        </section>
        
        
        <!-- Press Release Section -->
        <section class="press-section">
          <div class="section-header">
            <h2 class="section-title">JCSKI PRESS RELEASE</h2>
            <p class="section-subtitle">最新記事・プレスリリース (時系列順)</p>
            <a href="#" class="view-all">VIEW ALL →</a>
          </div>
          
          <div class="press-list">
            <article 
              v-for="post in recentPosts" 
              :key="post.id"
              class="press-item"
            >
              <span class="press-marker">+</span>
              <div class="press-content">
                <a :href="`/posts/${post.slug}`" class="press-link">
                  <div class="press-title-row">
                    <h3 class="press-title">{{ post.title }}</h3>
                    <span class="press-category-tag" :class="getCategoryClass(post.category)">{{ post.category }}</span>
                  </div>
                  <p class="press-details">{{ post.excerpt }}</p>
                  <time class="press-date">{{ formatDate(post.createdAt) }}</time>
                </a>
              </div>
            </article>
          </div>
        </section>
      </main>
    </div>
    
    <!-- Black Footer -->
    <footer class="main-footer">
      <div class="footer-content">
        <div class="footer-brand">
          <h3 class="footer-logo">JCSKI BLOG</h3>
          <div class="footer-social">
            <span class="follow-text">FOLLOW US</span>
            <div class="social-links">
              <a href="#" class="footer-social-link">◯</a>
              <a href="#" class="footer-social-link">f</a>
              <a href="#" class="footer-social-link">✕</a>
              <a href="#" class="footer-social-link">@</a>
              <a href="#" class="footer-social-link">•</a>
            </div>
          </div>
        </div>
        
        <div class="footer-links">
          <div class="footer-column">
            <h4 class="footer-title">OUTLINE</h4>
            <ul class="footer-menu">
              <li><a href="#" class="footer-link">ABOUT JCSKIについて（会社概要）</a></li>
              <li><a href="#" class="footer-link">プライバシーポリシー</a></li>
              <li><a href="#" class="footer-link">利用規約</a></li>
            </ul>
          </div>
          
          <div class="footer-column">
            <h4 class="footer-title">CONTENTS</h4>
            <ul class="footer-menu">
              <li><a href="#" class="footer-link">PODCASTS</a></li>
              <li><a href="#" class="footer-link">最新の投稿記事</a></li>
              <li><a href="#" class="footer-link">HEART TO HEART</a></li>
            </ul>
          </div>
          
          <div class="footer-column">
            <h4 class="footer-title">LINK</h4>
            <ul class="footer-menu">
              <li><a href="#" class="footer-link">放送内容基準</a></li>
              <li><a href="#" class="footer-link">番組基準対策（音量）</a></li>
              <li><a href="#" class="footer-link">お問い合わせ</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { HeroContent, BlogPost } from '~/types'

// 响应式数据
const heroContents = ref<HeroContent[]>([])
const activeHero = ref<HeroContent | null>(null)
const pinnedPosts = ref<BlogPost[]>([]) // JCSKI NEWS 置顶文章
const recentPosts = ref<BlogPost[]>([]) // PRESS RELEASE 最新文章
const loading = ref(true)
const isChanging = ref(false)
let changeTimeout: NodeJS.Timeout | null = null

// 默认内容（作为fallback）
const defaultHero = {
  id: 0,
  type: 'default',
  title: '熱中症予防',
  subtitle: 'ワンポイントアドバイス',
  description: 'JCSKIでは、熱中症を予防するワンポイントアドバイスをまとめました。熱中症は生命にかかわります。ここで読んだ皆さん、熱中症にならないようにお気をつけください。',
  image: null,
  active: true,
  order: 0,
  createdAt: new Date(),
  updatedAt: new Date()
}

// 获取Hero内容
const fetchHeroContents = async () => {
  try {
    const response = await $fetch('/api/hero')
    if (response.success) {
      heroContents.value = response.data
      // 设置默认激活的hero（第一个或默认内容）
      activeHero.value = heroContents.value[0] || defaultHero
    }
  } catch (error) {
    console.error('获取Hero内容失败:', error)
    activeHero.value = defaultHero
  } finally {
    loading.value = false
  }
}

// 获取置顶文章 (JCSKI NEWS)
const fetchPinnedPosts = async () => {
  try {
    const response = await $fetch('/api/posts?pinned=true&published=true&limit=6')
    if (response.posts) {
      pinnedPosts.value = response.posts
    }
  } catch (error) {
    console.error('获取置顶文章失败:', error)
  }
}

// 获取最新博客文章 (PRESS RELEASE)
const fetchRecentPosts = async () => {
  try {
    const response = await $fetch('/api/posts?published=true&limit=10')
    if (response.posts) {
      recentPosts.value = response.posts
    }
  } catch (error) {
    console.error('获取文章列表失败:', error)
  }
}

// 日期格式化函数
const formatDate = (date: Date | string) => {
  const d = new Date(date)
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '.')
}

// 鼠标悬停事件
const handleMenuHover = (menuType: string) => {
  const hero = heroContents.value.find(h => h.type === menuType)
  if (hero && hero.id !== activeHero.value?.id) {
    // 清除之前的定时器，防止重复触发
    if (changeTimeout) {
      clearTimeout(changeTimeout)
    }
    
    // 触发渐出效果
    isChanging.value = true
    
    // 短暂延迟后更新内容并触发渐入效果
    changeTimeout = setTimeout(() => {
      activeHero.value = hero
      // 再次延迟让渐入效果更自然
      setTimeout(() => {
        isChanging.value = false
      }, 50)
    }, 120)
  }
}

// 鼠标离开事件（可选：恢复默认内容）
const handleMenuLeave = () => {
  // 可以选择恢复到默认内容或保持当前内容
  // activeHero.value = heroContents.value[0] || defaultHero
}

// 获取分类标签的CSS类（现在所有分类使用统一样式）
const getCategoryClass = (category: string) => {
  return 'category-unified'
}

// 根据分类获取默认图片
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

onMounted(() => {
  fetchHeroContents()
  fetchPinnedPosts()
  fetchRecentPosts()
})

useHead({
  title: 'JCSKI BLOG - jcski.com 正式部署 v0.4.1',
  meta: [
    { name: 'description', content: 'JCSKI personal blog featuring technology, music, and creative content in J-WAVE style.' }
  ]
})
</script>

<style scoped>
/* Main Page Layout */
.jwave-page {
  font-family: 'Noto Sans SC', 'Noto Sans JP', 'Noto Sans', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background: #fff;
}

/* Top Navigation */
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
  margin: 0;
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

/* Main Container */
.main-container {
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Main Content */
.main-content {
  width: 100%;
}

/* Hero Frame Section */
.hero-frame {
  margin-top: 40px;
  margin-bottom: 40px;
}

.hero-container {
  display: flex;
  min-height: 672px;
  background: #fff;
  gap: 80px;
}

/* Left Navigation (35%) */
.hero-left {
  width: 35%;
  padding: 60px 40px 60px 20px;
  background: #fff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.hero-nav {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.hero-main-title {
  font-family: "Special Gothic Expanded One", sans-serif;
  font-weight: 400;
  font-style: normal;
  font-size: 56px;
  letter-spacing: 4px;
  color: #000;
  margin: 0 0 12px 0;
}

.hero-subtitle {
  font-size: 16px;
  color: #666;
  margin: 0 0 40px 0;
  letter-spacing: 1px;
}

.hero-menu {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 40px;
  align-items: flex-start;
}

.hero-menu-item {
  display: inline-block;
  color: #000;
  text-decoration: none;
  padding: 4px 0;
  position: relative;
  overflow: hidden;
}

.hero-menu-item::before {
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

.hero-menu-item:hover::before,
.hero-menu-item.active::before {
  left: 0;
}

.hero-menu-item:hover .menu-title,
.hero-menu-item.active .menu-title {
  color: #fff;
}

.hero-menu-item:hover .menu-subtitle-inline,
.hero-menu-item.active .menu-subtitle-inline {
  color: #fff;
}

.menu-title {
  font-family: "Special Gothic Expanded One", sans-serif;
  font-weight: 400;
  font-style: normal;
  display: block;
  font-size: 48px;
  letter-spacing: 2px;
  color: #000;
  line-height: 0.9;
  transition: color 0.4s ease;
  position: relative;
  z-index: 2;
  white-space: nowrap;
}

.menu-subtitle-inline {
  font-family: 'Noto Sans JP', sans-serif;
  font-size: 24px;
  font-weight: 400;
  color: #666;
  letter-spacing: 0.5px;
  transition: color 0.4s ease;
  position: relative;
  z-index: 2;
  white-space: nowrap;
  margin-left: 12px;
}

.hero-search {
  margin-top: auto;
  display: flex;
  border: 2px solid #000;
  width: 300px;
  height: 40px;
}

.hero-search-input {
  flex: 1;
  padding: 0 12px;
  border: none;
  outline: none;
  font-size: 14px;
  height: 100%;
}

.hero-search-btn {
  background: #000;
  color: #fff;
  border: none;
  padding: 0 15px;
  cursor: pointer;
  font-size: 16px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Right Image Area (65%) */
.hero-right {
  width: 65%;
  display: flex;
  flex-direction: column;
}

.hero-image-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 36px 12px 36px 0;
}

.hero-image {
  position: relative;
  background: linear-gradient(to bottom, #87CEEB 0%, #E0F6FF 100%);
  overflow: hidden;
  width: 700px;
  height: 500px;
  margin: 30px 0 0 0;
  border-radius: 8px;
}

.sky-background {
  position: absolute;
  inset: 0;
}

.sun {
  position: absolute;
  top: 20px;
  right: 40px;
  width: 50px;
  height: 50px;
  background: #FFD700;
  border-radius: 50%;
}

.cloud {
  position: absolute;
  background: #fff;
  border-radius: 25px;
  opacity: 0.8;
}

.cloud-1 {
  top: 30px;
  left: 20%;
  width: 60px;
  height: 30px;
}

.cloud-2 {
  top: 50px;
  right: 30%;
  width: 50px;
  height: 25px;
}

.cloud-3 {
  top: 20px;
  left: 50%;
  width: 40px;
  height: 20px;
}

.hero-content {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  text-align: center;
}

.hero-title {
  font-family: "Special Gothic Expanded One", sans-serif;
  font-weight: 400;
  font-style: normal;
  font-size: 36px;
  color: #000;
  margin: 0;
  transition: all 0.3s ease;
}

.hero-subtitle-text {
  font-size: 24px;
  color: #333;
  margin: 8px 0;
  transition: all 0.3s ease;
}

.hero-label {
  background: #000;
  color: #fff;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 700;
}

.info-tag {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 700;
  z-index: 20;
}

.hero-info {
  background: rgba(0, 0, 0, 0.9);
  color: #fff;
  padding: 19px;
  min-height: 144px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 600px;
  margin-left: 110px;
  margin-top: -36px;
  position: relative;
  z-index: 10;
}

.info-text {
  font-weight: 700;
  margin: 0 0 8px 0;
  transition: all 0.3s ease;
  font-size: 16px;
}

.info-details {
  font-size: 14px;
  color: #ccc;
  transition: all 0.3s ease;
}

.info-details p {
  margin: 0;
  line-height: 1.5;
  transition: all 0.3s ease;
}

/* Fade Transition Effects */
.fade-transition {
  opacity: 0.4;
  transform: translateY(8px);
}

.hero-content,
.hero-info {
  transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hero Image Background Transition */
.hero-image {
  transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), filter 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.hero-image.fade-transition {
  filter: blur(1px);
}

/* News Section */
.news-section {
  margin-bottom: 60px;
  max-width: 1300px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;
  padding-bottom: 8px;
  border-bottom: 2px solid #000;
}

.section-title {
  font-family: "Special Gothic Expanded One", sans-serif;
  font-weight: 400;
  font-style: normal;
  font-size: 24px;
  margin: 0;
}

.section-subtitle {
  font-size: 12px;
  color: #666;
  margin: 4px 0 0 0;
}

.view-all {
  color: #000;
  text-decoration: none;
  font-size: 12px;
  font-weight: 700;
}

/* PROGRAM六卡片布局 */
.news-grid-six {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 24px;
  min-height: 800px;
}

/* 节目卡片样式 */
.news-program-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.news-program-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.news-card-link {
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.news-program-card.placeholder {
  opacity: 0.6;
}

.news-program-card.placeholder .program-title,
.news-program-card.placeholder .program-description {
  color: #999;
}

/* 图片区域 */
.program-image {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.program-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.program-status-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: #e74c3c;
}

/* 节目信息区域 */
.program-info {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.program-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.program-date {
  color: #666;
  font-size: 14px;
  font-weight: 400;
}

.program-status {
  background: #e74c3c;
  color: #fff;
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.program-title {
  font-family: "Special Gothic Expanded One", sans-serif;
  font-weight: 400;
  font-style: normal;
  font-size: 20px;
  color: #000;
  margin: 0 0 12px 0;
  line-height: 1.3;
  letter-spacing: 0.5px;
}

.program-description {
  color: #333;
  font-size: 15px;
  line-height: 1.5;
  margin: 0;
  flex: 1;
}



/* Press Release Section */
.press-section {
  margin-bottom: 60px;
  max-width: 1300px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 20px;
}

.press-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.press-item {
  display: flex;
  gap: 16px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
  transition: all 0.3s ease;
}

.press-item:hover {
  background: #f9f9f9;
  padding-left: 8px;
  margin-left: -8px;
  border-radius: 4px;
}

.press-marker {
  font-size: 16px;
  font-weight: 700;
  color: #000;
  margin-top: 2px;
}

.press-content {
  flex: 1;
}

.press-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.press-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.press-title {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.4;
  margin: 0;
  flex: 1;
}

.press-category-tag {
  background: #000;
  color: #fff;
  padding: 3px 8px;
  border-radius: 3px;
  font-family: "Special Gothic Expanded One", sans-serif;
  font-size: 12px;
  font-weight: 400;
  font-style: normal;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.press-details {
  font-size: 14px;
  color: #666;
  margin: 0 0 8px 0;
  line-height: 1.5;
}

.press-date {
  font-size: 13px;
  color: #999;
}

/* Footer */
.main-footer {
  background: #000;
  color: #fff;
  padding: 40px 0 20px;
}

.footer-content {
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-brand {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 1px solid #333;
}

.footer-logo {
  font-family: "Special Gothic Expanded One", sans-serif;
  font-weight: 400;
  font-style: normal;
  font-size: 20px;
  margin: 0;
}

.footer-social {
  display: flex;
  align-items: center;
  gap: 16px;
}

.follow-text {
  font-size: 12px;
  color: #999;
}

.social-links {
  display: flex;
  gap: 12px;
}

.footer-social-link {
  color: #999;
  text-decoration: none;
  font-size: 14px;
}

.footer-social-link:hover {
  color: #fff;
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
}

.footer-title {
  font-family: "Special Gothic Expanded One", sans-serif;
  font-weight: 400;
  font-style: normal;
  font-size: 14px;
  margin: 0 0 16px 0;
}

.footer-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-menu li {
  margin-bottom: 8px;
}

.footer-link {
  color: #ccc;
  text-decoration: none;
  font-size: 12px;
  line-height: 1.5;
}

.footer-link:hover {
  color: #fff;
}

/* Responsive */
@media (max-width: 768px) {
  .top-nav {
    padding: 16px 0;
  }
  
  .top-nav-menu {
    gap: 12px;
  }
  
  .top-nav-item {
    padding: 6px 12px;
  }
  
  .nav-title {
    font-size: 12px;
    letter-spacing: 0.5px;
  }
  
  .nav-subtitle {
    font-size: 9px;
  }
  
  .main-container {
    padding: 0 15px;
  }
  
  /* Hero Frame Responsive */
  .hero-container {
    flex-direction: column;
    min-height: auto;
    gap: 30px;
  }
  
  .hero-left {
    width: 100%;
    padding: 30px 20px;
    border-right: none;
    border-bottom: 1px solid #ddd;
  }
  
  .hero-right {
    width: 100%;
  }
  
  .hero-main-title {
    font-size: 42px;
    letter-spacing: 2px;
  }
  
  .hero-menu {
    gap: 12px;
  }
  
  .hero-menu-item {
    padding: 3px 0;
  }
  
  .menu-title {
    font-size: 38px;
    letter-spacing: 1.5px;
    line-height: 0.9;
  }
  
  .menu-subtitle-inline {
    font-size: 18px;
    margin-left: 10px;
  }
  
  .hero-image {
    width: 500px;
    height: 360px;
    margin: 20px 0 0 0;
  }
  
  .hero-title {
    font-size: 28px;
  }
  
  .hero-subtitle-text {
    font-size: 18px;
  }
  
  .news-grid-six {
    grid-template-columns: 1fr;
    grid-template-rows: none;
    gap: 20px;
    min-height: auto;
  }
  
  .program-image {
    height: 160px;
  }
  
  .program-title {
    font-size: 18px;
  }
  
  .program-description {
    font-size: 14px;
  }
  
  
  .footer-links {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

@media (max-width: 480px) {
  .top-nav {
    padding: 12px 0;
  }
  
  .top-nav-menu {
    gap: 8px;
  }
  
  .top-nav-item {
    padding: 4px 8px;
  }
  
  .nav-title {
    font-size: 10px;
    letter-spacing: 0.3px;
  }
  
  .nav-subtitle {
    font-size: 8px;
  }
  
  .hero-main-title {
    font-size: 32px;
    letter-spacing: 1px;
  }
  
  .hero-menu {
    gap: 10px;
  }
  
  .hero-menu-item {
    padding: 2px 0;
  }
  
  .menu-title {
    font-size: 28px;
    letter-spacing: 0.8px;
    line-height: 0.9;
  }
  
  .menu-subtitle-inline {
    font-size: 14px;
    margin-left: 8px;
  }
  
  .hero-image {
    width: 350px;
    height: 250px;
    margin: 15px 0 0 0;
  }
  
  .hero-image-container {
    padding: 20px 12px 20px 0;
  }
  
  .hero-title {
    font-size: 24px;
  }
  
  .hero-subtitle-text {
    font-size: 16px;
  }
  
  .news-grid-six {
    grid-template-columns: 1fr;
    grid-template-rows: none;
    gap: 16px;
  }
  
  .program-image {
    height: 140px;
  }
  
  .program-title {
    font-size: 16px;
  }
  
  .program-description {
    font-size: 13px;
  }
  
  .program-info {
    padding: 16px;
  }
  
}
</style>