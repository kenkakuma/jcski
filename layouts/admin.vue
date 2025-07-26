<template>
  <div class="admin-layout">
    <!-- 管理侧边栏 -->
    <AdminSidebar :active-tab="currentTab" @tab-change="handleTabChange" />
    
    <!-- 主要内容区域 -->
    <main class="admin-main" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      
      <!-- 顶部导航栏 -->
      <header class="admin-header">
        <div class="header-left">
          <!-- 面包屑导航 -->
          <nav class="breadcrumb-nav">
            <ol class="breadcrumb">
              <li class="breadcrumb-item">
                <NuxtLink to="/admin" class="breadcrumb-link">
                  <span class="breadcrumb-icon">🏠</span>
                  管理后台
                </NuxtLink>
              </li>
              <li v-if="currentPageTitle" class="breadcrumb-item active">
                <span class="breadcrumb-icon">{{ currentPageIcon }}</span>
                {{ currentPageTitle }}
              </li>
            </ol>
          </nav>
        </div>

        <div class="header-right">
          <!-- 通知中心 -->
          <div class="notification-center">
            <button 
              @click="showNotifications = !showNotifications" 
              class="notification-btn"
              :class="{ active: showNotifications }"
            >
              <span class="notification-icon">🔔</span>
              <span v-if="notificationCount > 0" class="notification-badge">{{ notificationCount }}</span>
            </button>
            
            <!-- 通知下拉面板 -->
            <div v-if="showNotifications" class="notification-panel">
              <div class="notification-header">
                <h3>通知中心</h3>
                <button @click="markAllAsRead" class="mark-read-btn">全部标记为已读</button>
              </div>
              <div class="notification-list">
                <div 
                  v-for="notification in notifications" 
                  :key="notification.id"
                  class="notification-item"
                  :class="{ unread: !notification.read }"
                >
                  <div class="notification-content">
                    <div class="notification-title">{{ notification.title }}</div>
                    <div class="notification-message">{{ notification.message }}</div>
                    <div class="notification-time">{{ formatTime(notification.createdAt) }}</div>
                  </div>
                  <button @click="markAsRead(notification.id)" class="notification-close">×</button>
                </div>
                <div v-if="notifications.length === 0" class="empty-notifications">
                  <span class="empty-icon">📭</span>
                  <p>暂无通知</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 快捷操作 -->
          <div class="quick-actions">
            <button @click="quickCreatePost" class="quick-action-btn" title="快速创建文章">
              <span>📝</span>
            </button>
            <button @click="quickUploadMedia" class="quick-action-btn" title="快速上传媒体">
              <span>🖼️</span>
            </button>
            <button @click="showUserMenu = !showUserMenu" class="user-menu-btn">
              <div class="user-avatar">
                <span>👤</span>
              </div>
              <span class="user-name">管理员</span>
              <span class="dropdown-arrow">{{ showUserMenu ? '▲' : '▼' }}</span>
            </button>

            <!-- 用户菜单下拉 -->
            <div v-if="showUserMenu" class="user-menu-panel">
              <div class="user-info">
                <div class="user-avatar large">👤</div>
                <div class="user-details">
                  <p class="user-name">管理员</p>
                  <p class="user-email">admin@jcski.com</p>
                </div>
              </div>
              <hr class="menu-divider">
              <ul class="menu-list">
                <li><a href="#" class="menu-item">个人设置</a></li>
                <li><a href="#" class="menu-item">修改密码</a></li>
                <li><a href="#" class="menu-item">系统设置</a></li>
                <hr class="menu-divider">
                <li><a @click="handleLogout" class="menu-item logout">退出登录</a></li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      <!-- 内容区域 -->
      <div class="admin-content">
        <slot />
      </div>

      <!-- 页脚 -->
      <footer class="admin-footer">
        <div class="footer-content">
          <div class="footer-left">
            <span class="footer-text">JCSKI Blog Admin v2.0</span>
            <span class="footer-separator">|</span>
            <span class="footer-text">© 2025 JCSKI</span>
          </div>
          <div class="footer-right">
            <span class="footer-status">
              <span class="status-dot online"></span>
              系统运行正常
            </span>
          </div>
        </div>
      </footer>
    </main>
  </div>
</template>

<script setup>
import { nextTick, ref, computed, provide, inject, onMounted, onUnmounted } from 'vue'

// 页面元数据
useHead({
  title: 'JCSKI Admin - 管理后台',
  meta: [
    { name: 'robots', content: 'noindex' }
  ]
})

