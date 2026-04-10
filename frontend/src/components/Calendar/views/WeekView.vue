<template>
  <div class="week-view">
    <div class="week-header-info">
      <h3 class="week-title">{{ weekTitle }}</h3>
      <div class="week-stats" v-if="totalWeekShifts > 0">
        <span class="stat-badge">📊 Смен за неделю: {{ totalWeekShifts }}</span>
        <span class="stat-badge">👥 Сотрудников: {{ uniqueEmployeesCount }}</span>
        <span class="stat-badge">📅 Дней: {{ daysWithShifts }}</span>
      </div>
    </div>
    
    <div class="week-grid">
      <div class="week-header">
        <div class="time-column">
          <div class="time-label">Время</div>
        </div>
        <div 
          v-for="day in weekDays" 
          :key="day.date"
          class="day-header"
          :class="{ 
            weekend: day.isWeekend,
            today: isToday(day.date)
          }"
        >
          <div class="day-name">{{ day.name }}</div>
          <div class="date">{{ formatDate(day.date, 'day') }}</div>
          <div class="shifts-count" v-if="day.shifts.length > 0">
            {{ day.shifts.length }} смен
          </div>
        </div>
      </div>
      
      <div class="week-body">
        <div class="time-column">
          <div 
            v-for="hour in 24" 
            :key="hour" 
            class="hour-cell"
            :class="{ 'current-hour': isCurrentHour(hour) }"
          >
            <span class="hour-number">{{ hour }}:00</span>
          </div>
        </div>
        
        <div 
          v-for="day in weekDays" 
          :key="day.date"
          class="day-column"
          :class="{ 'weekend-column': day.isWeekend }"
        >
          <div 
            v-for="hour in 24" 
            :key="hour"
            class="hour-cell"
            :class="{ 
              'has-shift': hasShiftAtTime(day, hour),
              'current-hour-cell': isToday(day.date) && isCurrentHour(hour)
            }"
          >
            <ShiftMini 
              v-for="shift in getShiftsAtTime(day, hour)"
              :key="shift.id"
              :shift="shift"
            />
          </div>
        </div>
      </div>
    </div>
    
    <div class="week-footer" v-if="hasLegend">
      <div class="legend">
        <div class="legend-item">
          <span class="legend-color has-shift"></span>
          <span>Есть смена</span>
        </div>
        <div class="legend-item">
          <span class="legend-color weekend"></span>
          <span>Выходной день</span>
        </div>
        <div class="legend-item">
          <span class="legend-color today"></span>
          <span>Сегодня</span>
        </div>
        <div class="legend-item">
          <span class="legend-color current-hour"></span>
          <span>Текущий час</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ShiftMini from '../ShiftMini.vue'
import { formatDate, getWeekDays, hasShiftAtTime, getShiftsAtTime } from '../utils/dateUtils.js'

export default {
  name: 'WeekView',
  
  components: {
    ShiftMini
  },
  
  props: {
    currentDate: {
      type: Date,
      required: true
    },
    shifts: {
      type: Array,
      default: () => []
    }
  },
  
  data() {
    return {
      weekDayNames: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
      currentTime: new Date()
    }
  },
  
  computed: {
    weekDays() {
      return getWeekDays(this.currentDate, this.shifts, this.weekDayNames)
    },
    
    weekTitle() {
      const start = this.getStartOfWeek(this.currentDate)
      const end = new Date(start)
      end.setDate(start.getDate() + 6)
      return `${this.formatDate(start, 'day')} - ${this.formatDate(end, 'day')}`
    },
    
    totalWeekShifts() {
      return this.weekDays.reduce((total, day) => total + day.shifts.length, 0)
    },
    
    uniqueEmployeesCount() {
      const employees = new Set()
      this.weekDays.forEach(day => {
        day.shifts.forEach(shift => {
          employees.add(shift.employeeId)
        })
      })
      return employees.size
    },
    
    daysWithShifts() {
      return this.weekDays.filter(day => day.shifts.length > 0).length
    },
    
    hasLegend() {
      return this.totalWeekShifts > 0
    }
  },
  
  mounted() {
    // Обновляем текущее время каждую минуту
    setInterval(() => {
      this.currentTime = new Date()
    }, 60000)
  },
  
  methods: {
    formatDate,
    
    hasShiftAtTime(day, hour) {
      return hasShiftAtTime(day, hour)
    },
    
    getShiftsAtTime(day, hour) {
      return getShiftsAtTime(day, hour)
    },
    
    getStartOfWeek(date) {
      const d = new Date(date)
      const day = d.getDay()
      const diff = (day === 0 ? 6 : day - 1)
      d.setDate(d.getDate() - diff)
      return d
    },
    
    isToday(dateStr) {
      const today = new Date()
      const todayStr = this.formatDate(today, 'iso')
      return dateStr === todayStr
    },
    
    isCurrentHour(hour) {
      const currentHour = this.currentTime.getHours()
      return hour === currentHour
    }
  }
}
</script>

