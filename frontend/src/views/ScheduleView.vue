<template>
    <div class="schedule-view">
        <header class="app-header">
            <div class="header-container">
                <div class="logo-area">
                    <div class="logo-icon">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            <path d="M12 14H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </div>
                    <h1>График сотрудников</h1>
                </div>
                
                <div class="user-info">
                    <div class="user-avatar">
                        <span>{{ getInitials(username) }}</span>
                    </div>
                    <span class="username">{{ username }}</span>
                    <button @click="logout" class="logout-btn">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            <path d="M16 17L21 12L16 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            <path d="M21 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        <span>Выйти</span>
                    </button>
                </div>
            </div>
        </header>
        
        <div class="container">
            <div class="main-content">
                <SelectionForm v-model="selectedEmployeeData" />
                <ScheduleForm :selected-employee="selectedEmployeeData" />
                
                <!-- Таблица с данными -->
                <EmployeesTable 
                    @show-details="handleShowDetails"
                    @data-changed="handleDataChanged"
                />
                
                <!-- Календарь на основе данных из таблицы -->
                <ScheduleVisualization 
                    :employees="employees"
                    :initial-view="'week'"
                    :initial-date="new Date()"
                    @view-change="handleViewChange"
                    @period-change="handlePeriodChange"
                />
            </div>
            
            <div class="sidebar">
                <SummaryPanel />
            </div>
        </div>
        
        <EmployeeDetails 
            :visible="detailsVisible"
            :employee-index="currentEmployeeIndex"
            @close="closeEmployeeDetails"
        />
        
        <DeleteModal
            :visible="modalVisible"
            :message="modalMessage"
            :on-confirm="modalConfirmCallback"
            @close="closeModal"
        />
    </div>
</template>

<script>
import SelectionForm from '../components/SelectionForm.vue'
import ScheduleForm from '../components/ScheduleForm.vue'
import EmployeesTable from '../components/EmployeesTable.vue'
import ScheduleVisualization from '../components/Calendar/ScheduleVisualization.vue'
import SummaryPanel from '../components/SummaryPanel.vue'
import EmployeeDetails from '../components/EmployeeDetails.vue'
import DeleteModal from '../components/DeleteModal.vue'
import { scheduleStore } from '../store/scheduleStore.js'