// 响应式数据
const currentTab = ref('dashboard')
const sidebarCollapsed = ref(false)
const showNotifications = ref(false)
const showUserMenu = ref(false)

// 通知数据
const notifications = ref([
  {
    id: 1,
    title: '系统升级',
    message: '管理后台已升级至v2.0版本，新增多项功能',
    createdAt: new Date(),
    read: false
  },
  {
    id: 2,
    title: '新文章发布',
    message: '《JCSKI设计语言》文章已成功发布',
    createdAt: new Date(Date.now() - 3600000),
    read: false
  }
])

// 计算属性
const notificationCount = computed(() => {
  return notifications.value.filter(n => !n.read).length
})

const currentPageTitle = computed(() => {
  const titles = {
    dashboard: '控制面板',
    posts: '文章管理',
    hero: 'Hero管理',
    settings: '网站设置',
    media: '媒体管理',
    calendar: '日程管理',
    analytics: '数据分析'
  }
  return titles[currentTab.value] || ''
})

const currentPageIcon = computed(() => {
  const icons = {
    dashboard: '📊',
    posts: '📝',
    hero: '🎯',
    settings: '⚙️',
    media: '🖼️',
    calendar: '📅',
    analytics: '📈'
  }
  return icons[currentTab.value] || '📄'
})

// Provide current tab to child components  
provide('currentTab', currentTab)
provide('setCurrentTab', (tab) => {
  console.log('🔄 setCurrentTab called:', tab)
  console.log('🔄 Before setCurrentTab - currentTab.value:', currentTab.value)
  currentTab.value = tab
  console.log('🔄 After setCurrentTab - currentTab.value:', currentTab.value)
})

// 方法
const handleTabChange = async (tab) => {
  console.log('🚨 Layout handleTabChange called:', tab) // 调试日志
  console.log('🚨 Before change - currentTab.value:', currentTab.value)
  console.log('🚨 Before change - currentTab type:', typeof currentTab.value)
  currentTab.value = tab
  showNotifications.value = false
  showUserMenu.value = false
  
  // 确保DOM和状态同步
  await nextTick()
  console.log('🚨 After change - currentTab.value:', currentTab.value)
  console.log('🚨 After change - currentTab type:', typeof currentTab.value)
  console.log('🚨 Tab change completed for:', tab)
}

const markAsRead = (notificationId) => {
  const notification = notifications.value.find(n => n.id === notificationId)
  if (notification) {
    notification.read = true
  }
}

const markAllAsRead = () => {
  notifications.value.forEach(n => n.read = true)
}

const formatTime = (date) => {
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  return date.toLocaleDateString()
}

const quickCreatePost = () => {
  currentTab.value = 'posts'
  // 触发创建文章的逻辑
  console.log('快速创建文章')
}

const quickUploadMedia = () => {
  currentTab.value = 'media'
  // 触发上传媒体的逻辑
  console.log('快速上传媒体')
}

const handleLogout = async () => {
  try {
    // 清除认证状态
    await navigateTo('/admin/login')
  } catch (error) {
    console.error('登出失败:', error)
  }
}

// 点击外部关闭下拉菜单 + 监听自定义tab变更事件
onMounted(() => {
  const handleClickOutside = (event) => {
    if (!event.target.closest('.notification-center')) {
      showNotifications.value = false
    }
    if (!event.target.closest('.user-menu-btn') && !event.target.closest('.user-menu-panel')) {
      showUserMenu.value = false
    }
  }
  
  // 监听自定义DOM事件作为备用机制
  const handleCustomTabChange = (event) => {
    console.log('📧 Custom DOM event received:', event.detail.tab)
    handleTabChange(event.detail.tab)
  }
  
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('admin-tab-change', handleCustomTabChange)
  
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
    document.removeEventListener('admin-tab-change', handleCustomTabChange)
  })
})
</script>

<style scoped>
/* 主布局 */
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f8f9fa;
}

.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 260px;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.admin-main.sidebar-collapsed {
  margin-left: 70px;
}

