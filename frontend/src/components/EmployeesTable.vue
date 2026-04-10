<template>
    <div class="employees-table">
        <div class="table-header">
            <h2>Список графиков</h2>
            <div class="stats-badge" v-if="employeesList.length > 0">
                {{ employeesList.length }} сотрудников
            </div>
        </div>
        
        <div v-if="employeesList.length > 0">
            <div v-for="alliance in uniqueAlliances" :key="alliance" class="alliance-section">
                <div class="alliance-header">
                    <span class="alliance-icon">⚔️</span>
                    <span class="alliance-name">{{ alliance }}</span>
                    <span class="alliance-count">{{ getAllianceCount(alliance) }}</span>
                </div>
                
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Группа</th>
                                <th>Сотрудник</th>
                                <th>Смены</th>
                                <th class="center-col">Макс. подряд</th>
                                <th class="center-col">% в будни</th>
                                <th class="center-col">% в выходные</th>
                                <th class="actions-header">Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-for="group in getGroupsByAlliance(alliance)" :key="group">
                                <tr class="group-separator">
                                    <td colspan="7">
                                        <div class="group-label">
                                            <span class="group-icon">📁</span>
                                            <strong>{{ group }}</strong>
                                            <span class="group-count">{{ getGroupCount(alliance, group) }}</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr v-for="employee in getEmployeesByGroup(alliance, group)" :key="employee.originalIndex" class="employee-row">
                                    <td class="group-cell"></td>
                                    <td class="employee-name">
                                        <span class="name-avatar">{{ getInitials(employee.name) }}</span>
                                        {{ employee.name }}
                                    </td>
                                    <td class="shifts-cell">
                                        <div class="shifts-preview">
                                            <span v-if="employee.shifts.length === 0" class="no-shifts">—</span>
                                            <span v-else class="shifts-count-badge">{{ employee.shifts.length }} смен</span>
                                            <span class="shifts-dates">{{ getShiftsPreview(employee.shifts) }}</span>
                                        </div>
                                    </td>
                                    <td class="center-col">
                                        <span :class="['metric-value', { warning: employee.maxConsecutive > 6 }]">
                                            {{ employee.maxConsecutive }}
                                        </span>
                                    </td>
                                    <td class="center-col">
                                        <div class="percentage-bar">
                                            <div class="percentage-fill" :style="{ width: employee.metrics.weekdayPercentage + '%' }"></div>
                                            <span class="percentage-text">{{ employee.metrics.weekdayPercentage }}%</span>
                                        </div>
                                    </td>
                                    <td class="center-col">
                                        <div class="percentage-bar">
                                            <div class="percentage-fill weekend" :style="{ width: employee.metrics.weekendPercentage + '%' }"></div>
                                            <span class="percentage-text">{{ employee.metrics.weekendPercentage }}%</span>
                                        </div>
                                    </td>
                                    <td class="actions-cell">
                                        <button class="action-btn edit-btn" @click="showDetails(employee.originalIndex)" title="Редактировать">
                                            <svg viewBox="0 0 24 24" fill="none">
                                                <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                                <path d="M18.5 2.5L21.5 5.5M9 15H12L20 7L17 4L9 12V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                            </svg>
                                        </button>
                                        <button class="action-btn delete-btn" @click="confirmDeleteEmployee(employee.originalIndex, employee.name)" title="Удалить сотрудника">
                                            <svg viewBox="0 0 24 24" fill="none">
                                                <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V16M14 11V16M4 7H20M16 7L15 4H9L8 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        
        <div v-else class="no-data">
            <svg viewBox="0 0 24 24" fill="none">
                <path d="M9 12H15M12 9V15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <p>Нет внесенных графиков</p>
            <span>Добавьте первого сотрудника</span>
        </div>
    </div>
</template>

<script>
import { calculateEmployeeMetrics, calculateMaxConsecutiveShifts } from '../utils/helpers.js'
import { scheduleStore } from '../store/scheduleStore.js'

