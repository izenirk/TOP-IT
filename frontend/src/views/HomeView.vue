<template>
    <div class="home">
        <div class="login-card">
            <div class="logo-section">
                <div class="logo-icon">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <path d="M12 14H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </div>
                <h1>График сотрудников</h1>
                <p>Войдите в систему для управления графиком</p>
            </div>
            
            <div class="login-form">
                <div class="input-group">
                    <input 
                        type="text" 
                        v-model="username" 
                        placeholder="Имя пользователя"
                        @keyup.enter="fakeLogin"
                        autocomplete="username"
                    >
                    <span class="input-icon">👤</span>
                </div>
                
                <div class="input-group">
                    <input 
                        type="password" 
                        v-model="password" 
                        placeholder="Пароль"
                        @keyup.enter="fakeLogin"
                        autocomplete="current-password"
                    >
                    <span class="input-icon">🔒</span>
                </div>
                
                <button @click="fakeLogin" class="login-btn">
                    <span>Войти</span>
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
            </div>
            
            <div class="demo-info">
                <div class="demo-badge">
                    <span class="demo-icon">✨</span>
                    <span>Демо-доступ: любые имя и пароль</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'HomeView',
    data() {
        return {
            username: '',
            password: ''
        }
    },
    methods: {
        fakeLogin() {
            if (this.username.trim()) {
                // Сохраняем статус входа
                localStorage.setItem('isLoggedIn', 'true')
                localStorage.setItem('username', this.username)
                // Переходим на страницу графика
                this.$router.push('/schedule')
            } else {
                alert('Пожалуйста, введите имя пользователя')
            }
        }
    }
}
</script>

<style scoped>
/* CSS Variables для светлой и тёмной темы */
.home {
    --gradient-start: #4f46e5;
    --gradient-end: #7c3aed;
    --card-bg: rgba(255, 255, 255, 0.98);
    --card-text: #0f172a;
    --card-text-secondary: #475569;
    --input-bg: #ffffff;
    --input-border: #e2e8f0;
    --input-focus: #4f46e5;
    --demo-bg: rgba(99, 102, 241, 0.08);
    --demo-text: #4f46e5;
    --shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

@media (prefers-color-scheme: dark) {
    .home {
        --gradient-start: #1e1b4b;
        --gradient-end: #4c1d95;
        --card-bg: #1e293b;
        --card-text: #f1f5f9;
        --card-text-secondary: #94a3b8;
        --input-bg: #334155;
        --input-border: #475569;
        --input-focus: #818cf8;
        --demo-bg: rgba(129, 140, 248, 0.15);
        --demo-text: #a5b4fc;
        --shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
}

.home {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%);
    padding: 20px;
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
    position: relative;
    overflow: hidden;
}

/* Декоративные элементы фона */
.home::before {
    content: '';
    position: absolute;
    width: 300px;
    height: 300px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 50%;
    top: -100px;
    right: -100px;
}

.home::after {
    content: '';
    position: absolute;
    width: 400px;
    height: 400px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 50%;
    bottom: -150px;
    left: -150px;
}

/* Карточка входа */
.login-card {
    background: var(--card-bg);
    padding: 44px 40px;
    border-radius: 40px;
    box-shadow: var(--shadow);
    width: 100%;
    max-width: 440px;
    text-align: center;
    position: relative;
    z-index: 1;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Логотип и заголовок */
.logo-section {
    margin-bottom: 32px;
}

.logo-icon {
    width: 64px;
    height: 64px;
    margin: 0 auto 20px;
    background: linear-gradient(135deg, var(--gradient-start), var(--gradient-end));
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 20px rgba(79, 70, 229, 0.3);
}

.logo-icon svg {
    width: 34px;
    height: 34px;
    color: white;
}

.login-card h1 {
    margin: 0 0 10px 0;
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--card-text);
    letter-spacing: -0.02em;
}

.login-card p {
    margin: 0;
    font-size: 0.9rem;
    color: var(--card-text-secondary);
}

/* Форма */
.login-form {
    display: flex;
    flex-direction: column;
    gap: 18px;
}

.input-group {
    position: relative;
}

.input-group input {
    width: 100%;
    padding: 14px 16px 14px 48px;
    border: 2px solid var(--input-border);
    border-radius: 20px;
    font-size: 1rem;
    background-color: var(--input-bg);
    color: var(--card-text);
    transition: all 0.2s ease;
    font-family: inherit;
    box-sizing: border-box;
}

.input-group input:focus {
    outline: none;
    border-color: var(--input-focus);
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
}

.input-group input::placeholder {
    color: var(--card-text-secondary);
    opacity: 0.5;
}

.input-icon {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1.2rem;
    opacity: 0.6;
}

/* Кнопка входа */
.login-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 14px 24px;
    background: linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%);
    color: white;
    border: none;
    border-radius: 40px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 8px;
    font-family: inherit;
    position: relative;
    overflow: hidden;
}

.login-btn::before {
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

.login-btn:hover::before {
    width: 300px;
    height: 300px;
}

.login-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(79, 70, 229, 0.4);
}

.login-btn:active {
    transform: translateY(0);
}

.login-btn svg {
    width: 18px;
    height: 18px;
}

/* Демо-информация */
.demo-info {
    margin-top: 28px;
    padding-top: 24px;
    border-top: 1px solid var(--input-border);
}

.demo-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--demo-bg);
    padding: 8px 18px;
    border-radius: 40px;
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--demo-text);
}

.demo-icon {
    font-size: 0.9rem;
}

/* Адаптивность */
@media (max-width: 480px) {
    .login-card {
        padding: 32px 24px;
        border-radius: 32px;
    }
    
    .logo-icon {
        width: 52px;
        height: 52px;
        border-radius: 20px;
    }
    
    .logo-icon svg {
        width: 28px;
        height: 28px;
    }
    
    .login-card h1 {
        font-size: 1.5rem;
    }
    
    .login-card p {
        font-size: 0.85rem;
    }
    
    .input-group input {
        padding: 12px 14px 12px 44px;
        font-size: 0.9rem;
    }
    
    .login-btn {
        padding: 12px 20px;
        font-size: 0.9rem;
    }
    
    .demo-badge {
        padding: 6px 14px;
        font-size: 0.7rem;
    }
}
</style>