<template>
  <div class="rich-text-editor">
    <div class="editor-toolbar">
      <div class="toolbar-section">
        <button @click="toggleBold" :class="{ active: isBold }" class="toolbar-btn">
          <strong>B</strong>
        </button>
        <button @click="toggleItalic" :class="{ active: isItalic }" class="toolbar-btn">
          <em>I</em>
        </button>
        <button @click="toggleUnderline" :class="{ active: isUnderline }" class="toolbar-btn">
          <u>U</u>
        </button>
      </div>

      <div class="toolbar-section">
        <button @click="insertHeading(1)" class="toolbar-btn">H1</button>
        <button @click="insertHeading(2)" class="toolbar-btn">H2</button>
        <button @click="insertHeading(3)" class="toolbar-btn">H3</button>
      </div>

      <div class="toolbar-section">
        <button @click="insertList('ul')" class="toolbar-btn">• List</button>
        <button @click="insertList('ol')" class="toolbar-btn">1. List</button>
        <button @click="insertLink" class="toolbar-btn">🔗 Link</button>
      </div>

      <div class="toolbar-section">
        <button @click="showImageModal = true" class="toolbar-btn highlight">
          🖼️ 图片
        </button>
        <button @click="showExternalImageModal = true" class="toolbar-btn highlight">
          🌐 第三方图片
        </button>
        <button @click="insertCodeBlock" class="toolbar-btn">
          &lt;/&gt; Code
        </button>
      </div>

      <div class="toolbar-section">
        <button @click="undo" :disabled="!canUndo" class="toolbar-btn">↶</button>
        <button @click="redo" :disabled="!canRedo" class="toolbar-btn">↷</button>
      </div>
    </div>

    <div 
      ref="editorContent"
      class="editor-content"
      contenteditable="true"
      @input="onInput"
      @paste="onPaste"
      @keydown="onKeyDown"
      @selectionchange="updateToolbarState"
      :placeholder="placeholder"
    ></div>

    <!-- Image Upload Modal -->
    <div v-if="showImageModal" class="modal-overlay" @click.self="showImageModal = false">
      <div class="modal-content">
        <ImagePicker
          placeholder="选择文章图片"
          @close="showImageModal = false"
          @confirm="insertLocalImage"
        />
      </div>
    </div>

    <!-- External Image Modal -->
    <div v-if="showExternalImageModal" class="modal-overlay" @click.self="showExternalImageModal = false">
      <div class="modal-content">
        <ExternalImagePicker
          @close="showExternalImageModal = false"
          @confirm="insertExternalImage"
        />
      </div>
    </div>

    <!-- Link Modal -->
    <div v-if="showLinkModal" class="modal-overlay" @click.self="showLinkModal = false">
      <div class="modal-content small">
        <div class="link-form">
          <h3>添加链接</h3>
          <div class="form-group">
            <label>链接文本:</label>
            <input v-model="linkForm.text" type="text" placeholder="显示文本" />
          </div>
          <div class="form-group">
            <label>链接地址:</label>
            <input v-model="linkForm.url" type="url" placeholder="https://example.com" />
          </div>
          <div class="form-actions">
            <button @click="showLinkModal = false" class="btn-cancel">取消</button>
            <button @click="confirmLink" class="btn-confirm">添加</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Word/Character Count -->
    <div class="editor-footer">
      <span class="word-count">{{ wordCount }} 字</span>
      <span class="char-count">{{ charCount }} 字符</span>
    </div>
  </div>
</template>

<script setup>
import ImagePicker from './ImagePicker.vue'
import ExternalImagePicker from './ExternalImagePicker.vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '开始写作...'
  }
})

const emit = defineEmits(['update:modelValue'])

// Reactive state
const editorContent = ref(null)
const showImageModal = ref(false)
const showExternalImageModal = ref(false)
const showLinkModal = ref(false)
const isBold = ref(false)
const isItalic = ref(false)
const isUnderline = ref(false)
const canUndo = ref(false)
const canRedo = ref(false)
const history = ref([])
const historyIndex = ref(-1)

// Link form
const linkForm = ref({
  text: '',
  url: ''
})

// Computed properties
const content = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const wordCount = computed(() => {
  const text = editorContent.value?.textContent || ''
  return text.replace(/\s+/g, '').length
})

const charCount = computed(() => {
  const text = editorContent.value?.textContent || ''
  return text.length
})

// Methods
const onInput = () => {
  if (editorContent.value) {
    content.value = editorContent.value.innerHTML
    saveToHistory()
    updateWordCount()
  }
}

