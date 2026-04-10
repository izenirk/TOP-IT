<template>
    <div v-if="visible" class="employee-details">
        <button class="back-btn" @click="$emit('close')">← Назад к списку</button>
        
        <h3>{{ currentEmployee?.name }}</h3>
        <div class="employee-info">
            {{ currentEmployee?.alliance }} - {{ currentEmployee?.group }}
        </div>
        
        <div class="shifts-list">
            <div v-for="(shift, idx) in sortedShifts" :key="idx" class="shift-item">
                <div class="shift-info">
                    {{ formatShift(shift) }}
                </div>
                <div class="shift-actions">
                    <button class="delete-shift-btn" @click="confirmDeleteShift(idx)">
                        Удалить
                    </button>
                </div>
            </div>
        </div>
        
        <button class="delete-employee-btn" @click="confirmDeleteEmployee">
            Удалить сотрудника
        </button>
    </div>
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
.employee-details {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 500px;
    max-width: 90%;
    max-height: 80%;
    overflow-y: auto;
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    z-index: 1000;
}

.back-btn {
    background-color: #6c757d;
    color: white;
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-bottom: 15px;
}

.employee-info {
    margin: 10px 0;
    padding: 10px;
    background-color: #f5f5f5;
    border-radius: 4px;
    color: #666;
}

.shifts-list {
    margin: 20px 0;
}

.shift-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    margin: 5px 0;
    background-color: #f9f9f9;
    border: 1px solid #eee;
    border-radius: 4px;
}

.shift-info {
    flex-grow: 1;
}

.delete-shift-btn {
    background-color: #ff9800;
    color: white;
    padding: 5px 10px;
    border: none;
    border-radius: 3px;
    cursor: pointer;
}

.delete-employee-btn {
    background-color: #f44336;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    width: 100%;
    margin-top: 10px;
}

.delete-employee-btn:hover {
    background-color: #d32f2f;
}
</style>