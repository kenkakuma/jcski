<template>
  <NuxtLayout name="admin">
    <!-- Debug Info -->
    <div class="debug-info" style="background: #f0f0f0; padding: 10px; margin-bottom: 10px; border-radius: 4px; font-family: monospace; font-size: 12px;">
      <strong>🔍 Debug Info:</strong> Current Tab = "{{ activeTab }}" | Injected Tab = "{{ currentTab }}" | Raw Value = "{{ currentTab.value }}"<br>
      <strong>📊 Visible Sections:</strong> 
      Dashboard: {{ activeTab === 'dashboard' }}, 
      Posts: {{ activeTab === 'posts' }}, 
      Hero: {{ activeTab === 'hero' }}, 
      Media: {{ activeTab === 'media' }}, 
      Settings: {{ activeTab === 'settings' }}, 
      Calendar: {{ activeTab === 'calendar' }}, 
      Analytics: {{ activeTab === 'analytics' }}<br>
      <strong>🎯 Active Component Check:</strong> {{ activeTab }}<br>
      <button @click="testTabChange" style="margin-top: 5px; padding: 5px;">Test Tab Change to Posts</button>
    </div>
    
    <div class="dashboard-overview-wrapper">
        <!-- Dashboard Overview -->
        <div v-if="activeTab === 'dashboard'" class="dashboard-overview">
          <!-- 加载状态 -->
          <div v-if="loading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>正在加载仪表板数据...</p>
          </div>
          
          <!-- 错误状态 -->
          <div v-else-if="error" class="error-state">
            <div class="error-icon">⚠️</div>
            <h3>数据加载失败</h3>
            <p>{{ error.message || '未知错误' }}</p>
            <button @click="fetchDashboardStats" class="retry-btn">重试</button>
          </div>
          
          <!-- 正常数据显示 -->
          <div v-else>
            <!-- 统计卡片 -->
            <div class="stats-grid">
              <div class="stat-card primary">
                <div class="stat-header">
                  <h3>文章总数</h3>
                  <span class="stat-icon">📝</span>
                </div>
                <div class="stat-number">{{ stats.totalPosts.toLocaleString() }}</div>
                <div class="stat-detail">
                  <span class="stat-change positive" v-if="dashboardData?.stats.newPostsThisMonth > 0">
                    +{{ dashboardData.stats.newPostsThisMonth }} 本月新增
                  </span>
                </div>
              </div>
              
              <div class="stat-card success">
                <div class="stat-header">
                  <h3>已发布</h3>
                  <span class="stat-icon">✅</span>
                </div>
                <div class="stat-number">{{ stats.publishedPosts.toLocaleString() }}</div>
                <div class="stat-detail">
                  <span class="stat-ratio">
                    {{ stats.totalPosts > 0 ? Math.round((stats.publishedPosts / stats.totalPosts) * 100) : 0 }}% 发布率
                  </span>
                </div>
              </div>
              
              <div class="stat-card warning">
                <div class="stat-header">
                  <h3>草稿</h3>
                  <span class="stat-icon">📄</span>
                </div>
                <div class="stat-number">{{ stats.draftPosts.toLocaleString() }}</div>
                <div class="stat-detail">
                  <span class="stat-ratio">
                    待发布内容
                  </span>
                </div>
              </div>
              
              <div class="stat-card info">
                <div class="stat-header">
                  <h3>媒体文件</h3>
                  <span class="stat-icon">🖼️</span>
                </div>
                <div class="stat-number">{{ stats.mediaFiles.toLocaleString() }}</div>
                <div class="stat-detail">
                  <span class="stat-change positive" v-if="dashboardData?.stats.newMediaThisMonth > 0">
                    +{{ dashboardData.stats.newMediaThisMonth }} 本月新增
                  </span>
                  <span v-if="dashboardData?.mediaStats.totalSize">
                    {{ formatFileSize(dashboardData.mediaStats.totalSize) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 系统健康状态 -->
            <div v-if="systemHealth" class="health-status">
              <div class="health-header">
                <h3>系统状态</h3>
                <div class="health-indicator" :class="systemHealth.status">
                  <span class="health-dot"></span>
                  {{ systemHealth.message }}
                </div>
              </div>
              <div class="health-grid">
                <div 
                  v-for="(check, key) in systemHealth.checks" 
                  :key="key"
                  class="health-item"
                  :class="check.status"
                >
                  <div class="health-item-header">
                    <span class="health-item-name">{{ getHealthCheckName(key) }}</span>
                    <span class="health-item-status" :class="check.status">
                      {{ getHealthStatusText(check.status) }}
                    </span>
                  </div>
                  <div class="health-item-message">{{ check.message }}</div>
                </div>
              </div>
            </div>

            <!-- 最近活动 -->
            <div v-if="recentActivity.length > 0" class="recent-activity">
              <div class="activity-header">
                <h3>最近活动</h3>
                <button @click="fetchDashboardStats" class="refresh-btn">🔄 刷新</button>
              </div>
              <div class="activity-list">
                <div 
                  v-for="activity in recentActivity.slice(0, 8)" 
                  :key="activity.id"
                  class="activity-item"
                  :class="activity.priority"
                >
                  <div class="activity-icon">{{ activity.icon }}</div>
                  <div class="activity-content">
                    <div class="activity-title">{{ activity.title }}</div>
                    <div class="activity-description">{{ activity.description }}</div>
                    <div class="activity-meta">
                      <span class="activity-author">{{ activity.author }}</span>
                      <span class="activity-time">{{ formatRelativeTime(activity.timestamp) }}</span>
                    </div>
                  </div>
                </div>
              </div>
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

        <!-- Analytics -->
        <div v-if="activeTab === 'analytics'" class="analytics-management">
          <div class="tab-content">
            <div class="demo-message">
              <h3>📈 数据分析中心</h3>
              <p>网站访问数据、文章表现分析等功能正在开发中</p>
              <div class="component-info">
                <p><strong>计划功能:</strong></p>
                <p>• 访问统计和趋势分析</p>
                <p>• 文章阅读量和互动数据</p>
                <p>• 用户行为分析</p>
                <p>• SEO表现监控</p>
              </div>
            </div>
          </div>
        </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
import { ref, computed, inject, onMounted, onUnmounted, watch } from 'vue'
import AdvancedPostManager from '~/components/AdvancedPostManager.vue'
import AdminHero from '~/components/AdminHero.vue'
import AdminMedia from '~/components/AdminMedia.vue'
import AdminSiteSettings from '~/components/AdminSiteSettings.vue'
import AdminCalendar from '~/components/AdminCalendar.vue'

definePageMeta({
  layout: 'admin'
})

// 管理tab状态 - 直接使用布局传递的状态
const currentTab = inject('currentTab', ref('dashboard'))
const activeTab = computed(() => currentTab.value)

// 监听布局tab变化和调试信息
onMounted(() => {
  console.log('🔍 Admin page mounted, current tab:', activeTab.value)
  
  // 监听tab变化
  watch(currentTab, (newTab, oldTab) => {
    console.log('🔄 Tab changed from', oldTab, 'to', newTab)
    console.log('📊 Active sections:', {
      dashboard: newTab === 'dashboard',
      posts: newTab === 'posts', 
      hero: newTab === 'hero',
      media: newTab === 'media',
      settings: newTab === 'settings',
      calendar: newTab === 'calendar',
      analytics: newTab === 'analytics'
    })
  }, { immediate: true })
})

// 仪表板数据状态
const stats = ref({
  totalPosts: 0,
  publishedPosts: 0,
  draftPosts: 0,
  mediaFiles: 0
})

const dashboardData = ref(null)
const recentActivity = ref([])
const systemHealth = ref(null)
const loading = ref(true)
const error = ref(null)

// 获取仪表板统计数据
const fetchDashboardStats = async () => {
  try {
    loading.value = true
    const [statsResponse, activityResponse, healthResponse] = await Promise.all([
      $fetch('/api/admin/dashboard/stats'),
      $fetch('/api/admin/dashboard/activity?limit=10'),
      $fetch('/api/admin/dashboard/health')
    ])
    
    // 更新基础统计
    stats.value = {
      totalPosts: statsResponse.stats.totalPosts,
      publishedPosts: statsResponse.stats.publishedPosts,
      draftPosts: statsResponse.stats.draftPosts,
      mediaFiles: statsResponse.stats.totalMediaFiles
    }
    
    dashboardData.value = statsResponse
    recentActivity.value = activityResponse.activities
    systemHealth.value = healthResponse
    error.value = null
    
  } catch (err) {
    console.error('获取仪表板数据失败:', err)
    error.value = err
  } finally {
    loading.value = false
  }
}

// 测试函数
const testTabChange = () => {
  console.log('🧪 Test tab change clicked')
  console.log('🧪 Before change - currentTab:', currentTab.value, 'activeTab:', activeTab.value)
  currentTab.value = 'posts'
  console.log('🧪 After change - currentTab:', currentTab.value, 'activeTab:', activeTab.value)
}

// 组件挂载时获取数据
onMounted(() => {
  fetchDashboardStats()
})

// 定时刷新数据（每2分钟）
const refreshInterval = ref(null)

onMounted(() => {
  refreshInterval.value = setInterval(() => {
    fetchDashboardStats()
  }, 2 * 60 * 1000)
})

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }
})

