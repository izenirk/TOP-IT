<template>
    <transition name="details-fade">
        <div v-if="visible" class="employee-details-overlay" @click.self="$emit('close')">
            <div class="employee-details">
                <button class="back-btn" @click="$emit('close')">
                    <svg class="back-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Назад к списку
                </button>
                
                <div class="employee-header">
                    <div class="employee-avatar">
                        <span>{{ getInitials(currentEmployee?.name) }}</span>
                    </div>
                    <div class="employee-title">
                        <h3>{{ currentEmployee?.name }}</h3>
                        <div class="employee-info">
                            {{ currentEmployee?.alliance }} • {{ currentEmployee?.group }}
                        </div>
                    </div>
                </div>
                
                <div class="shifts-section">
                    <div class="section-header">
                        <h4>Смены</h4>
                        <span class="shifts-count">{{ sortedShifts.length }}</span>
                    </div>
                    
                    <div v-if="sortedShifts.length === 0" class="empty-shifts">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        <p>Нет смен</p>
                    </div>
                    
                    <div v-else class="shifts-list">
                        <div v-for="(shift, idx) in sortedShifts" :key="idx" class="shift-item">
                            <div class="shift-info">
                                <div class="shift-date">{{ formatDate(shift.date) }}</div>
                                <div class="shift-time">
                                    <span class="time-badge" v-if="shift.startTime !== 'Выходной'">
                                        {{ shift.startTime }} — {{ shift.endTime || 'не указано' }}
                                    </span>
                                    <span class="off-badge" v-else>Выходной</span>
                                </div>
                            </div>
                            <button class="delete-shift-btn" @click="confirmDeleteShift(idx)" title="Удалить смену">
                                <svg viewBox="0 0 24 24" fill="none">
                                    <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                
                <button class="delete-employee-btn" @click="confirmDeleteEmployee">
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V16M14 11V16M4 7H20M16 7L15 4H9L8 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    Удалить сотрудника
                </button>
            </div>
        </div>
    </transition>
</template>

<script>
import { scheduleStore } from '../store/scheduleStore.js'

export default {
    name: 'EmployeeDetails',
    props: {
        visible: Boolean,
        employeeIndex: Number
    },
    computed: {
        currentEmployee() {
            if (this.employeeIndex !== null && scheduleStore.employees[this.employeeIndex]) {
                return scheduleStore.employees[this.employeeIndex];
            }
            return null;
        },
        sortedShifts() {
            if (!this.currentEmployee) return [];
            return [...this.currentEmployee.shifts].sort((a, b) => new Date(a.date) - new Date(b.date));
        }
    },
    methods: {
        getInitials(name) {
            if (!name) return '?';
            return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        },
        
        formatDate(dateStr) {
            const date = new Date(dateStr);
            const weekdays = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
            const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
            const day = date.getDate();
            const month = months[date.getMonth()];
            const weekday = weekdays[date.getDay()];
            return `${day} ${month} • ${weekday}`;
        },
        
        formatShift(shift) {
            const date = new Date(shift.date);
            const weekdays = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
            const weekday = weekdays[date.getDay()];
            
            if (shift.startTime === 'Выходной') {
                return `${shift.date} (${weekday}) - Выходной`;
            }
            return `${shift.date} (${weekday}) - ${shift.startTime} - ${shift.endTime || 'не указано'}`;
        },
        
        confirmDeleteShift(shiftIndex) {
            scheduleStore.showModal(
                `Удалить смену ${this.formatShift(this.sortedShifts[shiftIndex])}?`,
                () => {
                    scheduleStore.deleteShift(this.employeeIndex, shiftIndex);
                    if (!scheduleStore.employees[this.employeeIndex]) {
                        this.$emit('close');
                    }
                }
            );
        },
        
        confirmDeleteEmployee() {
            scheduleStore.showModal(
                `Удалить сотрудника ${this.currentEmployee?.name} и все его смены?`,
                () => {
                    scheduleStore.deleteEmployee(this.employeeIndex);
                    this.$emit('close');
                }
            );
        }
    }
}
</script>

