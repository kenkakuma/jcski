<template>
  <div class="hero-editor">
    <!-- Hero编辑器头部 -->
    <div class="editor-header">
      <div class="header-title">
        <h2>🎯 Hero内容可视化编辑器</h2>
        <p class="subtitle">管理首页Hero区域的动态内容展示</p>
      </div>
      <div class="header-actions">
        <button @click="refreshData" class="action-btn refresh-btn" :disabled="loading">
          <span class="btn-icon">🔄</span>
          <span>刷新数据</span>
        </button>
        <button @click="showAddModal = true" class="action-btn primary-btn">
          <span class="btn-icon">✨</span>
          <span>创建Hero内容</span>
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>正在加载Hero内容...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>数据加载失败</h3>
      <p>{{ error.message || '未知错误' }}</p>
      <button @click="refreshData" class="retry-btn">重试</button>
    </div>

    <!-- Hero内容卡片网格 -->
    <div v-else-if="heroContents.length > 0" class="hero-grid">
      <div
        v-for="hero in sortedHeroContents"
        :key="hero.id"
        class="hero-card"
        :class="{ 'inactive': !hero.isActive }"
      >
        <!-- 卡片头部 -->
        <div class="card-header">
          <div class="type-info">
            <div class="type-indicator" :class="hero.menuItem">
              <span class="type-icon">{{ getTypeIcon(hero.menuItem) }}</span>
              <span class="type-label">{{ getTypeLabel(hero.menuItem) }}</span>
            </div>
            <div class="status-indicator" :class="{ active: hero.isActive }">
              <span class="status-dot"></span>
              <span class="status-text">{{ hero.isActive ? '已启用' : '已禁用' }}</span>
            </div>
          </div>
          <div class="card-actions">
            <button @click="editHero(hero)" class="icon-btn edit-btn" title="编辑">
              ✏️
            </button>
            <button 
              @click="toggleActive(hero)" 
              class="icon-btn toggle-btn" 
              :class="{ active: hero.isActive }"
              :title="hero.isActive ? '禁用' : '启用'"
            >
              {{ hero.isActive ? '👁️' : '👁️‍🗨️' }}
            </button>
            <button @click="deleteHero(hero)" class="icon-btn delete-btn" title="删除">
              🗑️
            </button>
          </div>
        </div>

        <!-- 卡片内容 -->
        <div class="card-content">
          <h3 class="content-title">{{ hero.title }}</h3>
          <p class="content-subtitle">{{ hero.subtitle }}</p>
          <p class="content-description">{{ hero.description }}</p>
          
          <!-- 预览区域 -->
          <div class="preview-section">
            <div class="preview-label">预览效果</div>
            <div class="hero-preview-mini" :class="hero.menuItem">
              <div class="preview-content">
                <div class="preview-title">{{ hero.title }}</div>
                <div class="preview-subtitle">{{ hero.subtitle }}</div>
              </div>
            </div>
          </div>

          <!-- 元数据 -->
          <div class="card-meta">
            <div class="meta-item">
              <span class="meta-label">📅 更新时间</span>
              <span class="meta-value">{{ formatDate(hero.updatedAt) }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">🔍 菜单项</span>
              <span class="meta-value">{{ hero.menuItem.toUpperCase() }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="empty-illustration">
        <div class="empty-icon">🎯</div>
        <div class="empty-bg-circle"></div>
      </div>
      <div class="empty-content">
        <h3>还没有Hero内容</h3>
        <p>开始创建您的第一个Hero内容，为网站首页增添精彩展示</p>
        <button @click="showAddModal = true" class="create-first-btn">
          <span class="btn-icon">✨</span>
          <span>创建第一个Hero内容</span>
        </button>
      </div>
    </div>

    <!-- Hero编辑模态框 -->
    <div v-if="showAddModal || editingHero" class="modal-overlay" @click="closeModal">
      <div class="hero-modal" @click.stop>
        <div class="modal-header">
          <div class="header-content">
            <h3>{{ editingHero ? '🎨 编辑Hero内容' : '✨ 创建Hero内容' }}</h3>
            <p class="header-subtitle">{{ editingHero ? '修改现有Hero内容的展示信息' : '为首页Hero区域创建新的内容展示' }}</p>
          </div>
          <button @click="closeModal" class="modal-close">
            <span>✕</span>
          </button>
        </div>
        
        <form @submit.prevent="saveHero" class="hero-form">
          <!-- 菜单项选择 -->
          <div class="form-section">
            <div class="section-header">
              <h4>🎯 菜单类型</h4>
              <p>选择Hero内容对应的菜单项</p>
            </div>
            <div class="menu-type-grid">
              <div 
                v-for="type in menuTypes" 
                :key="type.value"
                class="type-option"
                :class="{ selected: formData.menuItem === type.value }"
                @click="formData.menuItem = type.value"
              >
                <div class="type-icon">{{ type.icon }}</div>
                <div class="type-info">
                  <div class="type-name">{{ type.label }}</div>
                  <div class="type-desc">{{ type.desc }}</div>
                </div>
                <div class="type-radio">
                  <input 
                    type="radio" 
                    :value="type.value" 
                    v-model="formData.menuItem"
                    required
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- 内容编辑 -->
          <div class="form-section">
            <div class="section-header">
              <h4>✏️ 内容编辑</h4>
              <p>设置Hero内容的标题、副标题和描述信息</p>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  <span class="label-icon">📝</span>
                  <span>主标题</span>
                  <span class="required">*</span>
                </label>
                <input
                  v-model="formData.title"
                  type="text"
                  class="form-input"
                  required
                  placeholder="输入引人注目的主标题"
                  maxlength="50"
                >
                <div class="input-hint">建议长度：10-30个字符 ({{ formData.title.length }}/50)</div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  <span class="label-icon">📄</span>
                  <span>副标题</span>
                  <span class="required">*</span>
                </label>
                <input
                  v-model="formData.subtitle"
                  type="text"
                  class="form-input"
                  required
                  placeholder="输入补充说明的副标题"
                  maxlength="100"
                >
                <div class="input-hint">建议长度：20-60个字符 ({{ formData.subtitle.length }}/100)</div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">
                  <span class="label-icon">📋</span>
                  <span>详细描述</span>
                  <span class="required">*</span>
                </label>
                <textarea
                  v-model="formData.description"
                  class="form-textarea"
                  required
                  placeholder="输入详细的内容描述，让用户了解这个板块的特色和价值"
                  rows="4"
                  maxlength="500"
                ></textarea>
                <div class="input-hint">建议长度：50-200个字符 ({{ formData.description.length }}/500)</div>
              </div>
            </div>
          </div>

          <!-- 状态设置 -->
          <div class="form-section">
            <div class="section-header">
              <h4>⚙️ 状态设置</h4>
              <p>配置Hero内容的显示状态</p>
            </div>
            
            <div class="form-row">
              <div class="form-group status-group">
                <label class="form-label">
                  <span class="label-icon">👁️</span>
                  <span>显示状态</span>
                </label>
                <div class="status-toggle">
                  <input 
                    type="checkbox" 
                    id="active-toggle" 
                    v-model="formData.isActive"
                    class="toggle-input"
                  >
                  <label for="active-toggle" class="toggle-label">
                    <span class="toggle-switch"></span>
                    <span class="toggle-text">{{ formData.isActive ? '已启用 - 在首页显示' : '已禁用 - 不在首页显示' }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- 高级实时预览 -->
          <div class="form-section" v-if="formData.title || formData.subtitle">
            <div class="section-header">
              <h4>👀 高级实时预览</h4>
              <p>多设备预览Hero内容在首页的显示效果</p>
            </div>
            
            <!-- 预览模式切换 -->
            <div class="preview-modes">
              <div class="mode-tabs">
                <button 
                  v-for="mode in previewModes" 
                  :key="mode.value"
                  class="mode-tab"
                  :class="{ active: currentPreviewMode === mode.value }"
                  @click="currentPreviewMode = mode.value"
                >
                  <span class="mode-icon">{{ mode.icon }}</span>
                  <span class="mode-label">{{ mode.label }}</span>
                </button>
              </div>
            </div>

            <!-- 预览容器 -->
            <div class="advanced-preview-container">
              <!-- 桌面预览 -->
              <div v-if="currentPreviewMode === 'desktop'" class="preview-frame desktop-frame">
                <div class="frame-header">
                  <div class="frame-controls">
                    <span class="control-dot red"></span>
                    <span class="control-dot yellow"></span>
                    <span class="control-dot green"></span>
                  </div>
                  <div class="frame-title">JCSKI.com - Hero预览 (桌面版)</div>
                </div>
                <div class="frame-content">
                  <div class="hero-preview-advanced desktop" :class="formData.menuItem">
                    <div class="preview-hero-section">
                      <div class="hero-left">
                        <div class="jcski-title">JCSKI</div>
                        <div class="personal-blog">PERSONAL BLOG</div>
                        <div class="menu-items">
                          <div 
                            v-for="item in menuTypes" 
                            :key="item.value"
                            class="menu-item"
                            :class="{ active: item.value === formData.menuItem }"
                          >
                            <span class="menu-en">{{ item.value.toUpperCase() }}</span>
                            <span class="menu-jp">{{ getJapaneseLabel(item.value) }}</span>
                          </div>
                        </div>
                      </div>
                      <div class="hero-right">
                        <div class="hero-content-display">
                          <div class="content-title">{{ formData.title || 'Hero标题预览' }}</div>
                          <div class="content-subtitle">{{ formData.subtitle || 'Hero副标题预览' }}</div>
                          <div class="content-description">{{ formData.description || 'Hero内容描述预览' }}</div>
                        </div>
                        <div class="info-label">INFO</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 平板预览 -->
              <div v-if="currentPreviewMode === 'tablet'" class="preview-frame tablet-frame">
                <div class="frame-header tablet-header">
                  <div class="frame-title">iPad预览 - {{ formData.title || 'Hero内容' }}</div>
                  <div class="tablet-status">{{ formData.isActive ? '✅ 已启用' : '⚠️ 已禁用' }}</div>
                </div>
                <div class="frame-content tablet-content">
                  <div class="hero-preview-advanced tablet" :class="formData.menuItem">
                    <div class="tablet-hero-layout">
                      <div class="tablet-title">{{ formData.title || 'Hero标题' }}</div>
                      <div class="tablet-subtitle">{{ formData.subtitle || 'Hero副标题' }}</div>
                      <div class="tablet-description">{{ formData.description || 'Hero描述内容' }}</div>
                      <div class="tablet-menu-indicator">{{ formData.menuItem.toUpperCase() }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 手机预览 -->
              <div v-if="currentPreviewMode === 'mobile'" class="preview-frame mobile-frame">
                <div class="frame-header mobile-header">
                  <div class="mobile-status-bar">
                    <span class="time">14:20</span>
                    <div class="mobile-indicators">
                      <span class="signal">📶</span>
                      <span class="wifi">📶</span>
                      <span class="battery">🔋</span>
                    </div>
                  </div>
                </div>
                <div class="frame-content mobile-content">
                  <div class="hero-preview-advanced mobile" :class="formData.menuItem">
                    <div class="mobile-hero-layout">
                      <div class="mobile-header-title">JCSKI</div>
                      <div class="mobile-hero-content">
                        <div class="mobile-title">{{ formData.title || 'Hero标题' }}</div>
                        <div class="mobile-subtitle">{{ formData.subtitle || 'Hero副标题' }}</div>
                        <div class="mobile-description">{{ formData.description || 'Hero描述' }}</div>
                      </div>
                      <div class="mobile-menu-tag">{{ getTypeIcon(formData.menuItem) }} {{ getTypeLabel(formData.menuItem) }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 卡片预览模式 -->
              <div v-if="currentPreviewMode === 'card'" class="preview-frame card-frame">
                <div class="frame-header">
                  <div class="frame-title">卡片组件预览 - 组件化展示</div>
                </div>
                <div class="frame-content card-content">
                  <div class="hero-card-preview" :class="formData.menuItem">
                    <div class="card-preview-header">
                      <div class="card-type-badge">
                        <span class="type-icon">{{ getTypeIcon(formData.menuItem) }}</span>
                        <span class="type-name">{{ getTypeLabel(formData.menuItem) }}</span>
                      </div>
                      <div class="card-status" :class="{ active: formData.isActive }">
                        {{ formData.isActive ? '启用' : '禁用' }}
                      </div>
                    </div>
                    <div class="card-preview-content">
                      <h3 class="card-title">{{ formData.title || '标题预览' }}</h3>
                      <p class="card-subtitle">{{ formData.subtitle || '副标题预览' }}</p>
                      <p class="card-description">{{ formData.description || '描述内容预览' }}</p>
                    </div>
                    <div class="card-preview-footer">
                      <div class="preview-meta">
                        <span class="char-count">{{ getTotalCharCount() }} 字符</span>
                        <span class="word-count">{{ getWordCount() }} 词</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 预览说明 -->
            <div class="preview-notes">
              <div class="note-item">
                <span class="note-icon">💡</span>
                <span class="note-text">预览会根据您的编辑内容实时更新</span>
              </div>
              <div class="note-item">
                <span class="note-icon">🎨</span>
                <span class="note-text">颜色和样式会根据选择的菜单类型自动调整</span>
              </div>
              <div class="note-item">
                <span class="note-icon">📱</span>
                <span class="note-text">支持桌面、平板、手机多种设备预览模式</span>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="form-actions">
            <button type="button" @click="closeModal" class="action-btn cancel-btn">
              <span class="btn-icon">❌</span>
              <span>取消</span>
            </button>
            <button type="submit" class="action-btn save-btn" :disabled="saving || !isFormValid">
              <span class="btn-icon">{{ saving ? '⏳' : '💾' }}</span>
              <span>{{ saving ? '保存中...' : editingHero ? '更新Hero内容' : '创建Hero内容' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { HeroContent } from '~/types'

const heroContents = ref<HeroContent[]>([])
const showAddModal = ref(false)
const editingHero = ref<HeroContent | null>(null)
const saving = ref(false)

const formData = ref({
  menuItem: '',
  title: '',
  subtitle: '',
  description: '',
  isActive: true
})

const loading = ref(false)
const error = ref(null)

const menuTypes = [
  { value: 'music', label: '音乐', icon: '🎵', desc: '音乐制作与分享' },
  { value: 'skiing', label: '滑雪', icon: '🎿', desc: '滑雪技巧与装备' },
  { value: 'tech', label: '科技', icon: '💻', desc: '技术开发与创新' },
  { value: 'fishing', label: '钓鱼', icon: '🎣', desc: '钓鱼技巧与体验' },
  { value: 'about', label: '关于', icon: '👤', desc: '个人介绍与联系' }
]

const getTypeLabel = (menuItem: string) => {
  const type = menuTypes.find(t => t.value === menuItem)
  return type ? type.label : menuItem
}

const getTypeIcon = (menuItem: string) => {
  const type = menuTypes.find(t => t.value === menuItem)
  return type ? type.icon : '📝'
}

const sortedHeroContents = computed(() => {
  return [...heroContents.value].sort((a, b) => {
    // 先按激活状态排序，已激活的在前
    if (a.isActive !== b.isActive) {
      return b.isActive ? 1 : -1
    }
    // 再按更新时间排序，最新的在前
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })
})

const isFormValid = computed(() => {
  return formData.value.menuItem && 
         formData.value.title.trim() && 
         formData.value.subtitle.trim() && 
         formData.value.description.trim()
})

// 预览功能相关
const currentPreviewMode = ref('desktop')

const previewModes = [
  { value: 'desktop', label: '桌面版', icon: '🖥️' },
  { value: 'tablet', label: '平板', icon: '📱' },
  { value: 'mobile', label: '手机', icon: '📱' },
  { value: 'card', label: '卡片', icon: '🃏' }
]

const getJapaneseLabel = (menuItem: string) => {
  const japaneseLabels = {
    music: '音楽',
    skiing: 'スキー',
    tech: 'テック',
    fishing: 'フィッシング',
    about: 'アバウト'
  }
  return japaneseLabels[menuItem] || menuItem
}

const getTotalCharCount = () => {
  return formData.value.title.length + formData.value.subtitle.length + formData.value.description.length
}

const getWordCount = () => {
  const text = formData.value.title + ' ' + formData.value.subtitle + ' ' + formData.value.description
  return text.trim().split(/\s+/).filter(word => word.length > 0).length
}

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const fetchHeroContents = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await $fetch('/api/admin/hero')
    if (response.success) {
      heroContents.value = response.data
    } else {
      throw new Error(response.message || '获取数据失败')
    }
  } catch (err) {
    console.error('获取Hero内容失败:', err)
    error.value = err
  } finally {
    loading.value = false
  }
}

const refreshData = async () => {
  await fetchHeroContents()
}

const editHero = (hero: HeroContent) => {
  editingHero.value = hero
  formData.value = {
    menuItem: hero.menuItem,
    title: hero.title,
    subtitle: hero.subtitle,
    description: hero.description,
    isActive: hero.isActive
  }
}

const closeModal = () => {
  showAddModal.value = false
  editingHero.value = null
  formData.value = {
    menuItem: '',
    title: '',
    subtitle: '',
    description: '',
    isActive: true
  }
}

const saveHero = async () => {
  saving.value = true
  try {
    if (editingHero.value) {
      // 更新现有hero
      await $fetch(`/api/admin/hero/${editingHero.value.id}`, {
        method: 'PUT',
        body: formData.value
      })
    } else {
      // 创建新hero
      await $fetch('/api/admin/hero', {
        method: 'POST',
        body: formData.value
      })
    }
    
    await fetchHeroContents()
    closeModal()
  } catch (error) {
    console.error('保存Hero内容失败:', error)
    alert('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

const toggleActive = async (hero: HeroContent) => {
  try {
    await $fetch(`/api/admin/hero/${hero.id}`, {
      method: 'PUT',
      body: { isActive: !hero.isActive }
    })
    await fetchHeroContents()
  } catch (error) {
    console.error('切换状态失败:', error)
    alert('操作失败，请重试')
  }
}

const deleteHero = async (hero: HeroContent) => {
  if (!confirm(`确定要删除 "${hero.title}" 吗？`)) {
    return
  }

  try {
    await $fetch(`/api/admin/hero/${hero.id}`, {
      method: 'DELETE'
    })
    await fetchHeroContents()
  } catch (error) {
    console.error('删除Hero内容失败:', error)
    alert('删除失败，请重试')
  }
}

onMounted(() => {
  fetchHeroContents()
})
</script>

<style scoped>
.hero-editor {
  max-width: 1400px;
  margin: 0 auto;
}

/* 编辑器头部 */
.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: white;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
}

.header-title h2 {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
  font-weight: 400;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.primary-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.primary-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.refresh-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.refresh-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 加载和错误状态 */
.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-state h3 {
  color: #e74c3c;
  margin: 0 0 8px 0;
  font-size: 20px;
}

.error-state p {
  color: #666;
  margin: 0 0 24px 0;
}

.retry-btn {
  padding: 12px 24px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: #c0392b;
  transform: translateY(-2px);
}

/* Hero内容网格 */
.hero-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

/* Hero内容卡片 */
.hero-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.hero-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.hero-card.inactive {
  opacity: 0.7;
  background: #f8f9fa;
}

.card-header {
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.type-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.type-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
}

.type-indicator.music { background: rgba(156, 39, 176, 0.1); color: #9c27b0; }
.type-indicator.skiing { background: rgba(33, 150, 243, 0.1); color: #2196f3; }
.type-indicator.tech { background: rgba(63, 81, 181, 0.1); color: #3f51b5; }
.type-indicator.fishing { background: rgba(76, 175, 80, 0.1); color: #4caf50; }
.type-indicator.about { background: rgba(255, 152, 0, 0.1); color: #ff9800; }

.type-icon {
  font-size: 16px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #dc3545;
}

.status-indicator.active .status-dot {
  background: #28a745;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.card-actions {
  display: flex;
  gap: 4px;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.3s ease;
  background: transparent;
}

.edit-btn:hover {
  background: rgba(52, 144, 220, 0.1);
  color: #3490dc;
}

.toggle-btn:hover {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.toggle-btn:not(.active):hover {
  background: rgba(255, 193, 7, 0.1);
  color: #ffc107;
}

.delete-btn:hover {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.card-content {
  padding: 24px;
}

.content-title {
  font-size: 20px;
  font-weight: 700;
  color: #333;
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.content-subtitle {
  font-size: 16px;
  color: #666;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.content-description {
  font-size: 14px;
  color: #555;
  line-height: 1.6;
  margin: 0 0 20px 0;
}

/* 预览区域 */
.preview-section {
  margin-bottom: 20px;
}

.preview-label {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.hero-preview-mini {
  padding: 16px;
  border-radius: 8px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-left: 4px solid #ccc;
}

.hero-preview-mini.music { border-left-color: #9c27b0; }
.hero-preview-mini.skiing { border-left-color: #2196f3; }
.hero-preview-mini.tech { border-left-color: #3f51b5; }
.hero-preview-mini.fishing { border-left-color: #4caf50; }
.hero-preview-mini.about { border-left-color: #ff9800; }

.preview-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
}

.preview-subtitle {
  font-size: 12px;
  color: #666;
  margin: 0;
}

/* 元数据 */
.card-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.meta-label {
  color: #666;
  font-weight: 500;
}

.meta-value {
  color: #333;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .editor-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .hero-grid {
    grid-template-columns: 1fr;
  }
  
  .hero-modal {
    width: 95%;
    max-height: 95vh;
  }
  
  .form-section {
    padding: 24px 20px;
  }
  
  .form-actions {
    padding: 20px;
    flex-direction: column;
  }
  
  .action-btn {
    justify-content: center;
  }
  
  .menu-type-grid {
    grid-template-columns: 1fr;
  }
  
  .type-option {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .type-info {
    text-align: center;
  }
}

@media (max-width: 480px) {
  .editor-header {
    padding: 20px;
  }
  
  .header-title h2 {
    font-size: 24px;
  }
  
  .hero-modal {
    width: 100%;
    height: 100%;
    max-height: 100vh;
    border-radius: 0;
  }
  
  .empty-state {
    padding: 60px 20px;
  }
  
  .empty-content h3 {
    font-size: 20px;
  }
  
  .empty-content p {
    font-size: 14px;
  }
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 80px 40px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
}

.empty-illustration {
  position: relative;
  margin-bottom: 32px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 0;
  position: relative;
  z-index: 2;
}

.empty-bg-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  opacity: 0.1;
  z-index: 1;
}

.empty-content h3 {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0 0 12px 0;
}

.empty-content p {
  font-size: 16px;
  color: #666;
  margin: 0 0 32px 0;
  line-height: 1.6;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.create-first-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 16px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.create-first-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.hero-modal {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-content h3 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
}

.header-subtitle {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
  font-weight: 400;
}

.modal-close {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  font-size: 16px;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

/* 表单样式 */
.hero-form {
  padding: 0;
  max-height: calc(90vh - 120px);
  overflow-y: auto;
}

.form-section {
  padding: 32px;
  border-bottom: 1px solid #f0f0f0;
}

.form-section:last-child {
  border-bottom: none;
}

.section-header {
  margin-bottom: 24px;
}

.section-header h4 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-header p {
  font-size: 14px;
  color: #666;
  margin: 0;
  line-height: 1.5;
}

/* 菜单类型网格 */
.menu-type-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.type-option {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.type-option:hover {
  border-color: #667eea;
  background: #f8f9fd;
}

.type-option.selected {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.type-option .type-icon {
  font-size: 24px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 12px;
}

.type-option.selected .type-icon {
  background: rgba(102, 126, 234, 0.2);
}

.type-info {
  flex: 1;
}

.type-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.type-desc {
  font-size: 14px;
  color: #666;
}

.type-radio {
  position: relative;
}

.type-radio input[type="radio"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

/* 表单字段 */
.form-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.label-icon {
  font-size: 16px;
}

.required {
  color: #e74c3c;
  font-weight: 700;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.3s ease;
  font-family: inherit;
  background: white;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
  line-height: 1.6;
}

.input-hint {
  margin-top: 6px;
  font-size: 12px;
  color: #666;
}

/* 状态切换 */
.status-group {
  margin-bottom: 0;
}

.status-toggle {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toggle-input {
  display: none;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.toggle-switch {
  position: relative;
  width: 48px;
  height: 24px;
  background: #ccc;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.toggle-switch::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-input:checked + .toggle-label .toggle-switch {
  background: #28a745;
}

.toggle-input:checked + .toggle-label .toggle-switch::before {
  transform: translateX(24px);
}

.toggle-text {
  color: #333;
}

/* 高级预览功能 */
.preview-modes {
  margin-bottom: 24px;
}

.mode-tabs {
  display: flex;
  gap: 8px;
  background: #f8f9fa;
  padding: 6px;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.mode-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  justify-content: center;
}

.mode-tab:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.mode-tab.active {
  background: #667eea;
  color: white;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.mode-icon {
  font-size: 14px;
}

.mode-label {
  font-weight: 600;
}

/* 高级预览容器 */
.advanced-preview-container {
  background: #f0f2f5;
  border-radius: 16px;
  padding: 24px;
  border: 2px solid #e9ecef;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 预览框架样式 */
.preview-frame {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 100%;
  max-width: 100%;
}

/* 桌面预览 */
.desktop-frame {
  max-width: 1000px;
}

.frame-header {
  background: #f5f5f5;
  padding: 12px 16px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  gap: 12px;
}

.frame-controls {
  display: flex;
  gap: 6px;
}

.control-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.control-dot.red { background: #ff5f57; }
.control-dot.yellow { background: #ffbd2e; }
.control-dot.green { background: #28ca42; }

.frame-title {
  font-size: 13px;
  color: #666;
  font-weight: 500;
}

.frame-content {
  padding: 0;
  background: white;
}

/* Hero预览高级样式 */
.hero-preview-advanced {
  border-radius: 0;
  box-shadow: none;
  border: none;
  background: linear-gradient(135deg, #87CEEB 0%, #E0F6FF 100%);
}

.preview-hero-section {
  display: flex;
  min-height: 300px;
}

.hero-left {
  width: 40%;
  padding: 24px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.jcski-title {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 4px;
  font-family: 'Special Gothic Expanded One', sans-serif;
}

.personal-blog {
  font-size: 12px;
  color: #7f8c8d;
  margin-bottom: 20px;
  letter-spacing: 1px;
}

.menu-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.2);
}

.menu-item.active {
  background: rgba(44, 62, 80, 0.8);
  color: white;
}

.menu-en {
  font-size: 14px;
  font-weight: 600;
}

.menu-jp {
  font-size: 12px;
  opacity: 0.8;
}

.hero-right {
  flex: 1;
  padding: 24px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero-content-display {
  max-width: 400px;
}

.content-title {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 8px;
  line-height: 1.3;
}

.content-subtitle {
  font-size: 16px;
  color: #34495e;
  margin-bottom: 12px;
  line-height: 1.4;
}

.content-description {
  font-size: 14px;
  color: #5a6c7d;
  line-height: 1.6;
}

.info-label {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(44, 62, 80, 0.8);
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

/* 平板预览 */
.tablet-frame {
  max-width: 600px;
}

.tablet-header {
  background: #667eea;
  color: white;
}

.tablet-status {
  font-size: 12px;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.tablet-content {
  padding: 20px;
}

.tablet-hero-layout {
  text-align: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #87CEEB 0%, #E0F6FF 100%);
  border-radius: 12px;
  position: relative;
}

.tablet-title {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 12px;
}

.tablet-subtitle {
  font-size: 18px;
  color: #34495e;
  margin-bottom: 16px;
}

.tablet-description {
  font-size: 16px;
  color: #5a6c7d;
  line-height: 1.6;
  max-width: 400px;
  margin: 0 auto 20px;
}

.tablet-menu-indicator {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(44, 62, 80, 0.8);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
}

/* 手机预览 */
.mobile-frame {
  max-width: 350px;
}

.mobile-header {
  background: #333;
  color: white;
  padding: 8px 16px;
}

.mobile-status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.time {
  font-weight: 600;
}

.mobile-indicators {
  display: flex;
  gap: 4px;
}

.mobile-content {
  padding: 16px;
}

.mobile-hero-layout {
  background: linear-gradient(135deg, #87CEEB 0%, #E0F6FF 100%);
  border-radius: 12px;
  padding: 24px 16px;
  text-align: center;
  position: relative;
}

.mobile-header-title {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 20px;
  font-family: 'Special Gothic Expanded One', sans-serif;
}

.mobile-hero-content {
  margin-bottom: 16px;
}

.mobile-title {
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 8px;
}

.mobile-subtitle {
  font-size: 14px;
  color: #34495e;
  margin-bottom: 12px;
}

.mobile-description {
  font-size: 13px;
  color: #5a6c7d;
  line-height: 1.5;
}

.mobile-menu-tag {
  display: inline-block;
  background: rgba(44, 62, 80, 0.8);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

/* 卡片预览 */
.card-frame {
  max-width: 500px;
}

.card-content {
  padding: 24px;
}

.hero-card-preview {
  border-radius: 12px;
  border: 2px solid #e9ecef;
  overflow: hidden;
  background: white;
}

.card-preview-header {
  padding: 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-type-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 14px;
}

.card-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  background: #dc3545;
  color: white;
}

.card-status.active {
  background: #28a745;
}

.card-preview-content {
  padding: 20px;
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin: 0 0 8px 0;
}

.card-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0 0 12px 0;
}

.card-description {
  font-size: 13px;
  color: #555;
  line-height: 1.6;
  margin: 0;
}

.card-preview-footer {
  padding: 12px 20px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.preview-meta {
  display: flex;
  gap: 16px;
  font-size: 11px;
  color: #666;
}

/* 预览说明 */
.preview-notes {
  margin-top: 20px;
  padding: 16px;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.note-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 13px;
}

.note-item:last-child {
  margin-bottom: 0;
}

.note-icon {
  font-size: 14px;
}

.note-text {
  color: #555;
  line-height: 1.4;
}

/* 预览主题颜色 */
.hero-preview-advanced.music {
  background: linear-gradient(135deg, #DA70D6 0%, #FFB6C1 100%);
}

.hero-preview-advanced.skiing {
  background: linear-gradient(135deg, #87CEEB 0%, #E0F6FF 100%);
}

.hero-preview-advanced.tech {
  background: linear-gradient(135deg, #4169E1 0%, #87CEFA 100%);
}

.hero-preview-advanced.fishing {
  background: linear-gradient(135deg, #32CD32 0%, #98FB98 100%);
}

.hero-preview-advanced.about {
  background: linear-gradient(135deg, #FFA500 0%, #FFE4B5 100%);
}

.tablet-hero-layout.music,
.mobile-hero-layout.music {
  background: linear-gradient(135deg, #DA70D6 0%, #FFB6C1 100%);
}

.tablet-hero-layout.skiing,
.mobile-hero-layout.skiing {
  background: linear-gradient(135deg, #87CEEB 0%, #E0F6FF 100%);
}

.tablet-hero-layout.tech,
.mobile-hero-layout.tech {
  background: linear-gradient(135deg, #4169E1 0%, #87CEFA 100%);
}

.tablet-hero-layout.fishing,
.mobile-hero-layout.fishing {
  background: linear-gradient(135deg, #32CD32 0%, #98FB98 100%);
}

.tablet-hero-layout.about,
.mobile-hero-layout.about {
  background: linear-gradient(135deg, #FFA500 0%, #FFE4B5 100%);
}


/* 操作按钮 */
.form-actions {
  padding: 24px 32px;
  background: #f8f9fa;
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  border-top: 1px solid #e9ecef;
}

.cancel-btn {
  background: white;
  color: #666;
  border: 2px solid #e9ecef;
}

.cancel-btn:hover {
  background: #f8f9fa;
  border-color: #adb5bd;
  color: #495057;
}

.save-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: 2px solid transparent;
  min-width: 160px;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-icon {
  font-size: 14px;
}

</style>