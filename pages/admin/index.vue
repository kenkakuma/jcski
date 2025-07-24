<template>
  <div class="admin-dashboard">
    <AdminSidebar :active-tab="activeTab" @tab-change="activeTab = $event" />
    
    <main class="admin-main">
      <header class="admin-header">
        <h1 class="page-title">{{ getPageTitle() }}</h1>
        <div class="header-actions">
          <span class="user-info">欢迎使用 JCSKI Admin</span>
          <button @click="handleLogout" class="logout-btn">退出</button>
        </div>
      </header>

      <div class="admin-content">
        <!-- Dashboard Overview -->
        <div v-if="activeTab === 'dashboard'" class="dashboard-overview">
          <div class="stats-grid">
            <div class="stat-card">
              <h3>文章总数</h3>
              <div class="stat-number">{{ stats.totalPosts }}</div>
            </div>
            <div class="stat-card">
              <h3>已发布</h3>
              <div class="stat-number">{{ stats.publishedPosts }}</div>
            </div>
            <div class="stat-card">
              <h3>草稿</h3>
              <div class="stat-number">{{ stats.draftPosts }}</div>
            </div>
            <div class="stat-card">
              <h3>媒体文件</h3>
              <div class="stat-number">{{ stats.mediaFiles }}</div>
            </div>
          </div>

          <div class="demo-notice">
            <h2>🎉 JCSKI Blog 管理后台</h2>
            <p>这是v0.0.1版本的演示界面。所有组件已开发完成，正在等待API接口集成。</p>
            
            <div class="feature-list">
              <h3>✅ 已完成功能</h3>
              <ul>
                <li>📊 控制面板 - 统计数据展示</li>
                <li>📝 文章管理 - CRUD + 富文本编辑器</li>
                <li>⚙️ 网站设置 - Hero区域 + 社交链接</li>
                <li>🖼️ 媒体管理 - 图片/音频上传</li>
                <li>📅 日历管理 - 可视化事件管理</li>
              </ul>
            </div>

            <div class="tech-info">
              <h3>🔧 技术架构</h3>
              <ul>
                <li>Nuxt 3 + TypeScript</li>
                <li>Prisma ORM + SQLite</li>
                <li>JWT 认证系统</li>
                <li>Vue 3 组合式API</li>
                <li>响应式设计</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Posts Management -->
        <div v-if="activeTab === 'posts'" class="posts-management">
          <AdvancedPostManager />
        </div>

        <!-- Hero Management -->
        <div v-if="activeTab === 'hero'" class="hero-management">
          <AdminHero />
        </div>

        <!-- Media Management -->
        <div v-if="activeTab === 'media'" class="media-management">
          <AdminMedia />
        </div>

        <!-- Settings -->
        <div v-if="activeTab === 'settings'" class="settings-management">
          <AdminSiteSettings />
        </div>

        <!-- Calendar -->
        <div v-if="activeTab === 'calendar'" class="calendar-management">
          <AdminCalendar />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import AdvancedPostManager from '~/components/AdvancedPostManager.vue'

definePageMeta({
  layout: false
})

const activeTab = ref('dashboard')

const stats = ref({
  totalPosts: 12,
  publishedPosts: 8,
  draftPosts: 4,
  mediaFiles: 25
})

const getPageTitle = () => {
  const titles = {
    dashboard: '控制面板',
    posts: '文章管理',
    hero: 'Hero管理',
    settings: '网站设置',
    media: '媒体管理',
    calendar: '日历管理'
  }
  return titles[activeTab.value] || '管理后台'
}

const handleLogout = async () => {
  await navigateTo('/')
}

useHead({
  title: 'Admin Dashboard - JCSKI',
  meta: [
    { name: 'robots', content: 'noindex' }
  ]
})
</script>

<style scoped>
.admin-dashboard {
  display: flex;
  min-height: 100vh;
  background: #f8f9fa;
}

.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 260px;
}

.admin-header {
  background: white;
  padding: 20px 30px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-info {
  font-size: 14px;
  color: #666;
}

.logout-btn {
  padding: 8px 16px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.logout-btn:hover {
  background: #c82333;
}

.admin-content {
  flex: 1;
  padding: 30px;
}

.dashboard-overview {
  max-width: 1200px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #007bff;
}

.stat-card h3 {
  font-size: 14px;
  color: #666;
  margin: 0 0 8px 0;
  font-weight: 500;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #333;
}

.demo-notice {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 32px;
  margin-bottom: 24px;
}

.demo-notice h2 {
  color: #333;
  margin-bottom: 16px;
}

.demo-notice > p {
  color: #666;
  margin-bottom: 24px;
  font-size: 16px;
}

.feature-list, .tech-info {
  margin-bottom: 24px;
}

.feature-list h3, .tech-info h3 {
  color: #333;
  margin-bottom: 12px;
  font-size: 18px;
}

.feature-list ul, .tech-info ul {
  list-style: none;
  padding: 0;
}

.feature-list li, .tech-info li {
  padding: 8px 0;
  color: #555;
  border-bottom: 1px solid #f0f0f0;
}

.feature-list li:last-child, .tech-info li:last-child {
  border-bottom: none;
}

.tab-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 40px;
  text-align: center;
}

.demo-message h3 {
  color: #333;
  margin-bottom: 16px;
}

.demo-message p {
  color: #666;
  margin-bottom: 24px;
}

.component-info {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

.component-info p {
  margin: 8px 0;
  font-size: 14px;
  color: #555;
}

@media (max-width: 768px) {
  .admin-main {
    margin-left: 0;
  }
  
  .admin-header {
    padding: 15px 20px;
  }
  
  .admin-content {
    padding: 20px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>