export default {
    name: 'EmployeesTable',
    computed: {
        employeesList() {
            const list = [];
            scheduleStore.employees.forEach((emp, index) => {
                const metrics = calculateEmployeeMetrics(emp);
                const maxConsecutive = calculateMaxConsecutiveShifts(emp);
                
                list.push({
                    ...emp,
                    originalIndex: index,
                    metrics,
                    maxConsecutive
                });
            });
            return list;
        },
        
        uniqueAlliances() {
            return [...new Set(this.employeesList.map(emp => emp.alliance))];
        }
    },
    methods: {
        getInitials(name) {
            if (!name) return '?';
            return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        },
        
        getAllianceCount(alliance) {
            return this.employeesList.filter(emp => emp.alliance === alliance).length;
        },
        
        getGroupsByAlliance(alliance) {
            const groups = this.employeesList
                .filter(emp => emp.alliance === alliance)
                .map(emp => emp.group);
            return [...new Set(groups)];
        },
        
        getGroupCount(alliance, group) {
            return this.employeesList.filter(emp => emp.alliance === alliance && emp.group === group).length;
        },
        
        getEmployeesByGroup(alliance, group) {
            return this.employeesList.filter(emp => emp.alliance === alliance && emp.group === group);
        },
        
        getShiftsPreview(shifts) {
            if (!shifts || shifts.length === 0) return '';
            if (shifts.length <= 2) {
                return shifts.map(s => s.date.slice(5)).join(', ');
            }
            return `${shifts.slice(0, 2).map(s => s.date.slice(5)).join(', ')} +${shifts.length - 2}`;
        },
        
        formatShifts(shifts) {
            if (!shifts || shifts.length === 0) return 'Нет смен';
            return shifts.map(s => 
                `${s.date} (${s.startTime}${s.endTime ? '-' + s.endTime : ''})`
            ).join('; ');
        },
        
        showDetails(index) {
            this.$emit('show-details', index);
        },
        
        confirmDeleteEmployee(index, name) {
            scheduleStore.showModal(
                `Удалить сотрудника ${name} и все его смены?`,
                () => scheduleStore.deleteEmployee(index)
            );
        }
    }
}
</script>

<style scoped>
/* CSS Variables для тем */
.employees-table {
    --table-bg: #ffffff;
    --table-header-bg: #f8fafc;
    --table-border: #e2e8f0;
    --table-text: #0f172a;
    --table-text-secondary: #475569;
    --group-bg: #f1f5f9;
    --group-text: #1e293b;
    --hover-bg: #faf5ff;
    --alliance-bg: linear-gradient(135deg, #6366f1, #8b5cf6);
    --alliance-text: #ffffff;
    --badge-bg: #e0e7ff;
    --badge-text: #4338ca;
    --warning-color: #f59e0b;
    --percentage-bg: #e2e8f0;
    --percentage-fill: #10b981;
    --percentage-fill-weekend: #f59e0b;
    --edit-color: #10b981;
    --edit-hover: #059669;
    --delete-color: #ef4444;
    --delete-hover: #dc2626;
    --shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

@media (prefers-color-scheme: dark) {
    .employees-table {
        --table-bg: #1e293b;
        --table-header-bg: #0f172a;
        --table-border: #334155;
        --table-text: #f1f5f9;
        --table-text-secondary: #94a3b8;
        --group-bg: #334155;
        --group-text: #e2e8f0;
        --hover-bg: #2d3a4e;
        --alliance-bg: linear-gradient(135deg, #818cf8, #a78bfa);
        --badge-bg: #312e81;
        --badge-text: #c7d2fe;
        --warning-color: #fbbf24;
        --percentage-bg: #334155;
        --percentage-fill: #34d399;
        --percentage-fill-weekend: #fbbf24;
        --edit-color: #34d399;
        --edit-hover: #6ee7b7;
        --delete-color: #f97316;
        --delete-hover: #fb923c;
    }
}

.employees-table {
    margin-top: 20px;
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
}

/* Шапка таблицы */
.table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 12px;
}

.employees-table h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--table-text);
    letter-spacing: -0.01em;
}

.stats-badge {
    background-color: var(--badge-bg);
    color: var(--badge-text);
    padding: 6px 14px;
    border-radius: 40px;
    font-size: 0.85rem;
    font-weight: 500;
}

/* Секция альянса */
.alliance-section {
    margin-bottom: 32px;
}

.alliance-header {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    background: var(--alliance-bg);
    padding: 10px 20px;
    border-radius: 40px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2);
}

.alliance-icon {
    font-size: 1.2rem;
}

.alliance-name {
    font-weight: 600;
    color: var(--alliance-text);
    font-size: 1rem;
}

.alliance-count {
    background-color: rgba(255, 255, 255, 0.2);
    padding: 2px 10px;
    border-radius: 30px;
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--alliance-text);
}

/* Обёртка таблицы для горизонтального скролла */
.table-wrapper {
    overflow-x: auto;
    border-radius: 20px;
    background-color: var(--table-bg);
    box-shadow: var(--shadow);
    border: 1px solid var(--table-border);
}

