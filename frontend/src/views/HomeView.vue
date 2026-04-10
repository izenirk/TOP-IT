<template>
    <div class="home">
        <div class="login-card">
            <h1>📅 График сотрудников</h1>
            <p>Войдите в систему для управления графиком</p>
            
            <div class="login-form">
                <input 
                    type="text" 
                    v-model="username" 
                    placeholder="Имя пользователя"
                    @keyup.enter="fakeLogin"
                >
                <input 
                    type="password" 
                    v-model="password" 
                    placeholder="Пароль"
                    @keyup.enter="fakeLogin"
                >
                <button @click="fakeLogin">Войти</button>
            </div>
            
            <div class="demo-info">
                <p>✨ Демо-доступ: любые имя и пароль</p>
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
.home {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
    background: white;
    padding: 40px;
    border-radius: 10px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    width: 90%;
    max-width: 400px;
    text-align: center;
}

.login-card h1 {
    margin-bottom: 10px;
    color: #333;
}

.login-card p {
    color: #666;
    margin-bottom: 30px;
}

.login-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.login-form input {
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 16px;
}

.login-form button {
    padding: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    cursor: pointer;
    transition: transform 0.2s;
}

.login-form button:hover {
    transform: translateY(-2px);
}

.demo-info {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #eee;
    font-size: 12px;
    color: #999;
}
</style>