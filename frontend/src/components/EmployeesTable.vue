<template>
    <div class="employees-table">
        <h2>Список графиков</h2>
        <div v-if="employeesList.length > 0">
            <div v-for="alliance in uniqueAlliances" :key="alliance" class="alliance-section">
                <table>
                    <caption><strong>{{ alliance }}</strong></caption>
                    <thead>
                        <tr>
                            <th>Группа</th>
                            <th>Сотрудник</th>
                            <th>Смены</th>
                            <th>Макс. подряд</th>
                            <th>% в будни</th>
                            <th>% в выходные</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-for="group in getGroupsByAlliance(alliance)" :key="group">
                            <tr class="group-separator">
                                <td colspan="7"><strong>{{ group }}</strong></td>
                            </tr>
                            <tr v-for="employee in getEmployeesByGroup(alliance, group)" :key="employee.originalIndex">
                                <td></td>
                                <td>{{ employee.name }}</td>
                                <td class="shifts-cell">
                                    {{ formatShifts(employee.shifts) }}
                                </td>
                                <td :class="{ warning: employee.maxConsecutive > 6 }">
                                    {{ employee.maxConsecutive }}
                                </td>
                                <td>{{ employee.metrics.weekdayPercentage }}%</td>
                                <td>{{ employee.metrics.weekendPercentage }}%</td>
                                <td class="actions-cell">
                                    <button class="edit-btn" @click="showDetails(employee.originalIndex)" title="Редактировать">
                                        ✏️
                                    </button>
                                    <button class="delete-btn" @click="confirmDeleteEmployee(employee.originalIndex, employee.name)" title="Удалить сотрудника">
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>
        </div>
        <div v-else class="no-data">
            <p>Нет внесенных графиков.</p>
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
        getGroupsByAlliance(alliance) {
            const groups = this.employeesList
                .filter(emp => emp.alliance === alliance)
                .map(emp => emp.group);
            return [...new Set(groups)];
        },
        
        getEmployeesByGroup(alliance, group) {
            return this.employeesList.filter(emp => emp.alliance === alliance && emp.group === group);
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
.employees-table {
    margin-top: 20px;
}

.employees-table h2 {
    margin-bottom: 15px;
    color: #333;
}

.alliance-section {
    margin-bottom: 30px;
}

table {
    width: 100%;
    border-collapse: collapse;
    background-color: white;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

caption {
    text-align: left;
    font-size: 1.1em;
    margin-bottom: 10px;
    padding: 10px;
    background-color: #f2f2f2;
    border-radius: 4px;
    font-weight: bold;
}

th, td {
    border: 1px solid #ddd;
    padding: 10px;
    text-align: left;
}

th {
    background-color: #f2f2f2;
    font-weight: bold;
}

.group-separator {
    background-color: #f9f9f9;
}

.group-separator td {
    padding: 8px 10px;
    background-color: #e9ecef;
}

.shifts-cell {
    max-width: 300px;
    word-wrap: break-word;
    font-size: 0.9em;
}

.actions-cell {
    white-space: nowrap;
}

.edit-btn, .delete-btn {
    padding: 5px 10px;
    margin: 0 2px;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s ease;
}

.edit-btn {
    background-color: #4CAF50;
    color: white;
}

.edit-btn:hover {
    background-color: #45a049;
    transform: translateY(-1px);
}

.delete-btn {
    background-color: #f44336;
    color: white;
}

.delete-btn:hover {
    background-color: #da190b;
    transform: translateY(-1px);
}

.warning {
    color: #ff9800;
    font-weight: bold;
}

.no-data {
    text-align: center;
    padding: 40px;
    background-color: white;
    border-radius: 4px;
    color: #666;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
</style>