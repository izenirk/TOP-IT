<template>
    <div class="employees-table">
        <h2>Список графиков</h2>
        <div v-if="Object.keys(groupedEmployees).length > 0">
            <div v-for="(allianceData, alliance) in groupedEmployees" :key="alliance" class="alliance-section">
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
                        <tr v-for="groupData in allianceData" :key="groupData.group">
                            <template v-for="employee in groupData.employees" :key="employee.originalIndex">
                                <tr>
                                    <td>{{ groupData.group }}</td>
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
                        </tr>
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
        groupedEmployees() {
            const grouped = {};
            scheduleStore.employees.forEach((emp, index) => {
                const metrics = calculateEmployeeMetrics(emp);
                const maxConsecutive = calculateMaxConsecutiveShifts(emp);
                
                if (!grouped[emp.alliance]) {
                    grouped[emp.alliance] = {};
                }
                if (!grouped[emp.alliance][emp.group]) {
                    grouped[emp.alliance][emp.group] = {
                        group: emp.group,
                        employees: []
                    };
                }
                
                grouped[emp.alliance][emp.group].employees.push({
                    ...emp,
                    originalIndex: index,
                    metrics,
                    maxConsecutive
                });
            });
            
            // Преобразуем в массив для удобства отображения
            const result = {};
            for (const alliance in grouped) {
                result[alliance] = Object.values(grouped[alliance]);
            }
            return result;
        }
    },
    methods: {
        formatShifts(shifts) {
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
}

.edit-btn {
    background-color: #4CAF50;
    color: white;
}

.delete-btn {
    background-color: #f44336;
    color: white;
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
}
</style>