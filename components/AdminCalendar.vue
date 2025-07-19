<template>
  <div class="admin-calendar">
    <div class="calendar-header">
      <h2>日历管理</h2>
      <button @click="showEventForm = true" class="btn-primary">
        📅 添加事件
      </button>
    </div>

    <div class="calendar-content">
      <!-- Calendar View -->
      <div class="calendar-view">
        <div class="calendar-nav">
          <button @click="prevMonth" class="nav-btn">‹</button>
          <h3 class="current-month">{{ formatMonth(currentDate) }}</h3>
          <button @click="nextMonth" class="nav-btn">›</button>
        </div>

        <div class="calendar-grid">
          <div class="weekdays">
            <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
          </div>
          
          <div class="days">
            <div
              v-for="date in calendarDays"
              :key="date.key"
              :class="['day', {
                'other-month': !date.isCurrentMonth,
                'today': date.isToday,
                'has-events': date.events.length > 0
              }]"
              @click="selectDate(date.date)"
            >
              <span class="day-number">{{ date.day }}</span>
              <div v-if="date.events.length > 0" class="event-dots">
                <div
                  v-for="event in date.events.slice(0, 3)"
                  :key="event.id"
                  class="event-dot"
                  :style="{ backgroundColor: event.color }"
                ></div>
                <div v-if="date.events.length > 3" class="more-events">
                  +{{ date.events.length - 3 }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Events List -->
      <div class="events-sidebar">
        <h3>{{ selectedDate ? formatDate(selectedDate) : '所有事件' }}</h3>
        
        <div class="events-list">
          <div v-if="filteredEvents.length === 0" class="no-events">
            暂无事件
          </div>
          
          <div v-for="event in filteredEvents" :key="event.id" class="event-item">
            <div class="event-color" :style="{ backgroundColor: event.color }"></div>
            <div class="event-content">
              <h4 class="event-title">{{ event.title }}</h4>
              <p class="event-description">{{ event.description }}</p>
              <p class="event-date">{{ formatEventDate(event.date) }}</p>
              <div class="event-actions">
                <button @click="editEvent(event)" class="btn-edit">编辑</button>
                <button @click="deleteEvent(event.id)" class="btn-delete">删除</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Event Form Modal -->
    <div v-if="showEventForm" class="modal-overlay" @click.self="closeEventForm">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ editingEvent ? '编辑事件' : '添加事件' }}</h3>
          <button @click="closeEventForm" class="close-btn">×</button>
        </div>

        <form @submit.prevent="saveEvent" class="event-form">
          <div class="form-group">
            <label>标题</label>
            <input
              v-model="eventForm.title"
              type="text"
              class="form-input"
              placeholder="事件标题"
              required
            >
          </div>

          <div class="form-group">
            <label>描述</label>
            <textarea
              v-model="eventForm.description"
              class="form-textarea"
              placeholder="事件描述（可选）"
              rows="3"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>日期</label>
              <input
                v-model="eventForm.date"
                type="date"
                class="form-input"
                required
              >
            </div>

            <div class="form-group">
              <label>类型</label>
              <select v-model="eventForm.type" class="form-select">
                <option value="event">事件</option>
                <option value="birthday">生日</option>
                <option value="reminder">提醒</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>颜色</label>
            <div class="color-picker">
              <div
                v-for="color in eventColors"
                :key="color"
                :class="['color-option', { active: eventForm.color === color }]"
                :style="{ backgroundColor: color }"
                @click="eventForm.color = color"
              ></div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeEventForm" class="btn-cancel">
              取消
            </button>
            <button type="submit" class="btn-primary">
              {{ editingEvent ? '更新' : '添加' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
const currentDate = ref(new Date())
const selectedDate = ref(null)
const events = ref([])
const showEventForm = ref(false)
const editingEvent = ref(null)

const eventForm = reactive({
  title: '',
  description: '',
  date: '',
  type: 'event',
  color: '#007bff'
})

const weekdays = ['日', '一', '二', '三', '四', '五', '六']
const eventColors = ['#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8', '#6c757d', '#e83e8c']

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())

  const days = []
  const today = new Date()
  
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    
    const dateStr = date.toISOString().split('T')[0]
    const dayEvents = events.value.filter(event => 
      event.date.split('T')[0] === dateStr
    )
    
    days.push({
      key: dateStr,
      date: new Date(date),
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
      isToday: date.toDateString() === today.toDateString(),
      events: dayEvents
    })
  }
  
  return days
})

const filteredEvents = computed(() => {
  if (!selectedDate.value) return events.value
  
  const dateStr = selectedDate.value.toISOString().split('T')[0]
  return events.value.filter(event => 
    event.date.split('T')[0] === dateStr
  )
})