<style scoped>
.week-view {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 16px;
  padding: 20px;
  overflow-x: auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Заголовок недели */
.week-header-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e0e0e0;
  flex-wrap: wrap;
  gap: 12px;
}

.week-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.week-stats {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.stat-badge {
  padding: 6px 12px;
  background: white;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  color: #2c3e50;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Основная сетка */
.week-grid {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 800px;
}

/* Заголовки дней */
.week-header {
  display: flex;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
}

.time-column {
  width: 80px;
  flex-shrink: 0;
  background: rgba(0, 0, 0, 0.05);
}

.time-label {
  padding: 12px;
  text-align: center;
  font-weight: 600;
  color: white;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.day-header {
  flex: 1;
  text-align: center;
  padding: 12px 8px;
  color: white;
  position: relative;
  transition: all 0.3s ease;
}

.day-header:not(:last-child)::after {
  content: '';
  position: absolute;
  right: 0;
  top: 20%;
  height: 60%;
  width: 1px;
  background: rgba(255, 255, 255, 0.2);
}

.day-header.weekend {
  background: rgba(255, 255, 255, 0.1);
}

.day-header.today {
  background: rgba(255, 255, 255, 0.2);
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.5);
}

.day-name {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
}

.date {
  font-size: 12px;
  opacity: 0.9;
  font-weight: normal;
}

.shifts-count {
  font-size: 11px;
  margin-top: 4px;
  opacity: 0.8;
  background: rgba(255, 255, 255, 0.2);
  display: inline-block;
  padding: 2px 6px;
  border-radius: 10px;
}

/* Тело недели */
.week-body {
  display: flex;
}

.hour-cell {
  height: 40px;
  border-bottom: 1px solid #f0f0f0;
  border-right: 1px solid #f0f0f0;
  position: relative;
  transition: background 0.2s ease;
}

.time-column .hour-cell {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 12px;
  background: #fafbfc;
  font-size: 11px;
  color: #6c757d;
  font-family: 'Courier New', monospace;
  font-weight: 500;
}

.hour-number {
  font-size: 11px;
}

.time-column .hour-cell.current-hour {
  background: #e3f2fd;
  color: #1976d2;
  font-weight: bold;
}

.day-column {
  flex: 1;
}

.day-column .hour-cell {
  background: white;
}

.day-column .hour-cell.has-shift {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
}

.day-column .hour-cell.current-hour-cell {
  background: #fff3e0;
  box-shadow: inset 0 0 0 2px #ff9800;
}

.day-column.weekend-column .hour-cell {
  background: #fff8f0;
}

.day-column.weekend-column .hour-cell.has-shift {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
}

/* Подвал с легендой */
.week-footer {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
}

.legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #6c757d;
}

.legend-color {
  width: 20px;
  height: 20px;
  border-radius: 4px;
}

.legend-color.has-shift {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  border: 1px solid #4caf50;
}

.legend-color.weekend {
  background: #fff8f0;
  border: 1px solid #ff9800;
}

.legend-color.today {
  background: rgba(102, 126, 234, 0.2);
  border: 2px solid #667eea;
}

.legend-color.current-hour {
  background: #fff3e0;
  border: 2px solid #ff9800;
}

/* Адаптивность */
@media (max-width: 768px) {
  .week-view {
    padding: 12px;
  }
  
  .week-title {
    font-size: 1.2rem;
  }
  
  .time-column {
    width: 60px;
  }
  
  .day-name {
    font-size: 12px;
  }
  
  .date {
    font-size: 10px;
  }
  
  .stat-badge {
    font-size: 11px;
    padding: 4px 8px;
  }
  
  .hour-number {
    font-size: 9px;
  }
}

/* Анимации */
.day-header:hover,
.hour-cell:hover {
  filter: brightness(0.98);
}

.day-column .hour-cell {
  transition: all 0.2s ease;
}

/* Стили для скроллбара */
.week-view::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.week-view::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 5px;
}

.week-view::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 5px;
}

.week-view::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>