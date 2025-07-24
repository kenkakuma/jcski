<template>
  <div class="advanced-rich-editor">
    <!-- Editor Toolbar -->
    <div class="editor-toolbar">
      <!-- Text Formatting -->
      <div class="toolbar-group">
        <button 
          v-for="format in textFormats" 
          :key="format.command"
          @click="execCommand(format.command, format.value)"
          :class="['toolbar-btn', { active: isActive(format.command) }]"
          :title="format.title"
        >
          <i :class="format.icon"></i>
        </button>
      </div>

      <!-- Headings -->
      <div class="toolbar-group">
        <select @change="applyHeading($event)" class="heading-select">
          <option value="">段落格式</option>
          <option value="h1">标题 1</option>
          <option value="h2">标题 2</option>
          <option value="h3">标题 3</option>
          <option value="h4">标题 4</option>
        </select>
      </div>

      <!-- Lists and Blocks -->
      <div class="toolbar-group">
        <button @click="execCommand('insertUnorderedList')" class="toolbar-btn" title="无序列表">
          <i class="fas fa-list-ul"></i>
        </button>
        <button @click="execCommand('insertOrderedList')" class="toolbar-btn" title="有序列表">
          <i class="fas fa-list-ol"></i>
        </button>
        <button @click="insertBlockquote" class="toolbar-btn" title="引用">
          <i class="fas fa-quote-right"></i>
        </button>
        <button @click="insertCodeBlock" class="toolbar-btn" title="代码块">
          <i class="fas fa-code"></i>
        </button>
      </div>

      <!-- Media and Links -->
      <div class="toolbar-group">
        <button @click="showLinkDialog = true" class="toolbar-btn" title="插入链接">
          <i class="fas fa-link"></i>
        </button>
        <button @click="showImagePicker = true" class="toolbar-btn" title="插入图片">
          <i class="fas fa-image"></i>
        </button>
        <button @click="insertTable" class="toolbar-btn" title="插入表格">
          <i class="fas fa-table"></i>
        </button>
        <button @click="insertHorizontalRule" class="toolbar-btn" title="分隔线">
          <i class="fas fa-minus"></i>
        </button>
      </div>

      <!-- Undo/Redo -->
      <div class="toolbar-group">
        <button @click="undo" :disabled="!canUndo" class="toolbar-btn" title="撤销">
          <i class="fas fa-undo"></i>
        </button>
        <button @click="redo" :disabled="!canRedo" class="toolbar-btn" title="重做">
          <i class="fas fa-redo"></i>
        </button>
      </div>

      <!-- Word Count -->
      <div class="toolbar-group word-count">
        <span>{{ wordCount }} 字</span>
      </div>
    </div>

    <!-- Editor Content -->
    <div 
      ref="editorElement"
      class="editor-content"
      contenteditable="true"
      @input="handleInput"
      @paste="handlePaste"
      @keydown="handleKeydown"
      @focus="updateToolbarState"
      @blur="updateToolbarState"
      :placeholder="placeholder"
    ></div>

    <!-- Link Dialog -->
    <div v-if="showLinkDialog" class="modal-overlay" @click.self="showLinkDialog = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>插入链接</h3>
          <button @click="showLinkDialog = false" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>链接文本</label>
            <input 
              v-model="linkForm.text" 
              type="text" 
              placeholder="显示文本"
              class="form-input"
            >
          </div>
          <div class="form-group">
            <label>链接地址</label>
            <input 
              v-model="linkForm.url" 
              type="url" 
              placeholder="https://example.com"
              class="form-input"
            >
          </div>
          <div class="form-group">
            <label>
              <input v-model="linkForm.newTab" type="checkbox"> 
              在新窗口中打开
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showLinkDialog = false" class="btn-cancel">取消</button>
          <button @click="insertLink" class="btn-primary">插入</button>
        </div>
      </div>
    </div>

    <!-- Image Picker -->
    <AdvancedImagePicker 
      v-if="showImagePicker"
      @close="showImagePicker = false"
      @insert="insertImage"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '开始写作...'
  },
  minHeight: {
    type: String,
    default: '400px'
  }
})

const emit = defineEmits(['update:modelValue', 'word-count-change'])

// Reactive state
const editorElement = ref(null)
const showLinkDialog = ref(false)
const showImagePicker = ref(false)
const canUndo = ref(false)
const canRedo = ref(false)
const wordCount = ref(0)

// Form data
const linkForm = reactive({
  text: '',
  url: '',
  newTab: true
})

// Text formatting options
const textFormats = [
  { command: 'bold', icon: 'fas fa-bold', title: '粗体' },
  { command: 'italic', icon: 'fas fa-italic', title: '斜体' },
  { command: 'underline', icon: 'fas fa-underline', title: '下划线' },
  { command: 'strikeThrough', icon: 'fas fa-strikethrough', title: '删除线' },
  { command: 'superscript', icon: 'fas fa-superscript', title: '上标' },
  { command: 'subscript', icon: 'fas fa-subscript', title: '下标' }
]

