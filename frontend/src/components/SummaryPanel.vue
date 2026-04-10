<template>
    <div class="summary-panel">
        <div class="panel-header">
            <h2>Общий свод</h2>
            <div class="total-badge" v-if="totalShifts > 0">
                {{ totalShifts }} смен
            </div>
        </div>
        
        <div v-if="totalShifts > 0">
            <!-- Распределение по дням недели -->
            <div class="summary-section">
                <div class="section-title">
                    <svg viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                        <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2"/>
                        <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2"/>
                        <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <span>Распределение по дням</span>
                </div>
                
                <div class="stats-grid">
                    <div v-for="(percentage, day) in weekdayPercentages" :key="day" class="stat-card">
                        <div class="stat-day">{{ dayShort[day] || day }}</div>
                        <div class="stat-bar-container">
                            <div class="stat-bar" :style="{ width: percentage + '%', backgroundColor: getBarColor(day) }"></div>
                        </div>
                        <div class="stat-value">{{ percentage }}%</div>
                        <div class="stat-count">{{ shiftsByDay[dayIndexes[day]] }} смен</div>
                    </div>
                </div>
                
                <div class="target-info">
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M12 8V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <span>Цель (5/2): будни ~71.4% • выходные ~28.6%</span>
                </div>
            </div>
            
            <!-- Распределение по времени -->
            <div class="summary-section">
                <div class="section-title">
                    <svg viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                        <polyline points="12 6 12 12 16 14" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <span>Распределение по времени</span>
                </div>
                
                <div class="time-stats">
                    <div class="time-stat">
                        <div class="time-label">🌅 До 11:00</div>
                        <div class="time-bar">
                            <div class="time-fill morning" :style="{ width: before11Percentage + '%' }"></div>
                        </div>
                        <div class="time-percent">{{ before11Percentage }}%</div>
                        <div class="time-count">{{ before11Shifts }} смен</div>
                    </div>
                    <div class="time-stat">
                        <div class="time-label">🌙 После 19:00</div>
                        <div class="time-bar">
                            <div class="time-fill evening" :style="{ width: after19Percentage + '%' }"></div>
                        </div>
                        <div class="time-percent">{{ after19Percentage }}%</div>
                        <div class="time-count">{{ after19Shifts }} смен</div>
                    </div>
                    <div class="time-stat">
                        <div class="time-label">☀️ Остальное время</div>
                        <div class="time-bar">
                            <div class="time-fill other" :style="{ width: otherTimePercentage + '%' }"></div>
                        </div>
                        <div class="time-percent">{{ otherTimePercentage }}%</div>
                    </div>
                </div>
            </div>
            
            <!-- Предупреждения -->
            <div v-if="warnings.length > 0" class="warnings">
                <div v-for="(warning, idx) in warnings" :key="idx" class="warning-item">
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M12 8V12M12 16H12.01M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    {{ warning }}
                </div>
            </div>
        </div>
        
        <div v-else class="no-data">
            <svg viewBox="0 0 24 24" fill="none">
                <path d="M9 12H15M12 9V15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <p>Нет данных для свода</p>
            <span>Добавьте смены для отображения статистики</span>
        </div>
    </div>
</template>

<script>
import { scheduleStore } from '../store/scheduleStore.js'
import { calculateMaxConsecutiveShifts } from '../utils/helpers.js'

