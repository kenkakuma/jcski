<template>
  <aside class="admin-sidebar">
    <div class="sidebar-header">
      <h2 class="sidebar-title">JCSKI Admin</h2>
    </div>

    <nav class="sidebar-nav">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['nav-item', { active: activeTab === tab.id }]"
        @click="$emit('tab-change', tab.id)"
      >
        <span class="nav-icon">{{ tab.icon }}</span>
        <span class="nav-label">{{ tab.label }}</span>
      </button>
    </nav>

    <div class="sidebar-footer">
      <div class="sidebar-info">
        <p class="info-text">JCSKI Blog Admin</p>
        <p class="info-version">v1.0.0</p>
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

defineEmits(['tab-change'])

const tabs = [
  { id: 'dashboard', label: '控制面板', icon: '📊' },
  { id: 'posts', label: '文章管理', icon: '📝' },
  { id: 'hero', label: 'Hero管理', icon: '🎯' },
  { id: 'settings', label: '网站设置', icon: '⚙️' },
  { id: 'media', label: '媒体管理', icon: '🖼️' },
  { id: 'calendar', label: '日历管理', icon: '📅' }
]
</script>

<style scoped>
.admin-sidebar {
  width: 260px;
  background: #2c3e50;
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 1000;
}

.sidebar-header {
  padding: 24px 20px;
  border-bottom: 1px solid #34495e;
}

.sidebar-title {
  font-size: 18px;
  font-weight: 700;
  color: white;
  margin: 0;
}

.sidebar-nav {
  flex: 1;
  padding: 20px 0;
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
}

.nav-item:hover {
  background: #34495e;
  color: white;
}

.nav-item.active {
  background: #3498db;
  color: white;
  position: relative;
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #2980b9;
}

.nav-icon {
  margin-right: 12px;
  font-size: 16px;
}

.nav-label {
  font-weight: 500;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid #34495e;
}

.sidebar-info {
  text-align: center;
}

.info-text {
  font-size: 12px;
  color: #95a5a6;
  margin: 0 0 4px 0;
}

.info-version {
  font-size: 11px;
  color: #7f8c8d;
  margin: 0;
}

@media (max-width: 768px) {
  .admin-sidebar {
    width: 100%;
    height: auto;
    position: relative;
  }
  
  .sidebar-nav {
    display: flex;
    overflow-x: auto;
    padding: 10px 0;
  }
  
  .nav-item {
    white-space: nowrap;
    flex-shrink: 0;
  }
}
</style>