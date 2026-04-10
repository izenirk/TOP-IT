<template>
  <div class="month-view">
    <div class="month-header-info">
      <div class="month-title-wrapper">
        <div class="month-icon">
          <svg viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
            <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2"/>
            <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2"/>
            <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <h3 class="month-title">{{ formatMonthYear(currentDate) }}</h3>
      </div>
      <div class="month-stats" v-if="totalShifts > 0">
        <div class="stat-badge shifts">
          <svg viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
            <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2"/>
            <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2"/>
            <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/>
          </svg>
          <span>{{ totalShifts }} смен</span>
        </div>
        <div class="stat-badge employees">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M20 21V19C20 16.8 18.2 15 16 15H8C5.8 15 4 16.8 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
          </svg>
          <span>{{ uniqueEmployeesCount }} сотрудников</span>
        </div>
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
          <span class="weekday-name">{{ day }}</span>
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
            @shift-click="$emit('shift-click', $event)"
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
  
  emits: ['shift-click'],
  
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
/* CSS Variables для светлой и тёмной темы */
.month-view {
  --month-bg-start: #f8fafc;
  --month-bg-end: #f1f5f9;
  --grid-bg: #ffffff;
  --header-bg-start: #4f46e5;
  --header-bg-end: #7c3aed;
  --header-text: #ffffff;
  --border-color: #e2e8f0;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --badge-bg: #ffffff;
  --badge-text: #1e293b;
  --legend-text: #64748b;
  --shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

@media (prefers-color-scheme: dark) {
  .month-view {
    --month-bg-start: #0f172a;
    --month-bg-end: #1e293b;
    --grid-bg: #1e293b;
    --header-bg-start: #4f46e5;
    --header-bg-end: #7c3aed;
    --header-text: #f1f5f9;
    --border-color: #334155;
    --text-primary: #f1f5f9;
    --text-secondary: #94a3b8;
    --badge-bg: #334155;
    --badge-text: #e2e8f0;
    --legend-text: #94a3b8;
    --shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
}

.month-view {
  background: linear-gradient(135deg, var(--month-bg-start) 0%, var(--month-bg-end) 100%);
  border-radius: 24px;
  padding: 24px;
  overflow-x: auto;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
}

/* Заголовок месяца */
.month-header-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 2px solid var(--border-color);
  flex-wrap: wrap;
  gap: 16px;
}

.month-title-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.month-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, var(--header-bg-start), var(--header-bg-end));
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
}

.month-icon svg {
  width: 24px;
  height: 24px;
  color: white;
}

.month-title {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--header-bg-start) 0%, var(--header-bg-end) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
}

.month-stats {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.stat-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--badge-bg);
  border-radius: 40px;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--badge-text);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--border-color);
}

.stat-badge svg {
  width: 16px;
  height: 16px;
}

/* Сетка календаря */
.month-grid {
  background: var(--grid-bg);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: var(--shadow);
  border: 1px solid var(--border-color);
}

.month-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: linear-gradient(135deg, var(--header-bg-start) 0%, var(--header-bg-end) 100%);
}

.weekday-header {
  text-align: center;
  padding: 16px 8px;
  color: var(--header-text);
  font-weight: 600;
  font-size: 0.85rem;
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
  top: 25%;
  height: 50%;
  width: 1px;
  background: rgba(255, 255, 255, 0.2);
}

.weekday-name {
  position: relative;
  z-index: 1;
}

.month-body {
  background: var(--grid-bg);
}

.week-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-bottom: 1px solid var(--border-color);
  transition: background 0.2s ease;
}

.week-row:hover {
  background: rgba(99, 102, 241, 0.03);
}

.week-row:last-child {
  border-bottom: none;
}

/* Легенда */
.month-footer {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.legend {
  display: flex;
  justify-content: center;
  gap: 28px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.7rem;
  color: var(--legend-text);
  font-weight: 500;
}

.legend-color {
  width: 24px;
  height: 24px;
  border-radius: 8px;
  transition: transform 0.2s ease;
}

.legend-color.current-month {
  background: var(--grid-bg);
  border: 1px solid var(--border-color);
}

.legend-color.other-month {
  background: var(--month-bg-end);
  border: 1px solid var(--border-color);
}

.legend-color.weekend {
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid #f59e0b;
}

.legend-color.today {
  background: linear-gradient(135deg, #eef2ff, #e0e7ff);
  border: 2px solid #4f46e5;
}

@media (prefers-color-scheme: dark) {
  .legend-color.today {
    background: linear-gradient(135deg, #312e81, #4338ca);
  }
}

.legend-color.shift {
  background: #10b981;
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-item:hover .legend-color {
  transform: scale(1.05);
}

/* Адаптивность */
@media (max-width: 1024px) {
  .month-view {
    padding: 20px;
  }
  
  .month-title {
    font-size: 1.4rem;
  }
}

@media (max-width: 768px) {
  .month-view {
    padding: 16px;
    border-radius: 20px;
  }
  
  .month-title {
    font-size: 1.2rem;
  }
  
  .month-icon {
    width: 36px;
    height: 36px;
    border-radius: 12px;
  }
  
  .month-icon svg {
    width: 18px;
    height: 18px;
  }
  
  .weekday-header {
    padding: 12px 4px;
    font-size: 0.75rem;
  }
  
  .stat-badge {
    padding: 6px 12px;
    font-size: 0.7rem;
  }
  
  .stat-badge svg {
    width: 14px;
    height: 14px;
  }
  
  .legend {
    gap: 16px;
  }
  
  .legend-item {
    font-size: 0.65rem;
  }
  
  .legend-color {
    width: 20px;
    height: 20px;
    border-radius: 6px;
  }
}

@media (max-width: 480px) {
  .month-view {
    padding: 12px;
    border-radius: 16px;
  }
  
  .month-header-info {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .weekday-header {
    font-size: 0.7rem;
    padding: 10px 2px;
  }
  
  .month-title {
    font-size: 1.1rem;
  }
  
  .month-icon {
    width: 32px;
    height: 32px;
  }
  
  .legend {
    gap: 12px;
  }
  
  .legend-item {
    font-size: 0.6rem;
  }
}

/* Анимации */
.week-row {
  transition: background 0.2s ease;
}

/* Кастомный скроллбар */
.month-view::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.month-view::-webkit-scrollbar-track {
  background: var(--border-color);
  border-radius: 10px;
}

.month-view::-webkit-scrollbar-thumb {
  background: var(--text-secondary);
  border-radius: 10px;
}

.month-view::-webkit-scrollbar-thumb:hover {
  background: var(--text-primary);
}
</style>