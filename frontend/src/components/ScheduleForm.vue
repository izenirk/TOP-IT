<template>
    <div class="schedule-form" v-if="selectedEmployee">
        <div class="form-header">
            <h2>Добавление графика</h2>
            <div class="employee-badge">
                <span class="badge-icon">👤</span>
                <span>{{ selectedEmployee.employee }}</span>
                <span class="badge-divider">•</span>
                <span>{{ selectedEmployee.alliance }}</span>
                <span class="badge-divider">•</span>
                <span>{{ selectedEmployee.group }}</span>
            </div>
        </div>
        
        <form @submit.prevent="addSchedule">
            <div class="form-group">
                <label for="date">
                    <svg viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                        <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2"/>
                        <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2"/>
                        <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    Выберите дату
                </label>
                <select id="date" v-model="selectedDate" @change="checkConsecutive" required>
                    <option value="" disabled>Выберите дату</option>
                    <option v-for="date in dateOptions" :key="date.value" :value="date.value">
                        {{ date.label }}
                    </option>
                </select>
            </div>
            
            <div v-if="consecutiveWarning" class="alert" :class="consecutiveWarningClass">
                <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 8V12M12 16H12.01M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                {{ consecutiveWarning }}
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="startTime">
                        <svg viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                            <polyline points="12 6 12 12 16 14" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        Начало смены
                    </label>
                    <select id="startTime" v-model="startTime" @change="onStartTimeChange" required>
                        <option value="" disabled>Выберите время</option>
                        <option v-for="time in startTimeOptions" :key="time.value" :value="time.value">
                            {{ time.label }}
                        </option>
                    </select>
                </div>
                
                <div class="form-group" v-if="startTime && startTime !== 'Выходной'">
                    <label for="endTime">
                        <svg viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                            <polyline points="12 6 12 12 16 14" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        Конец смены
                    </label>
                    <select id="endTime" v-model="endTime" required>
                        <option value="" disabled>Выберите время</option>
                        <option v-for="time in endTimeOptions" :key="time.value" :value="time.value" :disabled="time.disabled">
                            {{ time.label }}
                        </option>
                    </select>
                </div>
            </div>
            
            <button type="submit" class="submit-btn">
                <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                Добавить график
            </button>
        </form>
    </div>
</template>

<script>
import { generateDateOptions, generateTimeOptions, generateEndTimeOptions, checkConsecutiveShifts } from '../utils/helpers.js'
import { scheduleStore } from '../store/scheduleStore.js'