table {
    width: 100%;
    border-collapse: collapse;
    background-color: var(--table-bg);
    min-width: 700px;
}

th {
    text-align: left;
    padding: 16px 12px;
    background-color: var(--table-header-bg);
    color: var(--table-text);
    font-weight: 600;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid var(--table-border);
}

td {
    padding: 14px 12px;
    border-bottom: 1px solid var(--table-border);
    color: var(--table-text-secondary);
}

/* Группа */
.group-separator td {
    background-color: var(--group-bg);
    padding: 8px 12px;
    border-bottom: 1px solid var(--table-border);
}

.group-label {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--group-text);
    font-size: 0.9rem;
}

.group-icon {
    font-size: 0.9rem;
    opacity: 0.7;
}

.group-count {
    background-color: rgba(0, 0, 0, 0.08);
    padding: 2px 8px;
    border-radius: 20px;
    font-size: 0.7rem;
    font-weight: 500;
}

/* Сотрудник */
.employee-row:hover {
    background-color: var(--hover-bg);
}

.employee-name {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 500;
    color: var(--table-text);
}

.name-avatar {
    width: 32px;
    height: 32px;
    background: var(--alliance-bg);
    border-radius: 10px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 600;
    color: white;
    flex-shrink: 0;
}

.group-cell {
    width: 0;
    padding: 0;
}

/* Смены */
.shifts-cell {
    max-width: 280px;
}

.shifts-preview {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.shifts-count-badge {
    background-color: var(--badge-bg);
    color: var(--badge-text);
    padding: 2px 8px;
    border-radius: 20px;
    font-size: 0.7rem;
    font-weight: 500;
    white-space: nowrap;
}

.shifts-dates {
    font-size: 0.8rem;
    color: var(--table-text-secondary);
}

.no-shifts {
    color: var(--table-text-secondary);
    font-size: 0.85rem;
}

/* Центрированные колонки */
.center-col {
    text-align: center;
}

.metric-value {
    font-weight: 600;
    color: var(--table-text);
}

.metric-value.warning {
    color: var(--warning-color);
    position: relative;
}

.metric-value.warning::after {
    content: "⚠️";
    margin-left: 4px;
    font-size: 0.7rem;
}

/* Проценты с барами */
.percentage-bar {
    position: relative;
    background-color: var(--percentage-bg);
    border-radius: 20px;
    height: 28px;
    width: 80px;
    margin: 0 auto;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
}

.percentage-fill {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    background-color: var(--percentage-fill);
    border-radius: 20px;
    transition: width 0.3s ease;
}

.percentage-fill.weekend {
    background-color: var(--percentage-fill-weekend);
}

.percentage-text {
    position: relative;
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--table-text);
    z-index: 1;
}

/* Действия */
.actions-header {
    text-align: center;
}

.actions-cell {
    white-space: nowrap;
    text-align: center;
}

.action-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    margin: 0 2px;
    border-radius: 12px;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.action-btn svg {
    width: 18px;
    height: 18px;
}

.edit-btn {
    color: var(--edit-color);
}

.edit-btn:hover {
    background-color: rgba(16, 185, 129, 0.1);
    transform: scale(1.05);
}

.delete-btn {
    color: var(--delete-color);
}

.delete-btn:hover {
    background-color: rgba(239, 68, 68, 0.1);
    transform: scale(1.05);
}

@media (prefers-color-scheme: dark) {
    .delete-btn:hover {
        background-color: rgba(249, 115, 22, 0.15);
    }
}

/* Пустое состояние */
.no-data {
    text-align: center;
    padding: 60px 20px;
    background-color: var(--table-bg);
    border-radius: 24px;
    border: 1px solid var(--table-border);
}

.no-data svg {
    width: 64px;
    height: 64px;
    color: var(--table-text-secondary);
    opacity: 0.5;
    margin-bottom: 16px;
}

.no-data p {
    margin: 0 0 8px 0;
    font-size: 1.1rem;
    font-weight: 500;
    color: var(--table-text);
}

.no-data span {
    font-size: 0.85rem;
    color: var(--table-text-secondary);
}

/* Адаптивность */
@media (max-width: 768px) {
    .alliance-header {
        padding: 8px 16px;
    }
    
    .employees-table h2 {
        font-size: 1.3rem;
    }
    
    .shifts-cell {
        max-width: 200px;
    }
}
</style>