// 辅助函数
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatRelativeTime = (timestamp) => {
  const now = new Date()
  const date = new Date(timestamp)
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString()
}

const getHealthCheckName = (key) => {
  const names = {
    database: '数据库',
    storage: '存储空间',
    content: '内容状态',
    performance: '系统性能',
    api: 'API响应'
  }
  return names[key] || key
}

const getHealthStatusText = (status) => {
  const texts = {
    healthy: '正常',
    warning: '警告',
    error: '异常'
  }
  return texts[status] || status
}

// 页面数据管理
const getPageTitle = () => {
  const titles = {
    dashboard: '控制面板',
    posts: '文章管理',
    hero: 'Hero管理',
    settings: '网站设置',
    media: '媒体管理',
    calendar: '日程管理',
    analytics: '数据分析'
  }
  return titles[activeTab.value] || '管理后台'
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
  width: 100%;
}

.admin-content {
  width: 100%;
}

.dashboard-overview {
  max-width: 1200px;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 错误状态 */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.retry-btn {
  padding: 12px 24px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 16px;
  transition: background 0.3s ease;
}

.retry-btn:hover {
  background: #2980b9;
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
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stat-card.primary {
  border-left: 4px solid #3498db;
}

.stat-card.success {
  border-left: 4px solid #27ae60;
}

.stat-card.warning {
  border-left: 4px solid #f39c12;
}

.stat-card.info {
  border-left: 4px solid #9b59b6;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.stat-icon {
  font-size: 24px;
  opacity: 0.8;
}

.stat-card h3 {
  font-size: 14px;
  color: #666;
  margin: 0 0 8px 0;
  font-weight: 500;
}

.stat-number {
  font-size: 36px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
}

.stat-detail {
  font-size: 13px;
  color: #6c757d;
}

.stat-change.positive {
  color: #27ae60;
  font-weight: 600;
}

.stat-ratio {
  color: #6c757d;
}

/* 系统健康状态 */
.health-status {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin: 24px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
}

.health-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.health-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.health-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 20px;
}

.health-indicator.healthy {
  color: #27ae60;
  background: rgba(39, 174, 96, 0.1);
}

.health-indicator.warning {
  color: #f39c12;
  background: rgba(243, 156, 18, 0.1);
}

.health-indicator.error {
  color: #e74c3c;
  background: rgba(231, 76, 60, 0.1);
}

.health-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 2s infinite;
}

