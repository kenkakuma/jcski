<template>
  <div class="contact-page">
    <nav class="top-nav">
      <div class="nav-container">
        <div class="logo">
          <NuxtLink to="/">JCSKI BLOG</NuxtLink>
        </div>
        <ul class="nav-menu">
          <li><NuxtLink to="/">HOME</NuxtLink></li>
          <li><NuxtLink to="/about">ABOUT</NuxtLink></li>
          <li><NuxtLink to="/category/tech">TECH</NuxtLink></li>
          <li><NuxtLink to="/category/music">MUSIC</NuxtLink></li>
          <li><NuxtLink to="/category/life">LIFE</NuxtLink></li>
          <li><NuxtLink to="/contact" class="active">CONTACT</NuxtLink></li>
        </ul>
      </div>
    </nav>

    <div class="contact-container">
      <header class="contact-header">
        <h1 class="page-title">CONTACT</h1>
        <p class="page-subtitle">お気軽にお問い合わせください</p>
      </header>

      <div class="contact-content">
        <!-- Contact Form -->
        <section class="contact-form-section">
          <h2 class="section-title">お問い合わせフォーム</h2>
          
          <form @submit.prevent="submitForm" class="contact-form">
            <div class="form-row">
              <div class="form-group">
                <label for="name">お名前 <span class="required">*</span></label>
                <input 
                  v-model="form.name"
                  type="text" 
                  id="name" 
                  required
                  :class="{ error: errors.name }"
                >
                <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
              </div>
              
              <div class="form-group">
                <label for="email">メールアドレス <span class="required">*</span></label>
                <input 
                  v-model="form.email"
                  type="email" 
                  id="email" 
                  required
                  :class="{ error: errors.email }"
                >
                <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
              </div>
            </div>
            
            <div class="form-group">
              <label for="subject">件名 <span class="required">*</span></label>
              <select 
                v-model="form.subject" 
                id="subject" 
                required
                :class="{ error: errors.subject }"
              >
                <option value="">件名を選択してください</option>
                <option value="general">一般的なお問い合わせ</option>
                <option value="collaboration">コラボレーションのご提案</option>
                <option value="technical">技術的なご質問</option>
                <option value="music">音楽制作について</option>
                <option value="business">お仕事のご依頼</option>
                <option value="other">その他</option>
              </select>
              <span v-if="errors.subject" class="error-message">{{ errors.subject }}</span>
            </div>
            
            <div class="form-group">
              <label for="message">メッセージ <span class="required">*</span></label>
              <textarea 
                v-model="form.message"
                id="message" 
                rows="6" 
                required
                placeholder="お問い合わせ内容をご記入ください..."
                :class="{ error: errors.message }"
              ></textarea>
              <span v-if="errors.message" class="error-message">{{ errors.message }}</span>
            </div>
            
            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input 
                  v-model="form.newsletter" 
                  type="checkbox"
                  class="checkbox"
                >
                <span class="checkmark"></span>
                ブログの更新情報をメールで受け取る
              </label>
            </div>
            
            <div class="form-actions">
              <button 
                type="submit" 
                class="submit-btn"
                :disabled="isSubmitting"
              >
                <span v-if="isSubmitting">送信中...</span>
                <span v-else>送信する</span>
              </button>
            </div>
          </form>
        </section>

        <!-- Contact Info -->
        <aside class="contact-info-section">
          <h2 class="section-title">コンタクト情報</h2>
          
          <div class="contact-methods">
            <div class="contact-method">
              <div class="method-icon">📧</div>
              <div class="method-content">
                <h3>メール</h3>
                <p>hello@jcski.com</p>
                <span class="response-time">24時間以内に返信</span>
              </div>
            </div>
            
            <div class="contact-method">
              <div class="method-icon">💬</div>
              <div class="method-content">
                <h3>SNS</h3>
                <div class="social-links">
                  <a href="https://twitter.com/jcski" target="_blank">Twitter</a>
                  <a href="https://github.com/jcski" target="_blank">GitHub</a>
                  <a href="https://linkedin.com/in/jcski" target="_blank">LinkedIn</a>
                </div>
              </div>
            </div>
            
            <div class="contact-method">
              <div class="method-icon">🌍</div>
              <div class="method-content">
                <h3>所在地</h3>
                <p>東京, 日本</p>
                <span class="timezone">JST (UTC+9)</span>
              </div>
            </div>
          </div>
          
          <div class="availability">
            <h3>対応可能時間</h3>
            <div class="availability-schedule">
              <div class="schedule-item">
                <span class="day">平日</span>
                <span class="time">9:00 - 18:00</span>
              </div>
              <div class="schedule-item">
                <span class="day">土日</span>
                <span class="time">10:00 - 16:00</span>
              </div>
            </div>
            <p class="note">
              緊急の案件については、上記時間外でも可能な限り対応いたします。
            </p>
          </div>
          
          <div class="expertise-areas">
            <h3>対応可能分野</h3>
            <div class="expertise-grid">
              <div class="expertise-item">
                <div class="expertise-icon">💻</div>
                <h4>Web開発</h4>
                <p>フロントエンド・バックエンド開発、システム設計</p>
              </div>
              <div class="expertise-item">
                <div class="expertise-icon">🎵</div>
                <h4>音楽制作</h4>
                <p>楽曲制作、音響デザイン、オーディオプログラミング</p>
              </div>
              <div class="expertise-item">
                <div class="expertise-icon">🎨</div>
                <h4>クリエイティブ</h4>
                <p>インタラクティブメディア、ジェネラティブアート</p>
              </div>
              <div class="expertise-item">
                <div class="expertise-icon">📚</div>
                <h4>技術コンサル</h4>
                <p>技術選定、アーキテクチャ設計、コードレビュー</p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <!-- Success Message -->
      <div v-if="showSuccess" class="success-modal" @click="closeSuccess">
        <div class="success-content" @click.stop>
          <div class="success-icon">✅</div>
          <h3>送信完了</h3>
          <p>お問い合わせありがとうございます。<br>24時間以内にご返信いたします。</p>
          <button @click="closeSuccess" class="success-btn">閉じる</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Reactive form data