const loadEvents = async () => {
  try {
    const { data } = await $fetch('/api/admin/calendar')
    events.value = data
  } catch (error) {
    console.error('Failed to load events:', error)
  }
}

const prevMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1)
}

const selectDate = (date) => {
  selectedDate.value = date
}

const editEvent = (event) => {
  editingEvent.value = event
  Object.assign(eventForm, {
    title: event.title,
    description: event.description || '',
    date: event.date.split('T')[0],
    type: event.type,
    color: event.color
  })
  showEventForm.value = true
}

const closeEventForm = () => {
  showEventForm.value = false
  editingEvent.value = null
  Object.assign(eventForm, {
    title: '',
    description: '',
    date: '',
    type: 'event',
    color: '#007bff'
  })
}

const saveEvent = async () => {
  try {
    const eventData = {
      ...eventForm,
      date: new Date(eventForm.date).toISOString()
    }

    if (editingEvent.value) {
      await $fetch(`/api/admin/calendar/${editingEvent.value.id}`, {
        method: 'PUT',
        body: eventData
      })
    } else {
      await $fetch('/api/admin/calendar', {
        method: 'POST',
        body: eventData
      })
    }

    closeEventForm()
    loadEvents()
  } catch (error) {
    console.error('Failed to save event:', error)
    alert('保存失败，请重试')
  }
}

const deleteEvent = async (id) => {
  if (!confirm('确定要删除这个事件吗？')) return

  try {
    await $fetch(`/api/admin/calendar/${id}`, {
      method: 'DELETE'
    })
    loadEvents()
  } catch (error) {
    console.error('Failed to delete event:', error)
    alert('删除失败，请重试')
  }
}

const formatMonth = (date) => {
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })
}

const formatDate = (date) => {
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

const formatEventDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

onMounted(() => {
  loadEvents()
  
  // Set default date for new events
  if (selectedDate.value) {
    eventForm.date = selectedDate.value.toISOString().split('T')[0]
  } else {
    eventForm.date = new Date().toISOString().split('T')[0]
  }
})

watch(selectedDate, (newDate) => {
  if (newDate && showEventForm.value && !editingEvent.value) {
    eventForm.date = newDate.toISOString().split('T')[0]
  }
})
</script>

<style scoped>
.admin-calendar {
  max-width: 1200px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.calendar-header h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.btn-primary {
  padding: 10px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.calendar-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

.calendar-view {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.calendar-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.nav-btn {
  background: none;
  border: 1px solid #ddd;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.current-month {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.calendar-grid {
  border: 1px solid #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #f8f9fa;
}

.weekday {
  padding: 8px;
  text-align: center;
  font-weight: 500;
  color: #666;
  border-right: 1px solid #e9ecef;
}

.weekday:last-child {
  border-right: none;
}

.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.day {
  min-height: 80px;
  padding: 6px;
  border-right: 1px solid #e9ecef;
  border-bottom: 1px solid #e9ecef;
  cursor: pointer;
  transition: background 0.2s ease;
}

.day:hover {
  background: #f8f9fa;
}

.day:nth-child(7n) {
  border-right: none;
}

.day.other-month {
  color: #999;
  background: #fafafa;
}

.day.today {
  background: #e3f2fd;
}

.day.has-events {
  background: #fff3e0;
}

.day-number {
  font-weight: 500;
  display: block;
  margin-bottom: 4px;
}

.event-dots {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
}

.event-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.more-events {
  font-size: 10px;
  color: #666;
  margin-left: 2px;
}

.events-sidebar {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.events-sidebar h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #333;
}

.events-list {
  max-height: 400px;
  overflow-y: auto;
}

.no-events {
  text-align: center;
  color: #666;
  padding: 20px;
}

.event-item {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.event-item:last-child {
  border-bottom: none;
}

.event-color {
  width: 4px;
  border-radius: 2px;
  flex-shrink: 0;
}

.event-content {
  flex: 1;
}

.event-title {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #333;
}

.event-description {
  margin: 0 0 4px 0;
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

.event-date {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #999;
}

.event-actions {
  display: flex;
  gap: 6px;
}

.btn-edit, .btn-delete {
  padding: 2px 6px;
  border: none;
  border-radius: 3px;
  font-size: 11px;
  cursor: pointer;
}

.btn-edit {
  background: #17a2b8;
  color: white;
}

.btn-delete {
  background: #dc3545;
  color: white;
}

/* Modal Styles */
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
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
}

.event-form {
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

.form-input, .form-textarea, .form-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.color-picker {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.color-option {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  border: 2px solid transparent;
}

.color-option.active {
  border-color: #333;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.btn-cancel {
  padding: 8px 16px;
  background: #f8f9fa;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .calendar-content {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .day {
    min-height: 60px;
    font-size: 12px;
  }
}
</style>