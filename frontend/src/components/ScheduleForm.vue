<template>
    <div class="schedule-form" v-if="selectedEmployee">
        <h2>Добавление графика</h2>
        <form @submit.prevent="addSchedule">
            <div class="form-group">
                <label for="date">Выберите дату:</label>
                <select id="date" v-model="selectedDate" @change="checkConsecutive" required>
                    <option v-for="date in dateOptions" :key="date.value" :value="date.value">
                        {{ date.label }}
                    </option>
                </select>
            </div>
            
            <div v-if="consecutiveWarning" class="alert" :class="consecutiveWarningClass">
                {{ consecutiveWarning }}
            </div>
            
            <div class="form-group">
                <label for="startTime">Начало смены:</label>
                <select id="startTime" v-model="startTime" @change="onStartTimeChange" required>
                    <option v-for="time in startTimeOptions" :key="time.value" :value="time.value">
                        {{ time.label }}
                    </option>
                </select>
            </div>
            
            <div class="form-group" v-if="startTime && startTime !== 'Выходной'">
                <label for="endTime">Конец смены:</label>
                <select id="endTime" v-model="endTime" required>
                    <option v-for="time in endTimeOptions" :key="time.value" :value="time.value" :disabled="time.disabled">
                        {{ time.label }}
                    </option>
                </select>
            </div>
            
            <button type="submit" class="submit-btn">Добавить график</button>
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
                    this.consecutiveWarning = `⚠️ Предупреждение: При добавлении этой смены будет ${check.count} смен подряд! Максимально допустимо - 6 смен.`;
                    this.consecutiveWarningClass = 'warning';
                } else if (check.count > 4) {
                    this.consecutiveWarning = `⚠️ Внимание: ${check.count} смен подряд. Осталось ${6 - check.count} до лимита.`;
                    this.consecutiveWarningClass = 'alert';
                } else {
                    this.consecutiveWarning = '';
                }
            } else {
                this.consecutiveWarning = '';
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
                if (!consecutiveCheck.canAdd) {
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
.schedule-form {
    background-color: #f9f9f9;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
    margin-bottom: 20px;
}

.schedule-form h2 {
    margin-bottom: 15px;
    font-size: 1.2em;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
}

.form-group select {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
}

.submit-btn {
    background-color: #4CAF50;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
}

.submit-btn:hover {
    background-color: #45a049;
}
</style>