// Computed
const content = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Methods
const handleInput = () => {
  if (editorElement.value) {
    content.value = editorElement.value.innerHTML
    updateWordCount()
    updateToolbarState()
  }
}

const handlePaste = (event) => {
  // Handle paste events
  event.preventDefault()
  
  const clipboardData = event.clipboardData
  const items = clipboardData.items
  
  // Check for images first
  for (let item of items) {
    if (item.type.indexOf('image') !== -1) {
      const file = item.getAsFile()
      if (file) {
        // Handle image paste
        handleImagePaste(file)
        return
      }
    }
  }
  
  // Handle text paste
  const text = clipboardData.getData('text/plain')
  const html = clipboardData.getData('text/html')
  
  if (html && html.trim()) {
    // Clean HTML and insert
    const cleanHtml = sanitizeHtml(html)
    execCommand('insertHTML', cleanHtml)
  } else if (text) {
    execCommand('insertText', text)
  }
}

const handleKeydown = (event) => {
  // Handle keyboard shortcuts
  if (event.ctrlKey || event.metaKey) {
    switch (event.key.toLowerCase()) {
      case 'b':
        event.preventDefault()
        execCommand('bold')
        break
      case 'i':
        event.preventDefault()
        execCommand('italic')
        break
      case 'u':
        event.preventDefault()
        execCommand('underline')
        break
      case 'k':
        event.preventDefault()
        showLinkDialog.value = true
        break
      case 'z':
        event.preventDefault()
        if (event.shiftKey) {
          redo()
        } else {
          undo()
        }
        break
    }
  }
  
  // Handle enter key for lists and blocks
  if (event.key === 'Enter') {
    handleEnterKey(event)
  }
}

const handleEnterKey = (event) => {
  const selection = window.getSelection()
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    const container = range.commonAncestorContainer
    
    // Check if we're in a code block
    const codeBlock = container.nodeType === Node.TEXT_NODE 
      ? container.parentElement.closest('pre') 
      : container.closest('pre')
    
    if (codeBlock) {
      event.preventDefault()
      execCommand('insertHTML', '<br>')
    }
  }
}

const execCommand = (command, value = null) => {
  document.execCommand(command, false, value)
  editorElement.value.focus()
  handleInput()
}

const isActive = (command) => {
  try {
    return document.queryCommandState(command)
  } catch {
    return false
  }
}

const applyHeading = (event) => {
  const value = event.target.value
  if (value) {
    execCommand('formatBlock', `<${value}>`)
  } else {
    execCommand('formatBlock', '<p>')
  }
  event.target.value = ''
}

const insertBlockquote = () => {
  const selection = window.getSelection()
  const selectedText = selection.toString()
  const html = `<blockquote>${selectedText || '引用内容'}</blockquote>`
  execCommand('insertHTML', html)
}

const insertCodeBlock = () => {
  const selection = window.getSelection()
  const selectedText = selection.toString()
  
  if (selectedText.includes('\n')) {
    // Multi-line code block
    const html = `<pre><code>${selectedText || '// 代码内容'}</code></pre>`
    execCommand('insertHTML', html)
  } else {
    // Inline code
    const html = `<code>${selectedText || 'code'}</code>`
    execCommand('insertHTML', html)
  }
}

const insertTable = () => {
  const html = `
    <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
      <thead>
        <tr>
          <th style="border: 1px solid #ddd; padding: 8px;">标题1</th>
          <th style="border: 1px solid #ddd; padding: 8px;">标题2</th>
          <th style="border: 1px solid #ddd; padding: 8px;">标题3</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">内容1</td>
          <td style="border: 1px solid #ddd; padding: 8px;">内容2</td>
          <td style="border: 1px solid #ddd; padding: 8px;">内容3</td>
        </tr>
      </tbody>
    </table>
  `
  execCommand('insertHTML', html)
}

const insertHorizontalRule = () => {
  execCommand('insertHTML', '<hr style="margin: 24px 0; border: none; border-top: 1px solid #ddd;">')
}

const insertLink = () => {
  if (!linkForm.url) return
  
  const text = linkForm.text || linkForm.url
  const target = linkForm.newTab ? ' target="_blank" rel="noopener noreferrer"' : ''
  const html = `<a href="${linkForm.url}"${target}>${text}</a>`
  
  execCommand('insertHTML', html)
  showLinkDialog.value = false
  
  // Reset form
  Object.assign(linkForm, { text: '', url: '', newTab: true })
}

const insertImage = (imageData) => {
  const { url, alt, title, caption } = imageData
  let html = `<figure style="margin: 24px 0; text-align: center;">`
  html += `<img src="${url}" alt="${alt}" title="${title || alt}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">`
  if (caption) {
    html += `<figcaption style="margin-top: 8px; font-size: 14px; color: #666; font-style: italic;">${caption}</figcaption>`
  }
  html += `</figure>`
  
  execCommand('insertHTML', html)
  showImagePicker.value = false
}

const handleImagePaste = async (file) => {
  // This would typically upload the file and get a URL
  // For now, we'll create a local URL and show the image picker
  const url = URL.createObjectURL(file)
  insertImage({
    url,
    alt: file.name,
    title: file.name,
    caption: ''
  })
}