export default {
    name: 'ScheduleForm',
    props: {
        selectedEmployee: Object
    },
    data() {
        return {
            dateOptions: generateDateOptions(),
            startTimeOptions: generateTimeOptions('start'),
            selectedDate: '',
            startTime: '',
            endTime: '',
            consecutiveWarning: '',
            consecutiveWarningClass: ''
        }
    },
    computed: {
        endTimeOptions() {
            return generateEndTimeOptions(this.startTime);
        }
    },
    watch: {
        selectedEmployee() {
            this.resetForm();
        }
    },
    methods: {
        resetForm() {
            this.selectedDate = '';
            this.startTime = '';
            this.endTime = '';
            this.consecutiveWarning = '';
        },
        
        checkConsecutive() {
            if (!this.selectedEmployee || !this.selectedDate) return;
            
            const employees = scheduleStore.employees;
            const employee = employees.find(emp => 
                emp.name === this.selectedEmployee.employee &&
                emp.alliance === this.selectedEmployee.alliance &&
                emp.group === this.selectedEmployee.group
            );
            
            if (employee) {
                const check = checkConsecutiveShifts(employee, this.selectedDate);
                
                if (check.count > 6) {
                    this.consecutiveWarning = `⚠️ При добавлении этой смены будет ${check.count} смен подряд! Максимально допустимо - 6 смен.`;
                    this.consecutiveWarningClass = 'warning';
                } else if (check.count > 4) {
                    this.consecutiveWarning = `ℹ️ ${check.count} смен подряд. Осталось ${6 - check.count} до лимита.`;
                    this.consecutiveWarningClass = 'info';
                } else {
                    this.consecutiveWarning = '';
                    this.consecutiveWarningClass = '';
                }
            } else {
                this.consecutiveWarning = '';
                this.consecutiveWarningClass = '';
            }
        },
        
        onStartTimeChange() {
            this.endTime = '';
        },
        
        validateShift() {
            if (!this.selectedDate || !this.startTime) {
                scheduleStore.setError('Заполните все поля!');
                return false;
            }
            
            if (this.startTime !== 'Выходной' && !this.endTime) {
                scheduleStore.setError('Выберите время окончания смены!');
                return false;
            }
            
            if (this.startTime !== 'Выходной') {
                const [startHour, startMinute] = this.startTime.split(':').map(Number);
                const [endHour, endMinute] = this.endTime.split(':').map(Number);
                
                let startTotal = startHour * 60 + startMinute;
                let endTotal = endHour * 60 + endMinute;
                
                if (endHour < 6 && endHour !== 0) endTotal += 24 * 60;
                if (endHour === 0 && endMinute === 0 && startHour > 0) endTotal += 24 * 60;
                
                const duration = endTotal - startTotal;
                
                if (duration > 720) {
                    scheduleStore.setError('Длительность смены не может превышать 12 часов!');
                    return false;
                }
                
                if (duration <= 0) {
                    scheduleStore.setError('Время окончания должно быть позже времени начала!');
                    return false;
                }
                
                if (endHour > 2 && endHour < 6 && !(endHour === 2 && endMinute === 0)) {
                    scheduleStore.setError('Смена не может заканчиваться позже 2:00!');
                    return false;
                }
            }
            
            return true;
        },
        
        addSchedule() {
            if (!this.validateShift()) return;
            
            const shift = {
                date: this.selectedDate,
                startTime: this.startTime,
                endTime: this.startTime === 'Выходной' ? '' : this.endTime
            };
            
            const employees = scheduleStore.employees;
            const existingEmployee = employees.find(emp => 
                emp.name === this.selectedEmployee.employee &&
                emp.alliance === this.selectedEmployee.alliance &&
                emp.group === this.selectedEmployee.group
            );
            
            if (existingEmployee) {
                const consecutiveCheck = checkConsecutiveShifts(existingEmployee, this.selectedDate);
                if (consecutiveCheck.count > 6) {
                    scheduleStore.setError(`Невозможно добавить смену: будет ${consecutiveCheck.count} смен подряд! Максимум - 6.`);
                    return;
                }
            }
            
            scheduleStore.addShift(
                this.selectedEmployee.employee,
                this.selectedEmployee.alliance,
                this.selectedEmployee.group,
                shift
            );
            
            this.resetForm();
            scheduleStore.clearError();
        }
    }
}
</script>

<style scoped>
/* CSS Variables для светлой и тёмной темы */
.schedule-form {
    --form-bg: #ffffff;
    --form-border: #e2e8f0;
    --form-text: #0f172a;
    --form-label: #475569;
    --input-bg: #ffffff;
    --input-border: #cbd5e1;
    --input-focus: #4f46e5;
    --input-focus-ring: rgba(79, 70, 229, 0.1);
    --badge-bg: #f1f5f9;
    --badge-text: #334155;
    --info-bg: #eff6ff;
    --info-text: #1e40af;
    --info-border: #3b82f6;
    --warning-bg: #fef2f2;
    --warning-text: #991b1b;
    --warning-border: #ef4444;
    --submit-bg: #10b981;
    --submit-hover: #059669;
    --submit-shadow: rgba(16, 185, 129, 0.3);
    --shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    --shadow-lg: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

@media (prefers-color-scheme: dark) {
    .schedule-form {
        --form-bg: #1e293b;
        --form-border: #334155;
        --form-text: #f1f5f9;
        --form-label: #94a3b8;
        --input-bg: #0f172a;
        --input-border: #475569;
        --input-focus: #818cf8;
        --input-focus-ring: rgba(129, 140, 248, 0.2);
        --badge-bg: #334155;
        --badge-text: #cbd5e1;
        --info-bg: #1e3a8a;
        --info-text: #bfdbfe;
        --info-border: #3b82f6;
        --warning-bg: #7f1d1d;
        --warning-text: #fecaca;
        --warning-border: #ef4444;
        --submit-bg: #059669;
        --submit-hover: #10b981;
        --submit-shadow: rgba(16, 185, 129, 0.4);
        --shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        --shadow-lg: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
    }
}

.schedule-form {
    background-color: var(--form-bg);
    border-radius: 20px;
    padding: 24px;
    margin-bottom: 24px;
    border: 1px solid var(--form-border);
    box-shadow: var(--shadow);
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
    transition: all 0.2s ease;
}

.schedule-form:hover {
    box-shadow: var(--shadow-lg);
}

/* Шапка формы */
.form-header {
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--form-border);
}

