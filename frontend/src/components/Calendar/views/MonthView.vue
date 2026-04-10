<template>
  <div class="month-view">
    <div class="month-header-info">
      <h3 class="month-title">{{ formatMonthYear(currentDate) }}</h3>
      <div class="month-stats" v-if="totalShifts > 0">
        <span class="stat-badge">📊 Всего смен: {{ totalShifts }}</span>
        <span class="stat-badge">👥 Сотрудников: {{ uniqueEmployeesCount }}</span>
      </div>
    </div>
    
    <div class="month-grid">
      <div class="month-header">
        <div 
          v-for="day in weekDayNames" 
          :key="day"
          class="weekday-header"
          :class="{ weekend: isWeekend(day) }"
        >
          {{ day }}
        </div>
      </div>
      
      <div class="month-body">
        <div 
          v-for="week in monthWeeks" 
          :key="week.weekNumber"
          class="week-row"
        >
          <MonthDayCell 
            v-for="day in week.days" 
            :key="day.date"
            :day="day"
          />
        </div>
      </div>
    </div>
    
    <div class="month-footer" v-if="hasLegend">
      <div class="legend">
        <div class="legend-item">
          <span class="legend-color current-month"></span>
          <span>Текущий месяц</span>
        </div>
        <div class="legend-item">
          <span class="legend-color other-month"></span>
          <span>Другой месяц</span>
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
          <span class="legend-color shift"></span>
          <span>Есть смены</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MonthDayCell from '../MonthDayCell.vue'
import { getMonthWeeks, formatDate } from '../utils/dateUtils.js'

export default {
  name: 'MonthView',
  
  components: {
    MonthDayCell
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
      weekDayNames: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
    }
  },
  
  computed: {
    monthWeeks() {
      return getMonthWeeks(this.currentDate, this.shifts)
    },
    
    totalShifts() {
      return this.shifts.length
    },
    
    uniqueEmployeesCount() {
      const uniqueEmployees = new Set(this.shifts.map(shift => shift.employeeId))
      return uniqueEmployees.size
    },
    
    hasLegend() {
      return this.monthWeeks.some(week => 
        week.days.some(day => day.shifts.length > 0)
      )
    }
  },
  
  methods: {
    formatMonthYear(date) {
      return formatDate(date, 'monthYear')
    },
    
    isWeekend(day) {
      return day === 'Сб' || day === 'Вс'
    }
  }
}
</script>

<style scoped>
.month-view {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 16px;
  padding: 20px;
  overflow-x: auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Заголовок месяца */
.month-header-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e0e0e0;
  flex-wrap: wrap;
  gap: 12px;
}

.month-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.month-stats {
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

/* Сетка календаря */
.month-grid {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.month-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
}

.weekday-header {
  text-align: center;
  padding: 14px 8px;
  color: white;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
}

.weekday-header.weekend {
  background: rgba(255, 255, 255, 0.1);
}

.weekday-header:not(:last-child)::after {
  content: '';
  position: absolute;
  right: 0;
  top: 20%;
  height: 60%;
  width: 1px;
  background: rgba(255, 255, 255, 0.2);
}

.month-body {
  background: white;
}

.week-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s ease;
}

.week-row:hover {
  background: #fafbfc;
}

/* Легенда */
.month-footer {
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

.legend-color.current-month {
  background: white;
  border: 1px solid #ddd;
}

.legend-color.other-month {
  background: #fafafa;
  border: 1px solid #f0f0f0;
}

.legend-color.weekend {
  background: #fff3e0;
  border: 1px solid #ffe0b2;
}

.legend-color.today {
  background: #e3f2fd;
  border: 2px solid #2196F3;
}

.legend-color.shift {
  background: #4CAF50;
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

/* Адаптивность */
@media (max-width: 768px) {
  .month-view {
    padding: 12px;
  }
  
  .month-title {
    font-size: 1.2rem;
  }
  
  .weekday-header {
    padding: 10px 4px;
    font-size: 12px;
  }
  
  .stat-badge {
    font-size: 11px;
    padding: 4px 8px;
  }
  
  .legend {
    gap: 12px;
  }
  
  .legend-item {
    font-size: 10px;
  }
}

@media (max-width: 480px) {
  .month-header-info {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .weekday-header {
    font-size: 11px;
    padding: 8px 2px;
  }
}

/* Анимации */
.week-row {
  transition: all 0.2s ease;
}

/* Стили для скроллбара */
.month-view::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.month-view::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 5px;
}

.month-view::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 5px;
}

.month-view::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Эффект при наведении на строку */
.week-row:last-child {
  border-bottom: none;
}
</style>