/* 顶部导航栏 */
.admin-header {
  background: white;
  border-bottom: 1px solid #e9ecef;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  flex: 1;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 面包屑导航 */
.breadcrumb-nav {
  font-size: 14px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 8px;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
}

.breadcrumb-link {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6c757d;
  text-decoration: none;
  transition: color 0.3s ease;
}

.breadcrumb-link:hover {
  color: #3498db;
}

.breadcrumb-item.active {
  color: #495057;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

.breadcrumb-item:not(:last-child)::after {
  content: '>';
  color: #adb5bd;
  margin-left: 8px;
  font-size: 12px;
}

.breadcrumb-icon {
  font-size: 14px;
}

/* 通知中心 */
.notification-center {
  position: relative;
}

.notification-btn {
  position: relative;
  background: none;
  border: none;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-btn:hover {
  background: #f8f9fa;
}

.notification-btn.active {
  background: #e3f2fd;
  color: #1976d2;
}

.notification-icon {
  font-size: 18px;
}

.notification-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: #dc3545;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
}

.notification-panel {
  position: absolute;
  top: 100%;
  right: 0;
  width: 350px;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  margin-top: 8px;
}

.notification-header {
  padding: 16px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notification-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #495057;
}

.mark-read-btn {
  background: none;
  border: none;
  color: #3498db;
  cursor: pointer;
  font-size: 12px;
  text-decoration: underline;
}

.notification-list {
  max-height: 300px;
  overflow-y: auto;
}

.notification-item {
  padding: 12px 16px;
  border-bottom: 1px solid #f8f9fa;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  transition: background 0.3s ease;
}

.notification-item:hover {
  background: #f8f9fa;
}

.notification-item.unread {
  background: #f0f8ff;
  border-left: 3px solid #3498db;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-weight: 600;
  color: #495057;
  margin-bottom: 4px;
  font-size: 14px;
}

.notification-message {
  color: #6c757d;
  font-size: 13px;
  margin-bottom: 4px;
  line-height: 1.4;
}

.notification-time {
  color: #adb5bd;
  font-size: 11px;
}

.notification-close {
  background: none;
  border: none;
  color: #adb5bd;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  width: 20px;
  height: 20px;
}

.empty-notifications {
  padding: 32px;
  text-align: center;
  color: #6c757d;
}

.empty-icon {
  font-size: 32px;
  display: block;
  margin-bottom: 8px;
}

/* 快捷操作 */
.quick-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.quick-action-btn {
  background: none;
  border: 1px solid #e9ecef;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
}

.quick-action-btn:hover {
  background: #f8f9fa;
  border-color: #3498db;
}

.user-menu-btn {
  background: none;
  border: 1px solid #e9ecef;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.user-menu-btn:hover {
  background: #f8f9fa;
  border-color: #3498db;
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #3498db, #2980b9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: white;
}

.user-avatar.large {
  width: 48px;
  height: 48px;
  font-size: 20px;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #495057;
}

.dropdown-arrow {
  font-size: 10px;
  color: #adb5bd;
}

.user-menu-panel {
  position: absolute;
  top: 100%;
  right: 0;
  width: 250px;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  margin-top: 8px;
}

.user-info {
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-details {
  flex: 1;
}

.user-details .user-name {
  margin: 0 0 4px 0;
  font-weight: 600;
}

.user-email {
  margin: 0;
  font-size: 12px;
  color: #6c757d;
}

.menu-divider {
  margin: 0;
  border: none;
  border-top: 1px solid #e9ecef;
}

.menu-list {
  list-style: none;
  margin: 0;
  padding: 8px 0;
}

.menu-item {
  display: block;
  padding: 8px 16px;
  color: #495057;
  text-decoration: none;
  font-size: 14px;
  transition: background 0.3s ease;
  cursor: pointer;
}

.menu-item:hover {
  background: #f8f9fa;
}

.menu-item.logout {
  color: #dc3545;
}

/* 内容区域 */
.admin-content {
  flex: 1;
  padding: 24px;
  min-height: calc(100vh - 140px);
}

/* 页脚 */
.admin-footer {
  background: white;
  border-top: 1px solid #e9ecef;
  padding: 12px 24px;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer-text {
  font-size: 12px;
  color: #6c757d;
}

.footer-separator {
  color: #dee2e6;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer-status {
  font-size: 12px;
  color: #28a745;
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #28a745;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-main {
    margin-left: 0;
  }
  
  .admin-header {
    padding: 12px 16px;
  }
  
  .header-right {
    gap: 8px;
  }
  
  .user-name {
    display: none;
  }
  
  .notification-panel,
  .user-menu-panel {
    width: 280px;
  }
  
  .admin-content {
    padding: 16px;
  }
  
  .footer-content {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }
}

/* 滚动条样式 */
.notification-list::-webkit-scrollbar {
  width: 4px;
}

.notification-list::-webkit-scrollbar-track {
  background: #f8f9fa;
}

.notification-list::-webkit-scrollbar-thumb {
  background: #dee2e6;
  border-radius: 2px;
}

.notification-list::-webkit-scrollbar-thumb:hover {
  background: #adb5bd;
}
</style>