const form = reactive({
  name: '',
  email: '',
  subject: '',
  message: '',
  newsletter: false
})

const errors = reactive({})
const isSubmitting = ref(false)
const showSuccess = ref(false)

// Form validation
const validateForm = () => {
  const newErrors = {}
  
  if (!form.name.trim()) {
    newErrors.name = 'お名前を入力してください'
  }
  
  if (!form.email.trim()) {
    newErrors.email = 'メールアドレスを入力してください'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    newErrors.email = '有効なメールアドレスを入力してください'
  }
  
  if (!form.subject) {
    newErrors.subject = '件名を選択してください'
  }
  
  if (!form.message.trim()) {
    newErrors.message = 'メッセージを入力してください'
  } else if (form.message.trim().length < 10) {
    newErrors.message = 'メッセージは10文字以上で入力してください'
  }
  
  return newErrors
}

// Submit form
const submitForm = async () => {
  // Clear previous errors
  Object.keys(errors).forEach(key => delete errors[key])
  
  // Validate form
  const formErrors = validateForm()
  if (Object.keys(formErrors).length > 0) {
    Object.assign(errors, formErrors)
    return
  }
  
  isSubmitting.value = true
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Show success modal
    showSuccess.value = true
    
    // Reset form
    Object.keys(form).forEach(key => {
      if (typeof form[key] === 'boolean') {
        form[key] = false
      } else {
        form[key] = ''
      }
    })
    
  } catch (error) {
    console.error('Form submission error:', error)
    alert('送信中にエラーが発生しました。しばらく後で再度お試しください。')
  } finally {
    isSubmitting.value = false
  }
}

const closeSuccess = () => {
  showSuccess.value = false
}

// SEO
useHead({
  title: 'Contact - JCSKI Personal Blog',
  meta: [
    { name: 'description', content: 'JCSKIへのお問い合わせページ。Web開発、音楽制作、技術コンサルティングなどのご相談はこちらから。' }
  ]
})
</script>

<style scoped>
.contact-page {
  min-height: 100vh;
  background-color: #ffffff;
}