const sanitizeHtml = (html) => {
  // Basic HTML sanitization
  const temp = document.createElement('div')
  temp.innerHTML = html
  
  // Remove script tags and other dangerous elements
  const scripts = temp.querySelectorAll('script, style, iframe, object, embed')
  scripts.forEach(el => el.remove())
  
  return temp.innerHTML
}

const undo = () => {
  execCommand('undo')
}

const redo = () => {
  execCommand('redo')
}

const updateToolbarState = () => {
  canUndo.value = document.queryCommandEnabled('undo')
  canRedo.value = document.queryCommandEnabled('redo')
}

const updateWordCount = () => {
  if (editorElement.value) {
    const text = editorElement.value.textContent || ''
    wordCount.value = text.replace(/\s+/g, '').length
    emit('word-count-change', wordCount.value)
  }
}

// Watchers
watch(() => props.modelValue, (newValue) => {
  if (editorElement.value && editorElement.value.innerHTML !== newValue) {
    editorElement.value.innerHTML = newValue
    updateWordCount()
  }
})

// Lifecycle
onMounted(() => {
  if (editorElement.value) {
    editorElement.value.innerHTML = props.modelValue
    editorElement.value.style.minHeight = props.minHeight
    updateWordCount()
    
    // Setup mutation observer for undo/redo state
    const observer = new MutationObserver(() => {
      updateToolbarState()
    })
    
    observer.observe(editorElement.value, {
      childList: true,
      subtree: true,
      characterData: true
    })
    
    onUnmounted(() => {
      observer.disconnect()
    })
  }
})
</script>

<style scoped>
.advanced-rich-editor {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #ddd;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 4px;
  padding-right: 12px;
  border-right: 1px solid #dee2e6;
}

.toolbar-group:last-child {
  border-right: none;
  margin-left: auto;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid transparent;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  color: #495057;
}

.toolbar-btn:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

.toolbar-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.toolbar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.heading-select {
  padding: 6px 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background: white;
  font-size: 13px;
  min-width: 100px;
}

.word-count {
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
}

.editor-content {
  min-height: 400px;
  padding: 20px;
  outline: none;
  line-height: 1.6;
  font-size: 16px;
  color: #333;
  overflow-wrap: break-word;
}

.editor-content:empty::before {
  content: attr(placeholder);
  color: #adb5bd;
  pointer-events: none;
}

/* Content Styling */
.editor-content h1 {
  font-size: 32px;
  font-weight: 700;
  margin: 32px 0 16px 0;
  color: #212529;
}

.editor-content h2 {
  font-size: 28px;
  font-weight: 600;
  margin: 28px 0 14px 0;
  color: #212529;
}

.editor-content h3 {
  font-size: 24px;
  font-weight: 600;
  margin: 24px 0 12px 0;
  color: #212529;
}

.editor-content h4 {
  font-size: 20px;
  font-weight: 600;
  margin: 20px 0 10px 0;
  color: #212529;
}

.editor-content p {
  margin: 16px 0;
}

.editor-content blockquote {
  margin: 24px 0;
  padding: 16px 20px;
  border-left: 4px solid #007bff;
  background: #f8f9fa;
  font-style: italic;
  color: #495057;
}

.editor-content code {
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  color: #e83e8c;
}

.editor-content pre {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 6px;
  margin: 24px 0;
  overflow-x: auto;
  border: 1px solid #e9ecef;
}

.editor-content pre code {
  background: none;
  padding: 0;
  color: #333;
}

.editor-content ul, .editor-content ol {
  margin: 16px 0;
  padding-left: 24px;
}

.editor-content li {
  margin: 8px 0;
}

.editor-content table {
  border-collapse: collapse;
  width: 100%;
  margin: 24px 0;
}

.editor-content th, .editor-content td {
  border: 1px solid #dee2e6;
  padding: 12px;
  text-align: left;
}

.editor-content th {
  background: #f8f9fa;
  font-weight: 600;
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
}

.editor-content figure {
  margin: 24px 0;
  text-align: center;
}

.editor-content figcaption {
  margin-top: 8px;
  font-size: 14px;
  color: #6c757d;
  font-style: italic;
}

.editor-content hr {
  margin: 32px 0;
  border: none;
  border-top: 1px solid #dee2e6;
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
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #dee2e6;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #212529;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6c757d;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #dee2e6;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #212529;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.btn-cancel, .btn-primary {
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel {
  background: #f8f9fa;
  color: #6c757d;
  border: 1px solid #ced4da;
}

.btn-cancel:hover {
  background: #e9ecef;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .editor-toolbar {
    padding: 8px 12px;
    gap: 4px;
  }
  
  .toolbar-group {
    padding-right: 8px;
  }
  
  .toolbar-btn {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
  
  .editor-content {
    padding: 16px;
    font-size: 14px;
  }
  
  .modal-content {
    margin: 20px;
    max-width: calc(100vw - 40px);
  }
}
</style>