.form-header h2 {
    margin: 0 0 12px 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--form-text);
    letter-spacing: -0.01em;
}

.employee-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background-color: var(--badge-bg);
    padding: 8px 16px;
    border-radius: 40px;
    font-size: 0.875rem;
    color: var(--badge-text);
    flex-wrap: wrap;
    transition: all 0.2s ease;
}

.employee-badge:hover {
    transform: translateY(-1px);
}

.badge-icon {
    font-size: 1rem;
}

.badge-divider {
    opacity: 0.5;
    font-size: 0.75rem;
}

/* Группа полей */
.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    color: var(--form-label);
    font-weight: 500;
    font-size: 0.875rem;
    letter-spacing: 0.3px;
}

.form-group label svg {
    width: 18px;
    height: 18px;
}

.form-group select {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid var(--input-border);
    border-radius: 12px;
    font-size: 0.95rem;
    background-color: var(--input-bg);
    color: var(--form-text);
    transition: all 0.2s ease;
    font-family: inherit;
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    background-size: 18px;
}

.form-group select:hover {
    border-color: var(--input-focus);
}

.form-group select:focus {
    outline: none;
    border-color: var(--input-focus);
    box-shadow: 0 0 0 3px var(--input-focus-ring);
}

.form-group select option {
    background-color: var(--input-bg);
    color: var(--form-text);
    padding: 8px;
}

/* Две колонки для времени */
.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

/* Алерты */
.alert {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 12px;
    margin-bottom: 20px;
    font-size: 0.875rem;
    line-height: 1.4;
    animation: slideIn 0.3s ease;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.alert svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
}

.alert.info {
    background-color: var(--info-bg);
    color: var(--info-text);
    border-left: 4px solid var(--info-border);
}

.alert.warning {
    background-color: var(--warning-bg);
    color: var(--warning-text);
    border-left: 4px solid var(--warning-border);
}

/* Кнопка отправки */
.submit-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    background-color: var(--submit-bg);
    color: white;
    padding: 14px 24px;
    border: none;
    border-radius: 40px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    font-family: inherit;
    transition: all 0.2s ease;
    margin-top: 8px;
}

.submit-btn svg {
    width: 20px;
    height: 20px;
    transition: transform 0.2s ease;
}

.submit-btn:hover {
    background-color: var(--submit-hover);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px var(--submit-shadow);
}

.submit-btn:hover svg {
    transform: scale(1.1);
}

.submit-btn:active {
    transform: translateY(0);
}

/* Адаптивность */
@media (max-width: 768px) {
    .schedule-form {
        padding: 20px;
        border-radius: 16px;
    }
    
    .form-header h2 {
        font-size: 1.3rem;
    }
    
    .employee-badge {
        font-size: 0.8125rem;
        padding: 6px 12px;
        gap: 6px;
    }
    
    .form-group select {
        padding: 10px 14px;
        font-size: 0.9rem;
    }
    
    .submit-btn {
        padding: 12px 20px;
        font-size: 0.9rem;
    }
}

@media (max-width: 640px) {
    .form-row {
        grid-template-columns: 1fr;
        gap: 0;
    }
    
    .alert {
        padding: 10px 14px;
        font-size: 0.8125rem;
    }
    
    .alert svg {
        width: 18px;
        height: 18px;
    }
}

@media (max-width: 480px) {
    .schedule-form {
        padding: 16px;
        border-radius: 12px;
    }
    
    .form-header {
        margin-bottom: 16px;
        padding-bottom: 12px;
    }
    
    .form-header h2 {
        font-size: 1.2rem;
    }
    
    .employee-badge {
        font-size: 0.75rem;
        padding: 4px 10px;
    }
    
    .form-group {
        margin-bottom: 16px;
    }
    
    .form-group label {
        font-size: 0.8125rem;
    }
    
    .form-group label svg {
        width: 16px;
        height: 16px;
    }
    
    .form-group select {
        padding: 8px 12px;
        font-size: 0.85rem;
    }
    
    .submit-btn {
        padding: 10px 16px;
        font-size: 0.85rem;
    }
    
    .submit-btn svg {
        width: 18px;
        height: 18px;
    }
}
</style>