const onPaste = (event) => {
  event.preventDefault()
  
  const clipboardData = event.clipboardData
  const items = clipboardData.items
  
  // Check if pasted content contains images
  for (let item of items) {
    if (item.type.indexOf('image') !== -1) {
      const file = item.getAsFile()
      if (file) {
        handleImageFile(file)
        return
      }
    }
  }
  
  // Handle text paste
  const text = clipboardData.getData('text/plain')
  document.execCommand('insertText', false, text)
}

const onKeyDown = (event) => {
  // Handle keyboard shortcuts
  if (event.ctrlKey || event.metaKey) {
    switch (event.key) {
      case 'b':
        event.preventDefault()
        toggleBold()
        break
      case 'i':
        event.preventDefault()
        toggleItalic()
        break
      case 'u':
        event.preventDefault()
        toggleUnderline()
        break
      case 'z':
        event.preventDefault()
        if (event.shiftKey) {
          redo()
        } else {
          undo()
        }
        break
      case 'k':
        event.preventDefault()
        insertLink()
        break
    }
  }
  
  // Auto-save on certain keys
  if (['Enter', 'Space', 'Backspace', 'Delete'].includes(event.code)) {
    nextTick(() => {
      saveToHistory()
    })
  }
}

const updateToolbarState = () => {
  if (document.getSelection) {
    isBold.value = document.queryCommandState('bold')
    isItalic.value = document.queryCommandState('italic')
    isUnderline.value = document.queryCommandState('underline')
    canUndo.value = historyIndex.value > 0
    canRedo.value = historyIndex.value < history.value.length - 1
  }
}

const saveToHistory = () => {
  if (!editorContent.value) return
  
  const currentContent = editorContent.value.innerHTML
  
  // Don't save if content hasn't changed
  if (history.value[historyIndex.value] === currentContent) return
  
  // Remove any history after current index
  history.value = history.value.slice(0, historyIndex.value + 1)
  
  // Add new state
  history.value.push(currentContent)
  historyIndex.value++
  
  // Limit history size
  if (history.value.length > 50) {
    history.value.shift()
    historyIndex.value--
  }
}

// Toolbar commands
const toggleBold = () => {
  document.execCommand('bold')
  updateToolbarState()
  onInput()
}

const toggleItalic = () => {
  document.execCommand('italic')
  updateToolbarState()
  onInput()
}

const toggleUnderline = () => {
  document.execCommand('underline')
  updateToolbarState()
  onInput()
}

const insertHeading = (level) => {
  document.execCommand('formatBlock', false, `h${level}`)
  onInput()
}

const insertList = (type) => {
  const command = type === 'ul' ? 'insertUnorderedList' : 'insertOrderedList'
  document.execCommand(command)
  onInput()
}

const insertLink = () => {
  const selection = document.getSelection()
  linkForm.value.text = selection.toString() || ''
  linkForm.value.url = ''
  showLinkModal.value = true
}

const confirmLink = () => {
  if (!linkForm.value.url) return
  
  const text = linkForm.value.text || linkForm.value.url
  const html = `<a href="${linkForm.value.url}" target="_blank" rel="noopener noreferrer">${text}</a>`
  
  document.execCommand('insertHTML', false, html)
  showLinkModal.value = false
  onInput()
}

const insertCodeBlock = () => {
  const selection = document.getSelection()
  const selectedText = selection.toString()
  
  let html
  if (selectedText.includes('\n')) {
    // Multi-line code block
    html = `<pre><code>${selectedText || '// 在这里输入代码'}</code></pre>`
  } else {
    // Inline code
    html = `<code>${selectedText || 'code'}</code>`
  }
  
  document.execCommand('insertHTML', false, html)
  onInput()
}

const insertLocalImage = (imagePath) => {
  const html = `<img src="${imagePath}" alt="Image" style="max-width: 100%; height: auto; margin: 16px 0;" />`
  document.execCommand('insertHTML', false, html)
  showImageModal.value = false
  onInput()
}

const insertExternalImage = (imageData) => {
  const { url, alt, title } = imageData
  const titleAttr = title ? ` title="${title}"` : ''
  const html = `<figure style="margin: 24px 0; text-align: center;">
    <img src="${url}" alt="${alt}"${titleAttr} style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />
    ${title ? `<figcaption style="margin-top: 8px; font-size: 14px; color: #666;">${title}</figcaption>` : ''}
    <div style="font-size: 12px; color: #999; margin-top: 4px;">📍 第三方图片</div>
  </figure>`
  
  document.execCommand('insertHTML', false, html)
  showExternalImageModal.value = false
  onInput()
}