<style scoped>
/* CSS Variables для тем */
.employee-details-overlay {
    --details-bg: #ffffff;
    --details-text: #0f172a;
    --details-text-secondary: #475569;
    --details-border: #e2e8f0;
    --details-card-bg: #f8fafc;
    --details-hover: #f1f5f9;
    --back-bg: #f1f5f9;
    --back-hover: #e2e8f0;
    --back-text: #1e293b;
    --avatar-bg: linear-gradient(135deg, #6366f1, #8b5cf6);
    --badge-time: #e0e7ff;
    --badge-time-text: #4338ca;
    --badge-off: #fef3c7;
    --badge-off-text: #92400e;
    --delete-btn-bg: #ef4444;
    --delete-btn-hover: #dc2626;
    --shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

@media (prefers-color-scheme: dark) {
    .employee-details-overlay {
        --details-bg: #1e293b;
        --details-text: #f1f5f9;
        --details-text-secondary: #94a3b8;
        --details-border: #334155;
        --details-card-bg: #0f172a;
        --details-hover: #334155;
        --back-bg: #334155;
        --back-hover: #475569;
        --back-text: #e2e8f0;
        --avatar-bg: linear-gradient(135deg, #818cf8, #a78bfa);
        --badge-time: #312e81;
        --badge-time-text: #c7d2fe;
        --badge-off: #78350f;
        --badge-off-text: #fde68a;
        --delete-btn-bg: #f97316;
        --delete-btn-hover: #ea580c;
        --shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
}

/* Анимация */
.details-fade-enter-active,
.details-fade-leave-active {
    transition: opacity 0.2s ease;
}

.details-fade-enter-from,
.details-fade-leave-to {
    opacity: 0;
}

.details-fade-enter-active .employee-details,
.details-fade-leave-active .employee-details {
    transition: transform 0.2s ease, opacity 0.2s ease;
}

.details-fade-enter-from .employee-details,
.details-fade-leave-to .employee-details {
    transform: scale(0.95);
    opacity: 0;
}

/* Оверлей */
.employee-details-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
}

/* Контейнер деталей */
.employee-details {
    width: 520px;
    max-width: calc(100% - 32px);
    max-height: 85vh;
    overflow-y: auto;
    background-color: var(--details-bg);
    border-radius: 28px;
    box-shadow: var(--shadow);
    padding: 28px;
    border: 1px solid var(--details-border);
}

/* Кнопка "Назад" */
.back-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background-color: var(--back-bg);
    color: var(--back-text);
    padding: 8px 16px;
    border: none;
    border-radius: 40px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    font-family: inherit;
    transition: all 0.2s ease;
    margin-bottom: 24px;
}

.back-btn:hover {
    background-color: var(--back-hover);
    transform: translateX(-2px);
}

.back-icon {
    width: 18px;
    height: 18px;
}

/* Шапка сотрудника */
.employee-header {
    display: flex;
    gap: 16px;
    align-items: center;
    margin-bottom: 28px;
}

.employee-avatar {
    width: 64px;
    height: 64px;
    background: var(--avatar-bg);
    border-radius: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.employee-avatar span {
    font-size: 1.6rem;
    font-weight: 600;
    color: white;
}

.employee-title h3 {
    margin: 0 0 8px 0;
    font-size: 1.6rem;
    font-weight: 600;
    color: var(--details-text);
    letter-spacing: -0.01em;
}

.employee-info {
    font-size: 0.9rem;
    color: var(--details-text-secondary);
    display: flex;
    gap: 12px;
}

/* Секция смен */
.shifts-section {
    margin: 24px 0;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 16px;
}

.section-header h4 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--details-text);
}

.shifts-count {
    background-color: var(--details-card-bg);
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--details-text-secondary);
}

/* Пустое состояние */
.empty-shifts {
    text-align: center;
    padding: 40px 20px;
    background-color: var(--details-card-bg);
    border-radius: 20px;
    border: 1px dashed var(--details-border);
}

.empty-shifts svg {
    width: 48px;
    height: 48px;
    color: var(--details-text-secondary);
    opacity: 0.5;
    margin-bottom: 12px;
}

.empty-shifts p {
    margin: 0;
    color: var(--details-text-secondary);
    font-size: 0.9rem;
}

/* Список смен */
.shifts-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.shift-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 16px;
    background-color: var(--details-card-bg);
    border-radius: 16px;
    transition: all 0.2s ease;
    border: 1px solid transparent;
}

.shift-item:hover {
    border-color: var(--details-border);
    transform: translateX(2px);
}

.shift-info {
    flex-grow: 1;
}

.shift-date {
    font-weight: 500;
    color: var(--details-text);
    margin-bottom: 6px;
}

.shift-time {
    display: flex;
    gap: 8px;
}

.time-badge {
    font-size: 0.8rem;
    padding: 4px 10px;
    background-color: var(--badge-time);
    color: var(--badge-time-text);
    border-radius: 20px;
    font-weight: 500;
}

.off-badge {
    font-size: 0.8rem;
    padding: 4px 10px;
    background-color: var(--badge-off);
    color: var(--badge-off-text);
    border-radius: 20px;
    font-weight: 500;
}

/* Кнопка удаления смены */
.delete-shift-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    border-radius: 12px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
    flex-shrink: 0;
}

.delete-shift-btn svg {
    width: 20px;
    height: 20px;
}

.delete-shift-btn:hover {
    background-color: rgba(239, 68, 68, 0.1);
    color: #ef4444;
}

@media (prefers-color-scheme: dark) {
    .delete-shift-btn:hover {
        background-color: rgba(249, 115, 22, 0.15);
        color: #f97316;
    }
}

/* Кнопка удаления сотрудника */
.delete-employee-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background-color: var(--delete-btn-bg);
    color: white;
    padding: 12px 20px;
    border: none;
    border-radius: 40px;
    cursor: pointer;
    font-size: 0.95rem;
    font-weight: 500;
    font-family: inherit;
    transition: all 0.2s ease;
    margin-top: 16px;
}

.delete-employee-btn svg {
    width: 18px;
    height: 18px;
}

.delete-employee-btn:hover {
    background-color: var(--delete-btn-hover);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.delete-employee-btn:active {
    transform: translateY(0);
}

/* Адаптивность */
@media (max-width: 560px) {
    .employee-details {
        padding: 20px;
        border-radius: 24px;
    }
    
    .employee-avatar {
        width: 52px;
        height: 52px;
    }
    
    .employee-avatar span {
        font-size: 1.3rem;
    }
    
    .employee-title h3 {
        font-size: 1.3rem;
    }
    
    .shift-item {
        flex-wrap: wrap;
        gap: 10px;
    }
    
    .shift-info {
        flex: 1;
        min-width: 160px;
    }
    
    .shift-time {
        flex-wrap: wrap;
    }
}

/* Кастомный скроллбар */
.employee-details::-webkit-scrollbar {
    width: 6px;
}

.employee-details::-webkit-scrollbar-track {
    background: var(--details-border);
    border-radius: 10px;
}

.employee-details::-webkit-scrollbar-thumb {
    background: var(--details-text-secondary);
    border-radius: 10px;
}

.employee-details::-webkit-scrollbar-thumb:hover {
    background: var(--details-text);
}
</style>