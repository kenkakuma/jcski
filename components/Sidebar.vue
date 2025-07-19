<template>
  <aside class="sidebar">
    <nav class="sidebar-nav">
      <div v-for="item in navigationItems" :key="item.name" class="sidebar-item">
        <NuxtLink 
          :to="item.href"
          class="nav-link"
        >
          {{ item.name }}
        </NuxtLink>
        <p class="sidebar-description">{{ item.description }}</p>
      </div>
      
      <div class="search-section">
        <h3 class="search-title">KEYWORD</h3>
        <div class="search-container">
          <input 
            type="text" 
            placeholder="関連記事を探す"
            class="search-input"
          >
          <button class="search-button">
            検索
          </button>
        </div>
      </div>
    </nav>
  </aside>
</template>

<script setup lang="ts">
const navigationItems = [
  { name: 'THIS WEEK', href: '/', description: '今週の情報' },
  { name: 'TECH', href: '/category/tech', description: '技術記事' },
  { name: 'MUSIC', href: '/category/music', description: '音楽・エンタメ' },
  { name: 'LIFE', href: '/category/life', description: 'ライフスタイル' },
  { name: 'ABOUT', href: '/about', description: 'プロフィール' },
  { name: 'CONTACT', href: '/contact', description: 'お問い合わせ' },
  { name: 'ADMIN', href: '/admin', description: '管理画面' },
]
</script>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 73px;
  width: 256px;
  height: calc(100vh - 73px);
  background: white;
  border-right: 1px solid #e5e7eb;
  padding: 32px;
  overflow-y: auto;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.sidebar-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sidebar-description {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.search-section {
  padding-top: 32px;
}

.search-title {
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 16px;
}

.search-container {
  display: flex;
}

.search-input {
  flex: 1;
  padding: 12px;
  border: 1px solid #d1d5db;
  font-size: 14px;
  outline: none;
  border-right: none;
}

.search-input:focus {
  border-color: #666;
}

.search-button {
  padding: 12px 16px;
  background: black;
  color: white;
  border: none;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.search-button:hover {
  background: #333;
}
</style>