<template>
  <div class="admin-hero">
    <div class="hero-header">
      <h2>Hero区域管理</h2>
      <button @click="showAddModal = true" class="btn btn-primary">
        <span>➕</span> 添加新内容
      </button>
    </div>

    <!-- Hero Content List -->
    <div v-if="heroContents.length > 0" class="hero-list">
      <div
        v-for="hero in heroContents"
        :key="hero.id"
        class="hero-item"
      >
        <div class="hero-preview">
          <div class="hero-type">
            <span class="type-badge" :class="hero.type">{{ getTypeLabel(hero.type) }}</span>
            <span class="order-badge">{{ hero.order }}</span>
          </div>
          <div class="hero-content">
            <h3>{{ hero.title }}</h3>
            <p class="hero-subtitle">{{ hero.subtitle }}</p>
            <p class="hero-description">{{ hero.description }}</p>
            <div class="hero-meta">
              <span class="status-badge" :class="{ active: hero.active }">
                {{ hero.active ? '已启用' : '已禁用' }}
              </span>
              <span class="updated-time">
                更新于: {{ formatDate(hero.updatedAt) }}
              </span>
            </div>
          </div>
        </div>
        <div class="hero-actions">
          <button
            @click="editHero(hero)"
            class="btn btn-sm btn-secondary"
          >
            编辑
          </button>
          <button
            @click="toggleActive(hero)"
            class="btn btn-sm"
            :class="hero.active ? 'btn-warning' : 'btn-success'"
          >
            {{ hero.active ? '禁用' : '启用' }}
          </button>
          <button
            @click="deleteHero(hero)"
            class="btn btn-sm btn-danger"
          >
            删除
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">📋</div>
      <p>暂无Hero内容</p>
      <button @click="showAddModal = true" class="btn btn-primary">
        创建第一个Hero内容
      </button>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || editingHero" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ editingHero ? '编辑Hero内容' : '添加Hero内容' }}</h3>
          <button @click="closeModal" class="modal-close">×</button>
        </div>
        
        <form @submit.prevent="saveHero" class="modal-form">
          <div class="form-group">
            <label>类型</label>
            <select v-model="formData.type" class="form-input" required>
              <option value="">请选择类型</option>
              <option value="music">音乐 (MUSIC)</option>
              <option value="skiing">滑雪 (SKIING)</option>
              <option value="tech">科技 (TECH)</option>
              <option value="fishing">钓鱼 (FISHING)</option>
              <option value="about">关于 (ABOUT)</option>
            </select>
          </div>

          <div class="form-group">
            <label>标题</label>
            <input
              v-model="formData.title"
              type="text"
              class="form-input"
              required
              placeholder="请输入标题"
            >
          </div>

          <div class="form-group">
            <label>副标题</label>
            <input
              v-model="formData.subtitle"
              type="text"
              class="form-input"
              required
              placeholder="请输入副标题"
            >
          </div>

          <div class="form-group">
            <label>描述</label>
            <textarea
              v-model="formData.description"
              class="form-textarea"
              required
              placeholder="请输入描述"
              rows="4"
            ></textarea>
          </div>

          <div class="form-group">
            <label>图片链接</label>
            <input
              v-model="formData.image"
              type="url"
              class="form-input"
              placeholder="请输入图片链接(可选)"
            >
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>排序</label>
              <input
                v-model.number="formData.order"
                type="number"
                class="form-input"
                min="0"
                placeholder="0"
              >
            </div>

            <div class="form-group">
              <label>状态</label>
              <select v-model="formData.active" class="form-input">
                <option :value="true">启用</option>
                <option :value="false">禁用</option>
              </select>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn btn-secondary">
              取消
            </button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? '保存中...' : '保存' }}
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
  type: '',
  title: '',
  subtitle: '',
  description: '',
  image: '',
  active: true,
  order: 0
})

const getTypeLabel = (type: string) => {
  const labels = {
    music: '音乐',
    skiing: '滑雪',
    tech: '科技',
    fishing: '钓鱼',
    about: '关于'
  }
  return labels[type] || type
}

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const fetchHeroContents = async () => {
  try {
    const response = await $fetch('/api/admin/hero')
    if (response.success) {
      heroContents.value = response.data
    }
  } catch (error) {
    console.error('获取Hero内容失败:', error)
  }
}

const editHero = (hero: HeroContent) => {
  editingHero.value = hero
  formData.value = {
    type: hero.type,
    title: hero.title,
    subtitle: hero.subtitle,
    description: hero.description,
    image: hero.image || '',
    active: hero.active,
    order: hero.order
  }
}

const closeModal = () => {
  showAddModal.value = false
  editingHero.value = null
  formData.value = {
    type: '',
    title: '',
    subtitle: '',
    description: '',
    image: '',
    active: true,
    order: 0
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
      body: { active: !hero.active }
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
.admin-hero {
  max-width: 1200px;
}

.hero-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.hero-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.hero-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hero-item {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  transition: box-shadow 0.3s ease;
}

.hero-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.hero-preview {
  flex: 1;
  margin-right: 24px;
}

.hero-type {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.type-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.type-badge.music { background: #9c27b0; }
.type-badge.skiing { background: #2196f3; }
.type-badge.tech { background: #3f51b5; }
.type-badge.fishing { background: #4caf50; }
.type-badge.about { background: #ff9800; }

.order-badge {
  background: #e0e0e0;
  color: #666;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
}

.hero-content h3 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.hero-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0 0 8px 0;
}

.hero-description {
  font-size: 13px;
  color: #555;
  line-height: 1.5;
  margin: 0 0 12px 0;
}

.hero-meta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  background: #f5f5f5;
  color: #666;
}

.status-badge.active {
  background: #e8f5e8;
  color: #2e7d32;
}

.updated-time {
  font-size: 11px;
  color: #999;
}

.hero-actions {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover {
  background: #1e7e34;
}

.btn-warning {
  background: #ffc107;
  color: #212529;
}

.btn-warning:hover {
  background: #e0a800;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state p {
  color: #666;
  margin-bottom: 20px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-form {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #333;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #007bff;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

@media (max-width: 768px) {
  .hero-item {
    flex-direction: column;
    align-items: stretch;
  }
  
  .hero-preview {
    margin-right: 0;
    margin-bottom: 16px;
  }
  
  .hero-actions {
    justify-content: flex-start;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    width: 95%;
  }
}
</style>