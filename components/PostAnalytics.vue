<template>
  <div class="post-analytics">
    <!-- Analytics Header -->
    <div class="analytics-header">
      <div class="header-left">
        <h3>文章统计分析</h3>
        <p>深入了解您的内容表现和读者行为</p>
      </div>
      
      <div class="header-actions">
        <select v-model="timeRange" class="time-range-select">
          <option value="7d">最近7天</option>
          <option value="30d">最近30天</option>
          <option value="90d">最近90天</option>
          <option value="1y">最近1年</option>
          <option value="all">全部时间</option>
        </select>
        
        <button @click="exportReport" class="btn-primary">
          <i class="fas fa-download"></i>
          导出报告
        </button>
      </div>
    </div>

    <!-- Overview Stats -->
    <div class="overview-stats">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-file-alt"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ overviewStats.totalPosts }}</div>
          <div class="stat-label">总文章数</div>
          <div class="stat-change positive">
            <i class="fas fa-arrow-up"></i>
            +{{ overviewStats.postsGrowth }}%
          </div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-eye"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ formatNumber(overviewStats.totalViews) }}</div>
          <div class="stat-label">总阅读量</div>
          <div class="stat-change positive">
            <i class="fas fa-arrow-up"></i>
            +{{ overviewStats.viewsGrowth }}%
          </div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-heart"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ formatNumber(overviewStats.totalLikes) }}</div>
          <div class="stat-label">总点赞数</div>
          <div class="stat-change positive">
            <i class="fas fa-arrow-up"></i>
            +{{ overviewStats.likesGrowth }}%
          </div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fas fa-comment"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ formatNumber(overviewStats.totalComments) }}</div>
          <div class="stat-label">总评论数</div>
          <div class="stat-change positive">
            <i class="fas fa-arrow-up"></i>
            +{{ overviewStats.commentsGrowth }}%
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-section">
      <div class="chart-container">
        <div class="chart-header">
          <h4>内容发布趋势</h4>
          <div class="chart-actions">
            <button 
              v-for="type in chartTypes" 
              :key="type.id"
              :class="['chart-type-btn', { active: activeChartType === type.id }]"
              @click="activeChartType = type.id"
            >
              {{ type.label }}
            </button>
          </div>
        </div>
        
        <div class="chart-content">
          <div v-if="loading" class="chart-loading">
            <div class="spinner"></div>
            <p>加载图表数据中...</p>
          </div>
          
          <div v-else class="chart-placeholder">
            <!-- This would be replaced with actual chart library (Chart.js, etc.) -->
            <div class="mock-chart">
              <svg viewBox="0 0 800 300" class="chart-svg">
                <!-- Mock line chart -->
                <defs>
                  <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#007bff;stop-opacity:0.3" />
                    <stop offset="100%" style="stop-color:#007bff;stop-opacity:0" />
                  </linearGradient>
                </defs>
                
                <!-- Grid lines -->
                <g class="grid">
                  <line v-for="i in 6" :key="`h-${i}`" 
                    :x1="0" :y1="i * 50" :x2="800" :y2="i * 50" 
                    stroke="#f0f0f0" stroke-width="1"/>
                  <line v-for="i in 8" :key="`v-${i}`" 
                    :x1="i * 100" :y1="0" :x2="i * 100" :y2="300" 
                    stroke="#f0f0f0" stroke-width="1"/>
                </g>
                
                <!-- Chart area -->
                <path d="M 0 250 Q 200 200 400 180 T 800 120" 
                  stroke="#007bff" stroke-width="3" fill="url(#chartGradient)"/>
                
                <!-- Data points -->
                <circle v-for="(point, index) in mockDataPoints" :key="index"
                  :cx="point.x" :cy="point.y" r="4" 
                  fill="#007bff" stroke="white" stroke-width="2"/>
              </svg>
            </div>
            
            <div class="chart-legend">
              <div class="legend-item">
                <div class="legend-color" style="background: #007bff;"></div>
                <span>{{ getChartLabel() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="analytics-grid">
        <!-- Top Performing Posts -->
        <div class="analytics-card">
          <div class="card-header">
            <h4>热门文章</h4>
            <span class="card-subtitle">按阅读量排序</span>
          </div>
          
          <div class="top-posts-list">
            <div 
              v-for="(post, index) in topPosts" 
              :key="post.id"
              class="top-post-item"
            >
              <div class="post-rank">{{ index + 1 }}</div>
              
              <div class="post-info">
                <h5 class="post-title">{{ post.title }}</h5>
                <div class="post-meta">
                  <span class="post-date">{{ formatDate(post.createdAt) }}</span>
                  <span class="post-category">{{ getCategoryName(post.category) }}</span>
                </div>
              </div>
              
              <div class="post-stats">
                <div class="stat-item">
                  <i class="fas fa-eye"></i>
                  {{ formatNumber(post.views) }}
                </div>
                <div class="stat-item">
                  <i class="fas fa-heart"></i>
                  {{ formatNumber(post.likes) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Category Performance -->
        <div class="analytics-card">
          <div class="card-header">
            <h4>分类表现</h4>
            <span class="card-subtitle">各分类内容统计</span>
          </div>
          
          <div class="category-stats">
            <div 
              v-for="category in categoryStats" 
              :key="category.name"
              class="category-item"
            >
              <div class="category-info">
                <div class="category-name">{{ category.name }}</div>
                <div class="category-count">{{ category.count }} 篇文章</div>
              </div>
              
              <div class="category-chart">
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    :style="{ width: category.percentage + '%' }"
                  ></div>
                </div>
                <span class="percentage">{{ category.percentage }}%</span>
              </div>
              
              <div class="category-metrics">
                <div class="metric">
                  <span class="metric-value">{{ formatNumber(category.totalViews) }}</span>
                  <span class="metric-label">阅读</span>
                </div>
                <div class="metric">
                  <span class="metric-value">{{ category.avgViews }}</span>
                  <span class="metric-label">平均</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Publishing Activity -->
        <div class="analytics-card">
          <div class="card-header">
            <h4>发布活动</h4>
            <span class="card-subtitle">内容发布频率分析</span>
          </div>
          
          <div class="activity-calendar">
            <div class="calendar-header">
              <div class="month-nav">
                <button @click="previousMonth" class="nav-btn">
                  <i class="fas fa-chevron-left"></i>
                </button>
                <span class="month-year">{{ currentMonthYear }}</span>
                <button @click="nextMonth" class="nav-btn">
                  <i class="fas fa-chevron-right"></i>
                </button>
              </div>
              
              <div class="activity-legend">
                <span>少</span>
                <div class="legend-squares">
                  <div class="legend-square level-0"></div>
                  <div class="legend-square level-1"></div>
                  <div class="legend-square level-2"></div>
                  <div class="legend-square level-3"></div>
                  <div class="legend-square level-4"></div>
                </div>
                <span>多</span>
              </div>
            </div>
            
            <div class="calendar-grid">
              <div 
                v-for="day in calendarDays" 
                :key="day.date"
                :class="['calendar-day', `level-${day.level}`]"
                :title="`${day.date}: ${day.posts} 篇文章`"
              ></div>
            </div>
          </div>
        </div>

        <!-- Engagement Metrics -->
        <div class="analytics-card">
          <div class="card-header">
            <h4>互动指标</h4>
            <span class="card-subtitle">读者参与度分析</span>
          </div>
          
          <div class="engagement-metrics">
            <div class="metric-group">
              <h5>平均数据</h5>
              <div class="metrics-row">
                <div class="metric-card">
                  <div class="metric-icon">
                    <i class="fas fa-eye"></i>
                  </div>
                  <div class="metric-data">
                    <div class="metric-number">{{ engagementMetrics.avgViews }}</div>
                    <div class="metric-title">平均阅读量</div>
                  </div>
                </div>
                
                <div class="metric-card">
                  <div class="metric-icon">
                    <i class="fas fa-clock"></i>
                  </div>
                  <div class="metric-data">
                    <div class="metric-number">{{ engagementMetrics.avgReadTime }}分钟</div>
                    <div class="metric-title">平均阅读时长</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="metric-group">
              <h5>互动率</h5>
              <div class="engagement-rates">
                <div class="rate-item">
                  <div class="rate-label">点赞率</div>
                  <div class="rate-bar">
                    <div 
                      class="rate-fill like-rate" 
                      :style="{ width: engagementMetrics.likeRate + '%' }"
                    ></div>
                  </div>
                  <div class="rate-value">{{ engagementMetrics.likeRate }}%</div>
                </div>
                
                <div class="rate-item">
                  <div class="rate-label">评论率</div>
                  <div class="rate-bar">
                    <div 
                      class="rate-fill comment-rate" 
                      :style="{ width: engagementMetrics.commentRate + '%' }"
                    ></div>
                  </div>
                  <div class="rate-value">{{ engagementMetrics.commentRate }}%</div>
                </div>
                
                <div class="rate-item">
                  <div class="rate-label">分享率</div>
                  <div class="rate-bar">
                    <div 
                      class="rate-fill share-rate" 
                      :style="{ width: engagementMetrics.shareRate + '%' }"
                    ></div>
                  </div>
                  <div class="rate-value">{{ engagementMetrics.shareRate }}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Insights Section -->
    <div class="insights-section">
      <div class="insights-header">
        <h4>智能洞察</h4>
        <p>基于数据分析的内容优化建议</p>
      </div>
      
      <div class="insights-grid">
        <div 
          v-for="insight in insights" 
          :key="insight.id"
          :class="['insight-card', insight.type]"
        >
          <div class="insight-icon">
            <i :class="insight.icon"></i>
          </div>
          
          <div class="insight-content">
            <h5 class="insight-title">{{ insight.title }}</h5>
            <p class="insight-description">{{ insight.description }}</p>
            
            <div v-if="insight.action" class="insight-action">
              <button @click="insight.action" class="insight-btn">
                {{ insight.actionLabel }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Reactive state
const timeRange = ref('30d')
const loading = ref(false)
const activeChartType = ref('posts')
const currentMonth = ref(new Date().getMonth())
const currentYear = ref(new Date().getFullYear())

// Mock data (in real app, this would come from API)
const overviewStats = ref({
  totalPosts: 45,
  postsGrowth: 12,
  totalViews: 12500,
  viewsGrowth: 18,
  totalLikes: 890,
  likesGrowth: 25,
  totalComments: 234,
  commentsGrowth: 15
})

const chartTypes = [
  { id: 'posts', label: '发布量' },
  { id: 'views', label: '阅读量' },
  { id: 'engagement', label: '互动量' }
]

const mockDataPoints = [
  { x: 100, y: 250 },
  { x: 200, y: 200 },
  { x: 300, y: 220 },
  { x: 400, y: 180 },
  { x: 500, y: 160 },
  { x: 600, y: 140 },
  { x: 700, y: 120 }
]

const topPosts = ref([
  {
    id: 1,
    title: 'Vue 3 Composition API 完全指南',
    createdAt: '2025-07-20',
    category: 'TECH',
    views: 2500,
    likes: 89
  },
  {
    id: 2, 
    title: '2025年前端开发趋势预测',
    createdAt: '2025-07-18',
    category: 'TECH',
    views: 1890,
    likes: 67
  },
  {
    id: 3,
    title: '音响设备选购完全攻略',
    createdAt: '2025-07-15',
    category: 'MUSIC',
    views: 1650,
    likes: 54
  },
  {
    id: 4,
    title: '滑雪装备维护保养指南',
    createdAt: '2025-07-12',
    category: 'SKIING',
    views: 1420,
    likes: 43
  },
  {
    id: 5,
    title: '钓鱼技巧：如何选择合适的饵料',
    createdAt: '2025-07-10',
    category: 'FISHING',
    views: 1290,
    likes: 38
  }
])

const categoryStats = ref([
  {
    name: 'TECH - 科技',
    count: 15,
    percentage: 35,
    totalViews: 8500,
    avgViews: 567
  },
  {
    name: 'MUSIC - 音乐',
    count: 12,
    percentage: 28,
    totalViews: 6200,
    avgViews: 517
  },
  {
    name: 'SKIING - 滑雪',
    count: 8,
    percentage: 19,
    totalViews: 4100,
    avgViews: 513
  },
  {
    name: 'FISHING - 钓鱼',
    count: 6,
    percentage: 14,
    totalViews: 2800,
    avgViews: 467
  },
  {
    name: 'BLOG - 博客',
    count: 4,
    percentage: 9,
    totalViews: 1900,
    avgViews: 475
  }
])

const engagementMetrics = ref({
  avgViews: 485,
  avgReadTime: 3.2,
  likeRate: 7.2,
  commentRate: 2.8,
  shareRate: 1.5
})

const insights = ref([
  {
    id: 1,
    type: 'success',
    icon: 'fas fa-lightbulb',
    title: '内容质量优秀',
    description: '您的文章平均阅读时长为3.2分钟，高于行业平均水平2.1分钟，说明内容深度和质量都很好。',
    action: null,
    actionLabel: null
  },
  {
    id: 2,
    type: 'warning',
    icon: 'fas fa-chart-line',
    title: '发布频率可以提升',
    description: '建议保持每周2-3篇的发布频率，这样可以更好地保持读者关注度和提升SEO排名。',
    action: () => console.log('Create posting schedule'),
    actionLabel: '制定发布计划'
  },
  {
    id: 3,
    type: 'info',
    icon: 'fas fa-users',
    title: '社交互动有待加强',
    description: '可以尝试在文章末尾添加引导性问题，鼓励读者评论和分享，提升内容互动率。',
    action: () => console.log('Improve engagement'),
    actionLabel: '查看建议'
  },
  {
    id: 4,
    type: 'success',
    icon: 'fas fa-trophy',
    title: '技术类文章表现突出',
    description: '您的技术类文章平均阅读量最高，建议继续深耕这个领域，可以考虑制作系列文章。',
    action: () => console.log('Create tech series'),
    actionLabel: '规划系列'
  }
])

// Computed properties
const currentMonthYear = computed(() => {
  const date = new Date(currentYear.value, currentMonth.value)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })
})

const calendarDays = computed(() => {
  const daysInMonth = new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
  const days = []
  
  for (let i = 1; i <= daysInMonth; i++) {
    const posts = Math.floor(Math.random() * 5) // Mock data
    const level = posts === 0 ? 0 : Math.min(Math.ceil(posts / 1), 4)
    
    days.push({
      date: `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
      posts,
      level
    })
  }
  
  return days
})

// Methods
const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric'
  })
}

const getCategoryName = (category) => {
  const categoryMap = {
    'MUSIC': 'MUSIC',
    'TECH': 'TECH',
    'SKIING': 'SKIING',
    'FISHING': 'FISHING',
    'GAMING': 'GAMING',
    'BLOG': 'BLOG',
    'NEWS': 'NEWS',
    'PODCAST': 'PODCAST'
  }
  return categoryMap[category] || category
}

const getChartLabel = () => {
  const labelMap = {
    'posts': '文章发布量',
    'views': '文章阅读量',
    'engagement': '用户互动量'
  }
  return labelMap[activeChartType.value] || '数据'
}

const previousMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

const exportReport = () => {
  // Generate and download analytics report
  const reportData = {
    timeRange: timeRange.value,
    overview: overviewStats.value,
    topPosts: topPosts.value,
    categoryStats: categoryStats.value,
    engagement: engagementMetrics.value,
    insights: insights.value,
    generatedAt: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(reportData, null, 2)], {
    type: 'application/json'
  })
  
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `analytics-report-${timeRange.value}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Watchers
watch(timeRange, (newRange) => {
  // Reload data when time range changes
  console.log('Time range changed to:', newRange)
  // In real app, this would trigger API call
})

watch(activeChartType, (newType) => {
  // Update chart when type changes
  console.log('Chart type changed to:', newType)
  // In real app, this would update chart data
})
</script>

<style scoped>
.post-analytics {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.analytics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.header-left h3 {
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: 600;
  color: #212529;
}

.header-left p {
  margin: 0;
  color: #6c757d;
  font-size: 14px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.time-range-select {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: #0056b3;
}

/* Overview Stats */
.overview-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  padding: 32px;
  border-bottom: 1px solid #e9ecef;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

.stat-icon {
  width: 48px;
  height: 48px;
  background: #007bff;
  color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #212529;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 4px;
}

.stat-change {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
}

.stat-change.positive {
  color: #28a745;
}

.stat-change.negative {
  color: #dc3545;
}

/* Charts Section */
.charts-section {
  padding: 32px;
}

.chart-container {
  margin-bottom: 32px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.chart-header h4 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #212529;
}

.chart-actions {
  display: flex;
  gap: 4px;
}

.chart-type-btn {
  padding: 8px 16px;
  border: 1px solid #ced4da;
  background: white;
  color: #495057;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.chart-type-btn:hover {
  background: #f8f9fa;
}

.chart-type-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.chart-content {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 24px;
  min-height: 350px;
}

.chart-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  gap: 16px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.chart-placeholder {
  height: 100%;
}

.mock-chart {
  margin-bottom: 16px;
}

.chart-svg {
  width: 100%;
  height: 300px;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 24px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #495057;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

/* Analytics Grid */
.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.analytics-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
}

.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.card-header h4 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: #212529;
}

.card-subtitle {
  font-size: 14px;
  color: #6c757d;
}

/* Top Posts */
.top-posts-list {
  padding: 16px;
}

.top-post-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.top-post-item:hover {
  background: #f8f9fa;
}

.post-rank {
  width: 32px;
  height: 32px;
  background: #007bff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.post-info {
  flex: 1;
  min-width: 0;
}

.post-title {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 500;
  color: #212529;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #6c757d;
}

.post-stats {
  display: flex;
  gap: 16px;
  flex-shrink: 0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6c757d;
}

/* Category Stats */
.category-stats {
  padding: 16px;
}

.category-item {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 16px;
  align-items: center;
  padding: 16px;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.category-item:hover {
  background: #f8f9fa;
}

.category-name {
  font-weight: 500;
  color: #212529;
  font-size: 14px;
}

.category-count {
  font-size: 12px;
  color: #6c757d;
}

.category-chart {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-bar {
  width: 100px;
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #007bff;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.percentage {
  font-size: 12px;
  color: #495057;
  font-weight: 500;
}

.category-metrics {
  display: flex;
  gap: 12px;
}

.metric {
  text-align: center;
}

.metric-value {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #212529;
}

.metric-label {
  font-size: 11px;
  color: #6c757d;
}

/* Activity Calendar */
.activity-calendar {
  padding: 16px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.month-nav {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-btn {
  width: 28px;
  height: 28px;
  border: 1px solid #ced4da;
  background: white;
  color: #495057;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.nav-btn:hover {
  background: #f8f9fa;
}

.month-year {
  font-weight: 500;
  color: #212529;
  font-size: 14px;
}

.activity-legend {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #6c757d;
}

.legend-squares {
  display: flex;
  gap: 2px;
}

.legend-square {
  width: 10px;
  height: 10px;
  border-radius: 2px;
}

.legend-square.level-0 { background: #ebedf0; }
.legend-square.level-1 { background: #c6e48b; }
.legend-square.level-2 { background: #7bc96f; }
.legend-square.level-3 { background: #239a3b; }
.legend-square.level-4 { background: #196127; }

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.calendar-day {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  cursor: pointer;
}

.calendar-day.level-0 { background: #ebedf0; }
.calendar-day.level-1 { background: #c6e48b; }
.calendar-day.level-2 { background: #7bc96f; }
.calendar-day.level-3 { background: #239a3b; }
.calendar-day.level-4 { background: #196127; }

/* Engagement Metrics */
.engagement-metrics {
  padding: 16px;
}

.metric-group {
  margin-bottom: 24px;
}

.metric-group h5 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #495057;
}

.metrics-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.metric-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
}

.metric-icon {
  width: 36px;
  height: 36px;
  background: #007bff;
  color: white;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.metric-number {
  font-size: 20px;
  font-weight: 600;
  color: #212529;
}

.metric-title {
  font-size: 12px;
  color: #6c757d;
}

.engagement-rates {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rate-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rate-label {
  width: 60px;
  font-size: 12px;
  color: #495057;
  font-weight: 500;
}

.rate-bar {
  flex: 1;
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.rate-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.rate-fill.like-rate { background: #28a745; }
.rate-fill.comment-rate { background: #ffc107; }
.rate-fill.share-rate { background: #17a2b8; }

.rate-value {
  width: 40px;
  text-align: right;
  font-size: 12px;
  color: #495057;
  font-weight: 500;
}

/* Insights Section */
.insights-section {
  padding: 32px;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
}

.insights-header {
  text-align: center;
  margin-bottom: 32px;
}

.insights-header h4 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #212529;
}

.insights-header p {
  margin: 0;
  color: #6c757d;
  font-size: 16px;
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.insight-card {
  display: flex;
  gap: 16px;
  padding: 24px;
  background: white;
  border-radius: 8px;
  border-left: 4px solid #007bff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.insight-card.success {
  border-left-color: #28a745;
}

.insight-card.warning {
  border-left-color: #ffc107;
}

.insight-card.info {
  border-left-color: #17a2b8;
}

.insight-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.insight-card.success .insight-icon {
  background: #d4edda;
  color: #155724;
}

.insight-card.warning .insight-icon {
  background: #fff3cd;
  color: #856404;
}

.insight-card.info .insight-icon {
  background: #d1ecf1;
  color: #0c5460;
}

.insight-content {
  flex: 1;
}

.insight-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #212529;
}

.insight-description {
  margin: 0 0 16px 0;
  color: #6c757d;
  font-size: 14px;
  line-height: 1.5;
}

.insight-action {
  margin-top: 12px;
}

.insight-btn {
  padding: 6px 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.insight-btn:hover {
  background: #0056b3;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .analytics-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
    padding: 20px;
  }

  .header-actions {
    justify-content: space-between;
  }

  .overview-stats {
    grid-template-columns: 1fr;
    padding: 20px;
    gap: 16px;
  }

  .charts-section {
    padding: 20px;
  }

  .chart-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .chart-actions {
    justify-content: center;
  }

  .analytics-grid {
    grid-template-columns: 1fr;
  }

  .metrics-row {
    grid-template-columns: 1fr;
  }

  .insights-grid {
    grid-template-columns: 1fr;
  }

  .insight-card {
    flex-direction: column;
    text-align: center;
  }

  .category-item {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .category-chart {
    justify-content: space-between;
  }

  .calendar-grid {
    grid-template-columns: repeat(7, 1fr);
    gap: 1px;
  }

  .calendar-day {
    width: 10px;
    height: 10px;
  }
}
</style>