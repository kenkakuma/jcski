<template>
  <aside class="admin-sidebar" :class="{ collapsed: isCollapsed }">
    <!-- 侧边栏头部 -->
    <div class="sidebar-header">
      <div class="header-content">
        <div class="logo-section">
          <div class="logo-icon">🎯</div>
          <h2 v-if="!isCollapsed" class="sidebar-title">JCSKI Admin</h2>
        </div>
        <button 
          @click="toggleCollapse" 
          class="collapse-btn"
          :title="isCollapsed ? '展开菜单' : '收起菜单'"
        >
          <span>{{ isCollapsed ? '→' : '←' }}</span>
        </button>
      </div>
    </div>

    <!-- 用户信息区域 -->
    <div class="user-section">
      <div class="user-avatar">
        <span>👤</span>
      </div>
      <div v-if="!isCollapsed" class="user-info">
        <p class="user-name">管理员</p>
        <p class="user-role">Admin</p>
      </div>
    </div>

    <!-- 导航菜单 -->
    <nav class="sidebar-nav">
      <div class="nav-section">
        <div v-if="!isCollapsed" class="section-title">核心功能</div>
        <button
          v-for="tab in mainTabs"
          :key="tab.id"
          :class="['nav-item', { active: activeTab === tab.id }]"
          @click="handleNavClick(tab.id)"
          :title="isCollapsed ? tab.label : ''"
        >
          <span class="nav-icon">{{ tab.icon }}</span>
          <span v-if="!isCollapsed" class="nav-label">{{ tab.label }}</span>
          <span v-if="!isCollapsed && tab.badge" class="nav-badge">{{ tab.badge }}</span>
        </button>
      </div>

      <div class="nav-section">
        <div v-if="!isCollapsed" class="section-title">内容管理</div>
        <button
          v-for="tab in contentTabs"
          :key="tab.id"
          :class="['nav-item', { active: activeTab === tab.id }]"
          @click="handleNavClick(tab.id)"
          :title="isCollapsed ? tab.label : ''"
        >
          <span class="nav-icon">{{ tab.icon }}</span>
          <span v-if="!isCollapsed" class="nav-label">{{ tab.label }}</span>
          <span v-if="!isCollapsed && tab.badge" class="nav-badge">{{ tab.badge }}</span>
        </button>
      </div>

      <div class="nav-section">
        <div v-if="!isCollapsed" class="section-title">系统管理</div>
        <button
          v-for="tab in systemTabs"
          :key="tab.id"
          :class="['nav-item', { active: activeTab === tab.id }]"
          @click="handleNavClick(tab.id)"
          :title="isCollapsed ? tab.label : ''"
        >
          <span class="nav-icon">{{ tab.icon }}</span>
          <span v-if="!isCollapsed" class="nav-label">{{ tab.label }}</span>
          <span v-if="!isCollapsed && tab.badge" class="nav-badge">{{ tab.badge }}</span>
        </button>
      </div>
    </nav>

    <!-- 侧边栏底部 -->
    <div class="sidebar-footer">
      <div class="sidebar-info">
        <div class="info-icon">💡</div>
        <div v-if="!isCollapsed" class="info-content">
          <p class="info-text">JCSKI Blog Admin</p>
          <p class="info-version">v2.0.0</p>
          <p class="info-status">升级版本</p>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
defineProps({
  activeTab: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['tab-change'])

// 折叠状态管理
const isCollapsed = ref(false)

// 导航点击处理
const handleNavClick = (tabId) => {
  console.log('Sidebar nav clicked:', tabId)
  emit('tab-change', tabId)
}

// 折叠切换功能
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

// 核心功能导航
const mainTabs = [
  { id: 'dashboard', label: '控制面板', icon: '📊', badge: null },
]

// 内容管理导航
const contentTabs = [
  { id: 'posts', label: '文章管理', icon: '📝', badge: 'NEW' },
  { id: 'hero', label: 'Hero管理', icon: '🎯', badge: null },
  { id: 'media', label: '媒体管理', icon: '🖼️', badge: null },
]

// 系统管理导航
const systemTabs = [
  { id: 'settings', label: '网站设置', icon: '⚙️', badge: null },
  { id: 'analytics', label: '数据分析', icon: '📈', badge: null },
  { id: 'calendar', label: '日程管理', icon: '📅', badge: null }
]

// 响应式处理
const isMobile = ref(false)

onMounted(() => {
  // 检测屏幕大小
  const checkScreenSize = () => {
    isMobile.value = window.innerWidth <= 768
    if (isMobile.value) {
      isCollapsed.value = true
    }
  }
  
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
  
  onUnmounted(() => {
    window.removeEventListener('resize', checkScreenSize)
  })
})
</script>

<style scoped>
/* 主侧边栏样式 */
.admin-sidebar {
  width: 260px;
  background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 1000;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
}

.admin-sidebar.collapsed {
  width: 70px;
}

/* 侧边栏头部 */
.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.sidebar-title {
  font-size: 18px;
  font-weight: 700;
  color: white;
  margin: 0;
  font-family: "Special Gothic Expanded One", sans-serif;
}

.collapse-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 14px;
}

.collapse-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

/* 用户信息区域 */
.user-section {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #3498db, #2980b9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: white;
  margin: 0 0 2px 0;
}

.user-role {
  font-size: 12px;
  color: #bdc3c7;
  margin: 0;
}

/* 导航区域 */
.sidebar-nav {
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;
}

.nav-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 11px;
  color: #95a5a6;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 0 20px 8px 20px;
  font-weight: 600;
}

.nav-item {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 12px 20px;
  background: none;
  border: none;
  color: #bdc3c7;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  position: relative;
  margin: 2px 0;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transform: translateX(4px);
}

.nav-item.active {
  background: linear-gradient(90deg, #3498db, rgba(52, 152, 219, 0.8));
  color: white;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #2980b9;
  border-radius: 0 2px 2px 0;
}

.nav-icon {
  margin-right: 12px;
  font-size: 16px;
  width: 20px;
  text-align: center;
  flex-shrink: 0;
}

.nav-label {
  font-weight: 500;
  flex: 1;
}

.nav-badge {
  background: #e74c3c;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 600;
}

/* 侧边栏底部 */
.sidebar-footer {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.info-content {
  flex: 1;
}

.info-text {
  font-size: 12px;
  color: #95a5a6;
  margin: 0 0 2px 0;
}

.info-version {
  font-size: 11px;
  color: #7f8c8d;
  margin: 0 0 2px 0;
}

.info-status {
  font-size: 10px;
  color: #27ae60;
  margin: 0;
  font-weight: 600;
}

/* 折叠状态下的样式调整 */
.admin-sidebar.collapsed .nav-item {
  padding: 12px 15px;
  justify-content: center;
}

.admin-sidebar.collapsed .nav-icon {
  margin-right: 0;
}

.admin-sidebar.collapsed .section-title {
  display: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-sidebar {
    width: 100%;
    height: auto;
    position: relative;
    transform: translateX(-100%);
  }
  
  .admin-sidebar.show-mobile {
    transform: translateX(0);
  }
  
  .sidebar-nav {
    display: flex;
    overflow-x: auto;
    padding: 10px 0;
    flex-direction: row;
  }
  
  .nav-section {
    display: flex;
    margin-bottom: 0;
    margin-right: 20px;
  }
  
  .nav-item {
    white-space: nowrap;
    flex-shrink: 0;
    min-width: 120px;
  }
}

/* 滚动条样式 */
.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>