export default {
    name: 'SummaryPanel',
    data() {
        return {
            shiftsByDay: [0, 0, 0, 0, 0, 0, 0],
            before11Shifts: 0,
            after19Shifts: 0,
            longShifts: 0,
            totalShifts: 0,
            employeesWithExcessConsecutive: 0
        }
    },
    computed: {
        dayNames() {
            return ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
        },
        dayShort() {
            return {
                'Понедельник': 'ПН',
                'Вторник': 'ВТ',
                'Среда': 'СР',
                'Четверг': 'ЧТ',
                'Пятница': 'ПТ',
                'Суббота': 'СБ',
                'Воскресенье': 'ВС'
            };
        },
        dayIndexes() {
            const indexes = {};
            this.dayNames.forEach((name, idx) => {
                indexes[name] = idx;
            });
            return indexes;
        },
        weekdayPercentages() {
            const percentages = {};
            this.dayNames.forEach((day, idx) => {
                percentages[day] = this.totalShifts > 0 ? ((this.shiftsByDay[idx] / this.totalShifts) * 100).toFixed(1) : '0.0';
            });
            return percentages;
        },
        before11Percentage() {
            return this.totalShifts > 0 ? ((this.before11Shifts / this.totalShifts) * 100).toFixed(1) : '0.0';
        },
        after19Percentage() {
            return this.totalShifts > 0 ? ((this.after19Shifts / this.totalShifts) * 100).toFixed(1) : '0.0';
        },
        otherTimePercentage() {
            return (100 - parseFloat(this.before11Percentage) - parseFloat(this.after19Percentage)).toFixed(1);
        },
        warnings() {
            const warnings = [];
            if (this.employeesWithExcessConsecutive > 0) {
                warnings.push(`${this.employeesWithExcessConsecutive} сотрудник(ов) имеют более 6 смен подряд`);
            }
            if (this.longShifts > 0) {
                warnings.push(`${this.longShifts} смен(ы) длительностью более 12 часов`);
            }
            return warnings;
        }
    },
    mounted() {
        this.calculateSummary();
        // Подписываемся на изменения
        this.$watch(() => scheduleStore.employees, () => {
            this.calculateSummary();
        }, { deep: true });
    },
    methods: {
        getBarColor(day) {
            const colors = {
                'Понедельник': '#6366f1',
                'Вторник': '#8b5cf6',
                'Среда': '#a855f7',
                'Четверг': '#d946ef',
                'Пятница': '#ec4899',
                'Суббота': '#f59e0b',
                'Воскресенье': '#ef4444'
            };
            return colors[day] || '#6366f1';
        },
        
        calculateSummary() {
            this.totalShifts = 0;
            this.shiftsByDay = [0, 0, 0, 0, 0, 0, 0];
            this.before11Shifts = 0;
            this.after19Shifts = 0;
            this.longShifts = 0;
            this.employeesWithExcessConsecutive = 0;
            
            scheduleStore.employees.forEach(emp => {
                const maxConsecutive = calculateMaxConsecutiveShifts(emp);
                if (maxConsecutive > 6) this.employeesWithExcessConsecutive++;
                
                emp.shifts.forEach(shift => {
                    this.totalShifts++;
                    const date = new Date(shift.date);
                    const day = date.getDay();
                    
                    let dayIndex;
                    if (day === 0) dayIndex = 6;
                    else dayIndex = day - 1;
                    
                    this.shiftsByDay[dayIndex]++;
                    
                    if (shift.startTime !== 'Выходной') {
                        const startHour = parseInt(shift.startTime.split(':')[0]);
                        if (startHour < 11) this.before11Shifts++;
                        
                        if (shift.endTime) {
                            const [startHour, startMinute] = shift.startTime.split(':').map(Number);
                            const [endHour, endMinute] = shift.endTime.split(':').map(Number);
                            
                            let startTotal = startHour * 60 + startMinute;
                            let endTotal = endHour * 60 + endMinute;
                            
                            if (endHour < 6 && endHour !== 0) endTotal += 24 * 60;
                            if (endHour === 0 && endMinute === 0 && startHour > 0) endTotal += 24 * 60;
                            
                            const duration = endTotal - startTotal;
                            if (duration > 720) this.longShifts++;
                        }
                    }
                    
                    if (shift.endTime && shift.endTime !== '') {
                        let endHour = parseInt(shift.endTime.split(':')[0]);
                        if (shift.endTime === '00:00' && shift.startTime !== 'Выходной') {
                            const startHour = parseInt(shift.startTime.split(':')[0]);
                            if (startHour < 19) this.after19Shifts++;
                        } else if (endHour > 19) {
                            this.after19Shifts++;
                        }
                    }
                });
            });
        }
    }
}
</script>

<style scoped>
/* CSS Variables для светлой и тёмной темы */
.summary-panel {
    --panel-bg: #ffffff;
    --panel-border: #e2e8f0;
    --panel-text: #0f172a;
    --panel-text-secondary: #475569;
    --card-bg: #f8fafc;
    --target-bg: #f1f5f9;
    --warning-bg: #fef3c7;
    --warning-text: #92400e;
    --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    --bar-bg: #e2e8f0;
}

@media (prefers-color-scheme: dark) {
    .summary-panel {
        --panel-bg: #1e293b;
        --panel-border: #334155;
        --panel-text: #f1f5f9;
        --panel-text-secondary: #94a3b8;
        --card-bg: #0f172a;
        --target-bg: #334155;
        --warning-bg: #78350f;
        --warning-text: #fde68a;
        --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
        --bar-bg: #334155;
    }
}

