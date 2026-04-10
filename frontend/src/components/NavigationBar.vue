<template>
    <nav class="navbar">
        <div class="nav-container">
            <div class="nav-brand">
                <router-link to="/" class="brand-link">
                    📅 График сотрудников
                </router-link>
            </div>
            <div class="nav-menu">
                <router-link to="/" class="nav-link" exact-active-class="active">
                    🏠 Главная
                </router-link>
                <router-link to="/schedule" class="nav-link" active-class="active">
                    📝 График
                </router-link>
            </div>
            <div class="nav-stats">
                <span class="stat-badge">
                    👥 {{ totalEmployees }}
                </span>
                <span class="stat-badge">
                    📅 {{ totalShifts }}
                </span>
            </div>
        </div>
    </nav>
</template>

<script>
import { scheduleStore } from '../store/scheduleStore.js'

export default {
    name: 'NavigationBar',
    computed: {
        totalEmployees() {
            return scheduleStore.employees.length
        },
        totalShifts() {
            return scheduleStore.employees.reduce((sum, emp) => sum + emp.shifts.length, 0)
        }
    }
}
</script>

<style scoped>
.navbar {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    position: sticky;
    top: 0;
    z-index: 1000;
}

.nav-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 60px;
}

.nav-brand .brand-link {
    color: white;
    text-decoration: none;
    font-size: 1.3rem;
    font-weight: bold;
    transition: opacity 0.3s ease;
}

.nav-brand .brand-link:hover {
    opacity: 0.9;
}

.nav-menu {
    display: flex;
    gap: 20px;
}

.nav-link {
    color: white;
    text-decoration: none;
    padding: 8px 16px;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.nav-link:hover {
    background-color: rgba(255,255,255,0.2);
}

.nav-link.active {
    background-color: rgba(255,255,255,0.3);
}

.nav-stats {
    display: flex;
    gap: 15px;
}

.stat-badge {
    background-color: rgba(255,255,255,0.2);
    padding: 5px 12px;
    border-radius: 20px;
    color: white;
    font-size: 0.9rem;
}

@media (max-width: 768px) {
    .nav-container {
        flex-direction: column;
        height: auto;
        padding: 10px;
        gap: 10px;
    }
    
    .nav-stats {
        order: 3;
    }
}
</style>