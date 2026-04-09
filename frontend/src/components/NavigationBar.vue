<template>
    <nav class="navbar">
        <div class="nav-container">
            <div class="nav-brand">
                <router-link to="/" class="brand-link">
                    <svg class="brand-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <path d="M12 14H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    <span>График сотрудников</span>
                </router-link>
            </div>
            
            <div class="nav-menu">
                <router-link to="/" class="nav-link" exact-active-class="active">
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M3 9L12 3L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <path d="M9 22V12H15V22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    <span>Главная</span>
                </router-link>
                <router-link to="/schedule" class="nav-link" active-class="active">
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <path d="M12 14H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    <span>График</span>
                </router-link>
            </div>
            
            <div class="nav-stats">
                <div class="stat-badge">
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M20 21V19C20 16.8 18.2 15 16 15H8C5.8 15 4 16.8 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <span>{{ totalEmployees }}</span>
                </div>
                <div class="stat-badge">
                    <svg viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                        <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2"/>
                        <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2"/>
                        <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <span>{{ totalShifts }}</span>
                </div>
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
/* CSS Variables для светлой и тёмной темы */
.navbar {
    --nav-bg-start: #4f46e5;
    --nav-bg-end: #7c3aed;
    --nav-text: #ffffff;
    --nav-hover-bg: rgba(255, 255, 255, 0.15);
    --nav-active-bg: rgba(255, 255, 255, 0.25);
    --nav-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    --stat-bg: rgba(255, 255, 255, 0.2);
}

@media (prefers-color-scheme: dark) {
    .navbar {
        --nav-bg-start: #1e1b4b;
        --nav-bg-end: #4c1d95;
        --nav-text: #f1f5f9;
        --nav-hover-bg: rgba(255, 255, 255, 0.1);
        --nav-active-bg: rgba(255, 255, 255, 0.2);
        --nav-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        --stat-bg: rgba(255, 255, 255, 0.12);
    }
}

.navbar {
    background: linear-gradient(135deg, var(--nav-bg-start) 0%, var(--nav-bg-end) 100%);
    box-shadow: var(--nav-shadow);
    position: sticky;
    top: 0;
    z-index: 1000;
    backdrop-filter: blur(10px);
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
}

.nav-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 68px;
    gap: 20px;
}

/* Бренд / Логотип */
.nav-brand .brand-link {
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--nav-text);
    text-decoration: none;
    font-size: 1.2rem;
    font-weight: 600;
    transition: all 0.2s ease;
    letter-spacing: -0.01em;
}

.brand-icon {
    width: 26px;
    height: 26px;
}

.nav-brand .brand-link:hover {
    opacity: 0.9;
    transform: translateY(-1px);
}

/* Меню навигации */
.nav-menu {
    display: flex;
    gap: 8px;
    background: rgba(255, 255, 255, 0.08);
    padding: 4px;
    border-radius: 60px;
}

.nav-link {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--nav-text);
    text-decoration: none;
    padding: 8px 20px;
    border-radius: 40px;
    transition: all 0.2s ease;
    font-weight: 500;
    font-size: 0.95rem;
}

.nav-link svg {
    width: 18px;
    height: 18px;
}

.nav-link:hover {
    background-color: var(--nav-hover-bg);
    transform: translateY(-1px);
}

.nav-link.active {
    background-color: var(--nav-active-bg);
    backdrop-filter: blur(4px);
}

/* Статистика */
.nav-stats {
    display: flex;
    gap: 12px;
}

.stat-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: var(--stat-bg);
    padding: 6px 14px;
    border-radius: 40px;
    color: var(--nav-text);
    font-size: 0.85rem;
    font-weight: 500;
    backdrop-filter: blur(4px);
    transition: all 0.2s ease;
}

.stat-badge svg {
    width: 16px;
    height: 16px;
}

.stat-badge:hover {
    background-color: rgba(255, 255, 255, 0.28);
    transform: scale(1.02);
}

/* Адаптивность */
@media (max-width: 768px) {
    .nav-container {
        flex-wrap: wrap;
        height: auto;
        padding: 12px 20px;
        gap: 12px;
    }
    
    .nav-brand {
        flex: 1;
    }
    
    .nav-brand .brand-link {
        font-size: 1rem;
    }
    
    .brand-icon {
        width: 22px;
        height: 22px;
    }
    
    .nav-menu {
        order: 3;
        width: 100%;
        justify-content: center;
        gap: 4px;
        padding: 4px;
    }
    
    .nav-link {
        padding: 6px 16px;
        font-size: 0.85rem;
    }
    
    .nav-link span {
        display: inline;
    }
    
    .nav-stats {
        gap: 8px;
    }
    
    .stat-badge {
        padding: 4px 10px;
        font-size: 0.75rem;
    }
    
    .stat-badge svg {
        width: 14px;
        height: 14px;
    }
}

@media (max-width: 480px) {
    .nav-container {
        padding: 10px 16px;
    }
    
    .nav-brand .brand-link span {
        font-size: 0.9rem;
    }
    
    .nav-link span {
        display: none;
    }
    
    .nav-link {
        padding: 8px 14px;
    }
    
    .nav-link svg {
        width: 20px;
        height: 20px;
        margin: 0;
    }
    
    .stat-badge span:last-child {
        display: inline;
    }
}
</style>