.summary-panel {
    background-color: var(--panel-bg);
    border: 1px solid var(--panel-border);
    border-radius: 24px;
    padding: 24px;
    height: fit-content;
    position: sticky;
    top: 88px;
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
    transition: all 0.2s ease;
    box-shadow: var(--shadow);
}

/* Шапка */
.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 2px solid var(--panel-border);
}

.panel-header h2 {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--panel-text);
    letter-spacing: -0.01em;
}

.total-badge {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white;
    padding: 4px 12px;
    border-radius: 40px;
    font-size: 0.8rem;
    font-weight: 600;
}

/* Секции */
.summary-section {
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--panel-border);
}

.summary-section:last-of-type {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
}

.section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    font-weight: 600;
    color: var(--panel-text);
    font-size: 0.9rem;
}

.section-title svg {
    width: 20px;
    height: 20px;
}

/* Сетка статистики по дням */
.stats-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
}

.stat-card {
    display: grid;
    grid-template-columns: 40px 1fr 45px 50px;
    align-items: center;
    gap: 8px;
    font-size: 0.8rem;
}

.stat-day {
    font-weight: 600;
    color: var(--panel-text);
    font-size: 0.85rem;
}

.stat-bar-container {
    background-color: var(--bar-bg);
    border-radius: 20px;
    height: 8px;
    overflow: hidden;
}

.stat-bar {
    height: 100%;
    border-radius: 20px;
    transition: width 0.3s ease;
}

.stat-value {
    font-weight: 600;
    color: var(--panel-text);
    text-align: right;
    font-size: 0.85rem;
}

.stat-count {
    color: var(--panel-text-secondary);
    font-size: 0.7rem;
    text-align: right;
}

/* Целевая информация */
.target-info {
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: var(--target-bg);
    padding: 10px 14px;
    border-radius: 16px;
    font-size: 0.7rem;
    color: var(--panel-text-secondary);
}

.target-info svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
}

/* Статистика по времени */
.time-stats {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.time-stat {
    display: grid;
    grid-template-columns: 100px 1fr 45px 45px;
    align-items: center;
    gap: 8px;
    font-size: 0.8rem;
}

.time-label {
    font-weight: 500;
    color: var(--panel-text);
    font-size: 0.85rem;
}

.time-bar {
    background-color: var(--bar-bg);
    border-radius: 20px;
    height: 8px;
    overflow: hidden;
}

.time-fill {
    height: 100%;
    border-radius: 20px;
    transition: width 0.3s ease;
}

.time-fill.morning {
    background: linear-gradient(90deg, #f59e0b, #f97316);
}

.time-fill.evening {
    background: linear-gradient(90deg, #6366f1, #8b5cf6);
}

.time-fill.other {
    background: linear-gradient(90deg, #10b981, #34d399);
}

.time-percent {
    font-weight: 600;
    color: var(--panel-text);
    text-align: right;
}

.time-count {
    color: var(--panel-text-secondary);
    font-size: 0.7rem;
    text-align: right;
}

/* Предупреждения */
.warnings {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.warning-item {
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--warning-text);
    background-color: var(--warning-bg);
    padding: 12px 14px;
    border-radius: 16px;
    font-size: 0.8rem;
    border-left: 3px solid #f59e0b;
}

.warning-item svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
}

/* Пустое состояние */
.no-data {
    text-align: center;
    padding: 40px 20px;
}

.no-data svg {
    width: 64px;
    height: 64px;
    color: var(--panel-text-secondary);
    opacity: 0.4;
    margin-bottom: 16px;
}

.no-data p {
    margin: 0 0 8px 0;
    font-size: 1rem;
    font-weight: 500;
    color: var(--panel-text);
}

.no-data span {
    font-size: 0.8rem;
    color: var(--panel-text-secondary);
}

/* Адаптивность */
@media (max-width: 1024px) {
    .summary-panel {
        position: static;
        margin-top: 20px;
    }
}

@media (max-width: 640px) {
    .summary-panel {
        padding: 18px;
        border-radius: 20px;
    }
    
    .stat-card {
        grid-template-columns: 35px 1fr 40px 40px;
        gap: 6px;
    }
    
    .time-stat {
        grid-template-columns: 80px 1fr 40px 40px;
        gap: 6px;
    }
    
    .stat-day, .time-label {
        font-size: 0.75rem;
    }
    
    .stat-value, .time-percent {
        font-size: 0.75rem;
    }
    
    .target-info span {
        font-size: 0.65rem;
    }
}
</style>