const handleImageFile = async (file) => {
  // This would typically upload the file first
  // For now, we'll show the image picker modal
  showImageModal.value = true
}

const undo = () => {
  if (historyIndex.value > 0) {
    historyIndex.value--
    editorContent.value.innerHTML = history.value[historyIndex.value]
    content.value = history.value[historyIndex.value]
    updateToolbarState()
  }
}

const redo = () => {
  if (historyIndex.value < history.value.length - 1) {
    historyIndex.value++
    editorContent.value.innerHTML = history.value[historyIndex.value]
    content.value = history.value[historyIndex.value]
    updateToolbarState()
  }
}

const updateWordCount = () => {
  // Trigger reactivity for computed properties
  nextTick(() => {
    // Force update
  })
}

// Watchers
watch(() => props.modelValue, (newValue) => {
  if (editorContent.value && editorContent.value.innerHTML !== newValue) {
    editorContent.value.innerHTML = newValue
    saveToHistory()
  }
})

// Lifecycle
onMounted(() => {
  if (editorContent.value) {
    editorContent.value.innerHTML = props.modelValue
    saveToHistory()
    
    // Add event listeners
    document.addEventListener('selectionchange', updateToolbarState)
  }
})

onUnmounted(() => {
  document.removeEventListener('selectionchange', updateToolbarState)
})
</script>

<style scoped>
.rich-text-editor {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px;
  background: #f8f9fa;
  border-bottom: 1px solid #ddd;
}

.toolbar-section {
  display: flex;
  gap: 4px;
  padding-right: 8px;
  border-right: 1px solid #ddd;
}

.toolbar-section:last-child {
  border-right: none;
}

.toolbar-btn {
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 36px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toolbar-btn:hover {
  background: #e9ecef;
  border-color: #007bff;
}

.toolbar-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.toolbar-btn.highlight {
  background: #28a745;
  color: white;
  border-color: #28a745;
}

.toolbar-btn.highlight:hover {
  background: #218838;
}

.toolbar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.editor-content {
  min-height: 300px;
  padding: 20px;
  font-size: 16px;
  line-height: 1.6;
  outline: none;
  overflow-wrap: break-word;
}

.editor-content:empty::before {
  content: attr(placeholder);
  color: #999;
  pointer-events: none;
}

.editor-content h1 {
  font-size: 28px;
  margin: 24px 0 16px 0;
  font-weight: 700;
  color: #333;
}

.editor-content h2 {
  font-size: 24px;
  margin: 20px 0 14px 0;
  font-weight: 600;
  color: #333;
}

.editor-content h3 {
  font-size: 20px;
  margin: 18px 0 12px 0;
  font-weight: 600;
  color: #333;
}

.editor-content p {
  margin: 12px 0;
}

.editor-content ul, .editor-content ol {
  margin: 16px 0;
  padding-left: 24px;
}

.editor-content li {
  margin: 8px 0;
}

.editor-content code {
  background: #f8f9fa;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  color: #e83e8c;
}

.editor-content pre {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 6px;
  margin: 16px 0;
  overflow-x: auto;
  border: 1px solid #e9ecef;
}

.editor-content pre code {
  background: none;
  padding: 0;
  color: #333;
}

.editor-content a {
  color: #007bff;
  text-decoration: underline;
}

.editor-content img {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
  margin: 16px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.editor-content figure {
  margin: 24px 0;
  text-align: center;
}

.editor-content figcaption {
  margin-top: 8px;
  font-size: 14px;
  color: #666;
  font-style: italic;
}

.editor-footer {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-top: 1px solid #ddd;
  font-size: 12px;
  color: #666;
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
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content.small {
  max-width: 500px;
}

.link-form {
  padding: 24px;
}

.link-form h3 {
  margin: 0 0 16px 0;
  color: #333;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.btn-cancel, .btn-confirm {
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel {
  background: #f8f9fa;
  color: #333;
  border: 1px solid #ddd;
}

.btn-confirm {
  background: #007bff;
  color: white;
}

.btn-cancel:hover {
  background: #e9ecef;
}

.btn-confirm:hover {
  background: #0056b3;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .editor-toolbar {
    padding: 8px;
    gap: 4px;
  }
  
  .toolbar-section {
    padding-right: 4px;
  }
  
  .toolbar-btn {
    padding: 6px 8px;
    font-size: 12px;
    min-width: 32px;
    height: 28px;
  }
  
  .editor-content {
    padding: 16px;
    font-size: 14px;
  }
  
  .modal-content {
    margin: 10px;
    max-height: calc(100vh - 20px);
  }
}
</style>