<template>
    <div class="summary-panel">
        <h2>Общий свод</h2>
        
        <div v-if="totalShifts > 0">
            <div class="summary-section">
                <strong>Распределение смен по дням недели (100%):</strong>
                <div class="summary-stats">
                    <div v-for="(percentage, day) in weekdayPercentages" :key="day" class="stat-item">
                        {{ day }}: {{ percentage }}% ({{ shiftsByDay[dayIndexes[day]] }} смен)
                    </div>
                </div>
                <div class="target-info">
                    <small>Целевое распределение (норма 5/2):<br>
                    Пн-Пт: ~71.43% (5/7), Сб-Вс: ~28.57% (2/7)</small>
                </div>
            </div>
            
            <div class="summary-section">
                <strong>Смены по времени (100%):</strong>
                <div class="summary-stats">
                    <div class="stat-item">Начинаются до 11:00: {{ before11Percentage }}% ({{ before11Shifts }} смен)</div>
                    <div class="stat-item">Заканчиваются после 19:00: {{ after19Percentage }}% ({{ after19Shifts }} смен)</div>
                    <div class="stat-item">Остальное время: {{ otherTimePercentage }}%</div>
                </div>
            </div>
            
            <div v-if="warnings.length > 0" class="warnings">
                <div v-for="(warning, idx) in warnings" :key="idx" class="warning-item">
                    ⚠️ {{ warning }}
                </div>
            </div>
        </div>
        
        <div v-else class="no-data">
            Нет данных для свода.
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
                percentages[day] = this.totalShifts > 0 ? ((this.shiftsByDay[idx] / this.totalShifts) * 100).toFixed(2) : '0.00';
            });
            return percentages;
        },
        before11Percentage() {
            return this.totalShifts > 0 ? ((this.before11Shifts / this.totalShifts) * 100).toFixed(2) : '0.00';
        },
        after19Percentage() {
            return this.totalShifts > 0 ? ((this.after19Shifts / this.totalShifts) * 100).toFixed(2) : '0.00';
        },
        otherTimePercentage() {
            return (100 - parseFloat(this.before11Percentage) - parseFloat(this.after19Percentage)).toFixed(2);
        },
        warnings() {
            const warnings = [];
            if (this.employeesWithExcessConsecutive > 0) {
                warnings.push(`${this.employeesWithExcessConsecutive} сотрудник(ов) имеют более 6 смен подряд!`);
            }
            if (this.longShifts > 0) {
                warnings.push(`${this.longShifts} смен(ы) длительностью более 12 часов!`);
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
.summary-panel {
    width: 350px;
    background-color: white;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 20px;
    height: fit-content;
    position: sticky;
    top: 20px;
}

.summary-panel h2 {
    margin-bottom: 15px;
    font-size: 1.2em;
}

.summary-section {
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #eee;
}

.summary-stats {
    margin-top: 10px;
}

.stat-item {
    margin: 5px 0;
    font-size: 0.9em;
}

.target-info {
    margin-top: 10px;
    padding: 8px;
    background-color: #f9f9f9;
    border-radius: 4px;
    font-size: 0.85em;
    color: #666;
}

.warnings {
    margin-top: 15px;
}

.warning-item {
    color: #856404;
    background-color: #fff3cd;
    padding: 8px;
    margin: 5px 0;
    border-radius: 4px;
    font-size: 0.9em;
}

.no-data {
    color: #999;
    text-align: center;
    padding: 20px;
}
</style>