.health-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.health-item {
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.health-item.healthy {
  border-left: 4px solid #27ae60;
  background: rgba(39, 174, 96, 0.02);
}

.health-item.warning {
  border-left: 4px solid #f39c12;
  background: rgba(243, 156, 18, 0.02);
}

.health-item.error {
  border-left: 4px solid #e74c3c;
  background: rgba(231, 76, 60, 0.02);
}

.health-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.health-item-name {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.health-item-status {
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
}

.health-item-status.healthy {
  color: #27ae60;
  background: rgba(39, 174, 96, 0.1);
}

.health-item-status.warning {
  color: #f39c12;
  background: rgba(243, 156, 18, 0.1);
}

.health-item-status.error {
  color: #e74c3c;
  background: rgba(231, 76, 60, 0.1);
}

.health-item-message {
  font-size: 13px;
  color: #6c757d;
  line-height: 1.4;
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

/* 最近活动 */
.recent-activity {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin: 24px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.activity-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.refresh-btn {
  background: none;
  border: 1px solid #e9ecef;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  color: #6c757d;
  transition: all 0.3s ease;
}

.refresh-btn:hover {
  background: #f8f9fa;
  border-color: #3498db;
  color: #3498db;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #f8f9fa;
  transition: all 0.3s ease;
}

.activity-item:hover {
  background: #f8f9fa;
  border-color: #e9ecef;
}

.activity-item.high {
  border-left: 3px solid #3498db;
}

.activity-item.medium {
  border-left: 3px solid #f39c12;
}

.activity-item.low {
  border-left: 3px solid #95a5a6;
}

.activity-icon {
  font-size: 20px;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 50%;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-weight: 600;
  color: #333;
  font-size: 14px;
  margin-bottom: 4px;
}

.activity-description {
  color: #6c757d;
  font-size: 13px;
  margin-bottom: 6px;
  line-height: 1.4;
}

.activity-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #adb5bd;
}

.activity-author {
  font-weight: 500;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .health-grid {
    grid-template-columns: 1fr;
  }
  
  .activity-item {
    flex-direction: column;
    gap: 8px;
  }
  
  .activity-icon {
    align-self: flex-start;
  }
}
</style>