.contact-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.contact-header {
  text-align: center;
  padding: 60px 0 40px;
  border-bottom: 2px solid #f0f0f0;
  margin-bottom: 60px;
}

.page-title {
  font-size: 48px;
  font-weight: bold;
  color: #000;
  margin-bottom: 15px;
  letter-spacing: 3px;
}

.page-subtitle {
  font-size: 18px;
  color: #666;
}

.contact-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 80px;
  margin-bottom: 80px;
}

.section-title {
  font-size: 28px;
  font-weight: bold;
  color: #000;
  margin-bottom: 30px;
  padding-bottom: 10px;
  border-bottom: 2px solid #4a90e2;
}

.contact-form {
  background: #f8f9fa;
  padding: 40px;
  border-radius: 15px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
  font-size: 14px;
}

.required {
  color: #ff6b6b;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;
  background: white;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #4a90e2;
}

.form-group input.error,
.form-group select.error,
.form-group textarea.error {
  border-color: #ff6b6b;
}

.error-message {
  color: #ff6b6b;
  font-size: 12px;
  margin-top: 5px;
  display: block;
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
}

.checkbox-group {
  margin: 30px 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: normal;
}

.checkbox {
  display: none;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  margin-right: 12px;
  position: relative;
  transition: all 0.3s ease;
}

.checkbox:checked + .checkmark {
  background: #4a90e2;
  border-color: #4a90e2;
}

.checkbox:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 14px;
  font-weight: bold;
}

.form-actions {
  margin-top: 30px;
}

.submit-btn {
  background: linear-gradient(135deg, #4a90e2, #357abd);
  color: white;
  border: none;
  padding: 15px 40px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 150px;
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #357abd, #2968a3);
  transform: translateY(-2px);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.contact-info-section {
  padding: 20px 0;
}

.contact-methods {
  margin-bottom: 40px;
}

.contact-method {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
}

.method-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.method-content h3 {
  font-size: 18px;
  font-weight: bold;
  color: #000;
  margin-bottom: 8px;
}

.method-content p {
  color: #333;
  margin-bottom: 5px;
}

.response-time,
.timezone {
  font-size: 12px;
  color: #666;
  font-style: italic;
}

.social-links {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.social-links a {
  color: #4a90e2;
  text-decoration: none;
  font-weight: 500;
}

.social-links a:hover {
  text-decoration: underline;
}

.availability {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 30px;
}

.availability h3 {
  font-size: 18px;
  font-weight: bold;
  color: #000;
  margin-bottom: 20px;
}

.availability-schedule {
  margin-bottom: 15px;
}

.schedule-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.day {
  font-weight: 500;
  color: #333;
}

.time {
  color: #666;
}

.note {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  font-style: italic;
}

.expertise-areas h3 {
  font-size: 18px;
  font-weight: bold;
  color: #000;
  margin-bottom: 20px;
}

.expertise-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.expertise-item {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
}

.expertise-icon {
  font-size: 32px;
  margin-bottom: 10px;
}

.expertise-item h4 {
  font-size: 16px;
  font-weight: bold;
  color: #000;
  margin-bottom: 8px;
}

.expertise-item p {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

.success-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.success-content {
  background: white;
  padding: 40px;
  border-radius: 15px;
  text-align: center;
  max-width: 400px;
  width: 90%;
}

.success-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.success-content h3 {
  font-size: 24px;
  font-weight: bold;
  color: #000;
  margin-bottom: 15px;
}

.success-content p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 30px;
}

.success-btn {
  background: #4a90e2;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.success-btn:hover {
  background: #357abd;
}

.nav-menu .active {
  color: #4a90e2;
  font-weight: bold;
}

@media (max-width: 1024px) {
  .contact-content {
    grid-template-columns: 1fr;
    gap: 50px;
  }
  
  .expertise-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 36px;
  }
  
  .contact-form {
    padding: 25px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .contact-method {
    flex-direction: column;
    text-align: center;
  }
  
  .method-icon {
    align-self: center;
  }
  
  .social-links {
    justify-content: center;
  }
  
  .success-content {
    padding: 30px 20px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 28px;
  }
  
  .contact-form {
    padding: 20px;
  }
  
  .submit-btn {
    width: 100%;
  }
}
</style>