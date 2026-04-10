<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="logo">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span>График смен</span>
        </div>
        <h2>Добро пожаловать</h2>
        <p>Войдите в систему, чтобы продолжить</p>
      </div>
      
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="login">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M20 21V19C20 16.8 18.2 15 16 15H8C5.8 15 4 16.8 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
            </svg>
            Логин
          </label>
          <input 
            type="text" 
            id="login" 
            v-model="login" 
            required 
            placeholder="admin"
            autocomplete="username"
          >
        </div>
        
        <div class="form-group">
          <label for="password">
            <svg viewBox="0 0 24 24" fill="none">
              <rect x="5" y="11" width="14" height="11" rx="2" stroke="currentColor" stroke-width="2"/>
              <path d="M8 11V8C8 5.8 9.8 4 12 4C14.2 4 16 5.8 16 8V11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Пароль
          </label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            required 
            placeholder="••••••"
            autocomplete="current-password"
          >
        </div>
        
        <div v-if="errorMessage" class="error-message">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          {{ errorMessage }}
        </div>
        
        <button type="submit" :disabled="loading" class="submit-btn">
          <span v-if="loading" class="spinner"></span>
          <span v-else>Войти в систему</span>
        </button>
      </form>
      
      <div class="demo-hint">
        <span>🔐 Демо: admin / 12345</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const login = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  errorMessage.value = ''
  loading.value = true
  
  // Имитация запроса
  await new Promise(resolve => setTimeout(resolve, 800))
  
  // Проверка (замените на свои данные)
  if (login.value === 'admin' && password.value === '12345') {
    localStorage.setItem('isAuthenticated', 'true')
    localStorage.setItem('user', login.value)
    router.push('/')
  } else {
    errorMessage.value = 'Неверный логин или пароль'
  }
  
  loading.value = false
}
</script>

<style scoped>
/* CSS Variables для светлой и тёмной темы */
.login-container {
  --login-bg-start: #667eea;
  --login-bg-end: #764ba2;
  --card-bg: rgba(255, 255, 255, 0.98);
  --card-text: #1e293b;
  --card-text-secondary: #64748b;
  --input-bg: #ffffff;
  --input-border: #e2e8f0;
  --input-focus: #667eea;
  --label-color: #475569;
  --error-bg: #fef2f2;
  --error-text: #ef4444;
  --shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

@media (prefers-color-scheme: dark) {
  .login-container {
    --login-bg-start: #1e1b4b;
    --login-bg-end: #2e1065;
    --card-bg: #1e293b;
    --card-text: #f1f5f9;
    --card-text-secondary: #94a3b8;
    --input-bg: #334155;
    --input-border: #475569;
    --input-focus: #818cf8;
    --label-color: #cbd5e1;
    --error-bg: rgba(239, 68, 68, 0.15);
    --error-text: #f87171;
    --shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  }
}

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--login-bg-start) 0%, var(--login-bg-end) 100%);
  padding: 20px;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  position: relative;
  overflow: hidden;
}

/* Декоративные круги на фоне */
.login-container::before {
  content: '';
  position: absolute;
  width: 300px;
  height: 300px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  top: -150px;
  right: -150px;
}

.login-container::after {
  content: '';
  position: absolute;
  width: 400px;
  height: 400px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  bottom: -200px;
  left: -200px;
}

/* Карточка */
.login-card {
  background: var(--card-bg);
  border-radius: 32px;
  padding: 40px 36px;
  width: 100%;
  max-width: 440px;
  box-shadow: var(--shadow);
  position: relative;
  z-index: 1;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Шапка */
.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, var(--login-bg-start), var(--login-bg-end));
  padding: 10px 20px;
  border-radius: 60px;
  margin-bottom: 28px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.logo svg {
  width: 24px;
  height: 24px;
  color: white;
}

.logo span {
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.5px;
}

.login-header h2 {
  margin: 0 0 8px 0;
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--card-text);
  letter-spacing: -0.02em;
}

.login-header p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--card-text-secondary);
}

/* Форма */
.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  color: var(--label-color);
  font-weight: 500;
  font-size: 0.85rem;
  letter-spacing: 0.3px;
}

.form-group label svg {
  width: 18px;
  height: 18px;
}

.form-group input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid var(--input-border);
  border-radius: 16px;
  font-size: 1rem;
  background-color: var(--input-bg);
  color: var(--card-text);
  transition: all 0.2s ease;
  box-sizing: border-box;
  font-family: inherit;
}

.form-group input:focus {
  outline: none;
  border-color: var(--input-focus);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.form-group input::placeholder {
  color: var(--card-text-secondary);
  opacity: 0.5;
}

/* Ошибка */
.error-message {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--error-bg);
  color: var(--error-text);
  padding: 12px 16px;
  border-radius: 16px;
  margin-bottom: 24px;
  font-size: 0.85rem;
  border-left: 3px solid var(--error-text);
}

.error-message svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

/* Кнопка отправки */
.submit-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, var(--login-bg-start) 0%, var(--login-bg-end) 100%);
  color: white;
  border: none;
  border-radius: 40px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  position: relative;
  overflow: hidden;
}

.submit-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.submit-btn:hover::before {
  width: 300px;
  height: 300px;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.submit-btn:active {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

/* Спиннер загрузки */
.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Подсказка */
.demo-hint {
  margin-top: 24px;
  text-align: center;
}

.demo-hint span {
  font-size: 0.75rem;
  color: var(--card-text-secondary);
  background: rgba(102, 126, 234, 0.1);
  padding: 6px 14px;
  border-radius: 40px;
  display: inline-block;
}

/* Адаптивность */
@media (max-width: 480px) {
  .login-card {
    padding: 32px 24px;
    border-radius: 28px;
  }
  
  .login-header h2 {
    font-size: 1.5rem;
  }
  
  .logo {
    padding: 8px 16px;
    margin-bottom: 24px;
  }
  
  .logo span {
    font-size: 0.85rem;
  }
  
  .form-group input {
    padding: 12px 14px;
  }
  
  .submit-btn {
    padding: 12px;
  }
}
</style>