export default {
    name: 'ScheduleView',
    components: {
        SelectionForm,
        ScheduleForm,
        EmployeesTable,
        ScheduleVisualization,
        SummaryPanel,
        EmployeeDetails,
        DeleteModal
    },
    data() {
        return {
            selectedEmployeeData: null,
            detailsVisible: false,
            currentEmployeeIndex: null,
            username: '',
            employees: []
        }
    },
    computed: {
        errorMessage() {
            return scheduleStore.state.errorMessage;
        },
        modalVisible() {
            return scheduleStore.state.modalVisible;
        },
        modalMessage() {
            return scheduleStore.state.modalMessage;
        },
        modalConfirmCallback() {
            return scheduleStore.state.modalCallback;
        }
    },
    mounted() {
        // Проверяем авторизацию
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        if (!isLoggedIn) {
            this.$router.push('/');
            return;
        }
        this.username = localStorage.getItem('username') || 'Пользователь';
        
        // Загружаем данные
        this.loadEmployees();
        
        // Подписываемся на изменения в store
        this.watchStoreChanges();
    },
    beforeUnmount() {
        // Восстанавливаем оригинальные методы при размонтировании
        if (this.originalMethods) {
            scheduleStore.addShift = this.originalMethods.addShift;
            scheduleStore.deleteShift = this.originalMethods.deleteShift;
            scheduleStore.deleteEmployee = this.originalMethods.deleteEmployee;
            scheduleStore.loadTestData = this.originalMethods.loadTestData;
        }
    },
    methods: {
        getInitials(name) {
            if (!name) return '?';
            return name
                .split(' ')
                .map(word => word[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);
        },
        
        loadEmployees() {
            this.employees = [...scheduleStore.employees];
        },
        
        watchStoreChanges() {
            // Создаем наблюдателя за изменениями в store
            const updateEmployees = () => {
                this.employees = [...scheduleStore.employees];
            };
            
            // Сохраняем оригинальные методы
            this.originalMethods = {
                addShift: scheduleStore.addShift,
                deleteShift: scheduleStore.deleteShift,
                deleteEmployee: scheduleStore.deleteEmployee,
                loadTestData: scheduleStore.loadTestData
            };
            
            // Переопределяем методы с уведомлением об изменениях
            scheduleStore.addShift = (...args) => {
                const result = this.originalMethods.addShift.apply(scheduleStore, args);
                updateEmployees();
                return result;
            };
            
            scheduleStore.deleteShift = (...args) => {
                const result = this.originalMethods.deleteShift.apply(scheduleStore, args);
                updateEmployees();
                return result;
            };
            
            scheduleStore.deleteEmployee = (...args) => {
                const result = this.originalMethods.deleteEmployee.apply(scheduleStore, args);
                updateEmployees();
                return result;
            };
            
            scheduleStore.loadTestData = (...args) => {
                const result = this.originalMethods.loadTestData.apply(scheduleStore, args);
                updateEmployees();
                return result;
            };
            
            // Начальная загрузка
            updateEmployees();
        },
        
        handleShowDetails(index) {
            this.showEmployeeDetails(index);
        },
        
        handleDataChanged() {
            this.loadEmployees();
        },
        
        handleViewChange(view) {
            console.log('View changed to:', view);
        },
        
        handlePeriodChange(date) {
            console.log('Period changed to:', date);
        },
        
        showEmployeeDetails(index) {
            this.currentEmployeeIndex = index;
            this.detailsVisible = true;
        },
        
        closeEmployeeDetails() {
            this.detailsVisible = false;
            this.currentEmployeeIndex = null;
        },
        
        closeModal() {
            scheduleStore.hideModal();
        },
        
        logout() {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('username');
            this.$router.push('/');
        }
    }
}
</script>

<style scoped>
/* CSS Variables для светлой и тёмной темы */
.schedule-view {
    --bg-primary: #f8fafc;
    --header-bg: #ffffff;
    --header-border: #e2e8f0;
    --text-primary: #0f172a;
    --text-secondary: #475569;
    --avatar-bg: linear-gradient(135deg, #6366f1, #8b5cf6);
    --logout-bg: #f1f5f9;
    --logout-hover: #fee2e2;
    --logout-text: #475569;
    --logout-hover-text: #dc2626;
    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

@media (prefers-color-scheme: dark) {
    .schedule-view {
        --bg-primary: #0f172a;
        --header-bg: #1e293b;
        --header-border: #334155;
        --text-primary: #f1f5f9;
        --text-secondary: #94a3b8;
        --avatar-bg: linear-gradient(135deg, #818cf8, #a78bfa);
        --logout-bg: #334155;
        --logout-hover: #7f1d1d;
        --logout-text: #cbd5e1;
        --logout-hover-text: #fca5a5;
        --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
        --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
    }
}

.schedule-view {
    min-height: 100vh;
    background-color: var(--bg-primary);
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
}

/* Шапка */
.app-header {
    background-color: var(--header-bg);
    border-bottom: 1px solid var(--header-border);
    box-shadow: var(--shadow-sm);
    position: sticky;
    top: 0;
    z-index: 100;
}

.header-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 72px;
    gap: 20px;
}

/* Логотип */
.logo-area {
    display: flex;
    align-items: center;
    gap: 12px;
}

.logo-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
}

.logo-icon svg {
    width: 22px;
    height: 22px;
    color: white;
}

.app-header h1 {
    margin: 0;
    font-size: 1.4rem;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: -0.01em;
}

/* Информация пользователя */
.user-info {
    display: flex;
    align-items: center;
    gap: 16px;
}

.user-avatar {
    width: 40px;
    height: 40px;
    background: var(--avatar-bg);
    border-radius: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2);
}

.user-avatar span {
    font-size: 1.1rem;
    font-weight: 600;
    color: white;
}

.username {
    font-weight: 500;
    color: var(--text-primary);
    font-size: 0.95rem;
}

/* Кнопка выхода */
.logout-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: var(--logout-bg);
    color: var(--logout-text);
    padding: 8px 18px;
    border: none;
    border-radius: 40px;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 500;
    font-family: inherit;
    transition: all 0.2s ease;
}

.logout-btn svg {
    width: 18px;
    height: 18px;
}

.logout-btn:hover {
    background-color: var(--logout-hover);
    color: var(--logout-hover-text);
    transform: translateY(-1px);
}

/* Основной контейнер */
.container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 28px 24px;
    display: flex;
    gap: 28px;
}

.main-content {
    flex: 1;
    min-width: 0;
}

.sidebar {
    width: 380px;
    flex-shrink: 0;
}

/* Адаптивность */
@media (max-width: 1024px) {
    .container {
        flex-direction: column;
    }
    
    .sidebar {
        width: 100%;
    }
}

@media (max-width: 768px) {
    .header-container {
        padding: 0 16px;
        height: 64px;
    }
    
    .logo-icon {
        width: 34px;
        height: 34px;
        border-radius: 12px;
    }
    
    .logo-icon svg {
        width: 18px;
        height: 18px;
    }
    
    .app-header h1 {
        font-size: 1.2rem;
    }
    
    .username {
        display: none;
    }
    
    .user-avatar {
        width: 36px;
        height: 36px;
    }
    
    .logout-btn span {
        display: none;
    }
    
    .logout-btn {
        padding: 8px 12px;
    }
    
    .logout-btn svg {
        margin: 0;
    }
    
    .container {
        padding: 20px 16px;
        gap: 20px;
    }
}

@media (max-width: 480px) {
    .header-container {
        padding: 0 12px;
    }
    
    .app-header h1 {
        font-size: 1rem;
    }
    
    .logo-icon {
        width: 30px;
        height: 30px;
    }
    
    .logo-icon svg {
        width: 16px;
        height: 16px;
    }
    
    .container {
        padding: 16px 12px;
    }
}
</style>