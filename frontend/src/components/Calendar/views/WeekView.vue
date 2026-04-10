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

/* CSS Variables для светлой и тёмной темы */
.week-view {
  --bg-gradient-start: #f8f9fa;
  --bg-gradient-end: #e9ecef;
  --card-bg: #ffffff;
  --text-primary: #0f172a;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;
  --border-color: #e2e8f0;
  --header-gradient-start: #4f46e5;
  --header-gradient-end: #7c3aed;
  --header-text: #ffffff;
  --stat-bg: #ffffff;
  --stat-text: #1e293b;
  --stat-shadow: rgba(0, 0, 0, 0.1);
  --cell-bg: #ffffff;
  --cell-border: #f1f5f9;
  --cell-hover: #f8fafc;
  --shift-bg: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  --weekend-bg: #fff8f0;
  --current-hour-bg: #e3f2fd;
  --current-hour-border: #3b82f6;
  --today-border: #4f46e5;
  --scrollbar-track: #f1f1f1;
  --scrollbar-thumb: #cbd5e1;
  --scrollbar-thumb-hover: #94a3b8;
}

@media (prefers-color-scheme: dark) {
  .week-view {
    --bg-gradient-start: #0f172a;
    --bg-gradient-end: #1e293b;
    --card-bg: #1e293b;
    --text-primary: #f1f5f9;
    --text-secondary: #cbd5e1;
    --text-muted: #94a3b8;
    --border-color: #334155;
    --header-gradient-start: #6366f1;
    --header-gradient-end: #a855f7;
    --header-text: #ffffff;
    --stat-bg: #334155;
    --stat-text: #f1f5f9;
    --stat-shadow: rgba(0, 0, 0, 0.3);
    --cell-bg: #1e293b;
    --cell-border: #334155;
    --cell-hover: #334155;
    --shift-bg: linear-gradient(135deg, #064e3b 0%, #065f46 100%);
    --weekend-bg: #3f3f46;
    --current-hour-bg: #1e1b4b;
    --current-hour-border: #818cf8;
    --today-border: #a855f7;
    --scrollbar-track: #1e293b;
    --scrollbar-thumb: #475569;
    --scrollbar-thumb-hover: #64748b;
  }
}

.week-view {
  background: linear-gradient(135deg, var(--bg-gradient-start) 0%, var(--bg-gradient-end) 100%);
  border-radius: clamp(12px, 4vw, 20px);
  padding: clamp(12px, 3vw, 24px);
  overflow-x: auto;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  transition: all 0.3s ease;
}

/* Заголовок недели */
.week-header-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--border-color);
  flex-wrap: wrap;
  gap: 12px;
}

.week-title {
  margin: 0;
  font-size: clamp(1.2rem, 5vw, 1.8rem);
  font-weight: 700;
  background: linear-gradient(135deg, var(--header-gradient-start) 0%, var(--header-gradient-end) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
}

.week-stats {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.stat-badge {
  padding: 6px 14px;
  background: var(--stat-bg);
  border-radius: 40px;
  font-size: clamp(0.7rem, 3vw, 0.85rem);
  font-weight: 600;
  color: var(--stat-text);
  box-shadow: 0 2px 4px var(--stat-shadow);
  transition: all 0.2s ease;
  cursor: default;
  backdrop-filter: blur(4px);
}

.stat-badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--stat-shadow);
}

/* Основная сетка */
.week-grid {
  background: var(--card-bg);
  border-radius: clamp(12px, 3vw, 16px);
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  min-width: 800px;
  transition: all 0.3s ease;
}

/* Заголовки дней */
.week-header {
  display: flex;
  background: linear-gradient(135deg, var(--header-gradient-start) 0%, var(--header-gradient-end) 100%);
  border-bottom: 2px solid rgba(255, 255, 255, 0.15);
}

.time-column {
  width: 80px;
  flex-shrink: 0;
  background: rgba(0, 0, 0, 0.08);
}

.time-label {
  padding: 14px 8px;
  text-align: center;
  font-weight: 700;
  color: var(--header-text);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.day-header {
  flex: 1;
  text-align: center;
  padding: 14px 8px;
  color: var(--header-text);
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
}

.day-header:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
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
  background: rgba(255, 255, 255, 0.08);
}

.day-header.today {
  background: rgba(255, 255, 255, 0.2);
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.5);
  animation: pulseGlow 2s infinite;
}

@keyframes pulseGlow {
  0%, 100% {
    box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.5);
  }
  50% {
    box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.8);
  }
}

.day-name {
  font-weight: 700;
  font-size: clamp(0.75rem, 3vw, 0.9rem);
  margin-bottom: 4px;
}

.date {
  font-size: clamp(0.65rem, 2.5vw, 0.8rem);
  opacity: 0.9;
  font-weight: 500;
}

.shifts-count {
  font-size: 0.7rem;
  margin-top: 6px;
  opacity: 0.85;
  background: rgba(255, 255, 255, 0.2);
  display: inline-block;
  padding: 2px 10px;
  border-radius: 20px;
  transition: all 0.2s ease;
}

.day-header:hover .shifts-count {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

/* Тело недели */
.week-body {
  display: flex;
}

.hour-cell {
  height: 44px;
  border-bottom: 1px solid var(--cell-border);
  border-right: 1px solid var(--cell-border);
  position: relative;
  transition: all 0.2s ease;
}

.time-column .hour-cell {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 12px;
  background: var(--cell-hover);
  font-size: 0.7rem;
  color: var(--text-secondary);
  font-family: 'SF Mono', 'Courier New', monospace;
  font-weight: 600;
}

.hour-number {
  font-size: 0.7rem;
}

.time-column .hour-cell.current-hour {
  background: var(--current-hour-bg);
  color: var(--current-hour-border);
  font-weight: 700;
  position: relative;
}

.time-column .hour-cell.current-hour::before {
  content: '●';
  position: absolute;
  left: 8px;
  font-size: 8px;
  color: var(--current-hour-border);
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.day-column {
  flex: 1;
}

.day-column .hour-cell {
  background: var(--cell-bg);
}

.day-column .hour-cell.has-shift {
  background: var(--shift-bg);
  position: relative;
}

.day-column .hour-cell.has-shift::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #10b981, #34d399, #10b981);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
}

.day-column .hour-cell.current-hour-cell {
  background: var(--current-hour-bg);
  box-shadow: inset 0 0 0 2px var(--current-hour-border);
  z-index: 2;
}

.day-column.weekend-column .hour-cell {
  background: var(--weekend-bg);
}

.day-column.weekend-column .hour-cell.has-shift {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
}

@media (prefers-color-scheme: dark) {
  .day-column.weekend-column .hour-cell.has-shift {
    background: linear-gradient(135deg, #78350f 0%, #92400e 100%);
  }
}

/* Hover эффекты */
.day-column .hour-cell:hover {
  background: var(--cell-hover);
  transform: scale(1.01);
  z-index: 3;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.day-column .hour-cell.has-shift:hover {
  filter: brightness(0.98);
}

/* Подвал с легендой */
.week-footer {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 2px solid var(--border-color);
}

.legend {
  display: flex;
  justify-content: center;
  gap: clamp(16px, 4vw, 32px);
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: clamp(0.7rem, 3vw, 0.85rem);
  color: var(--text-secondary);
  font-weight: 500;
  cursor: default;
  transition: all 0.2s ease;
  padding: 4px 8px;
  border-radius: 40px;
}

.legend-item:hover {
  background: rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}

@media (prefers-color-scheme: dark) {
  .legend-item:hover {
    background: rgba(255, 255, 255, 0.05);
  }
}

.legend-color {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.legend-color.has-shift {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  border: 1px solid #4caf50;
}

.legend-color.weekend {
  background: #fff8f0;
  border: 1px solid #f59e0b;
}

.legend-color.today {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  border: 2px solid rgba(255, 255, 255, 0.5);
}

.legend-color.current-hour {
  background: var(--current-hour-bg);
  border: 2px solid var(--current-hour-border);
}

@media (prefers-color-scheme: dark) {
  .legend-color.has-shift {
    background: linear-gradient(135deg, #064e3b 0%, #065f46 100%);
  }
  
  .legend-color.weekend {
    background: #3f3f46;
  }
}

/* Адаптивность */
@media (max-width: 1024px) {
  .week-view {
    padding: 16px;
  }
  
  .time-column {
    width: 70px;
  }
  
  .hour-cell {
    height: 40px;
  }
}

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
    font-size: 0.7rem;
  }
  
  .date {
    font-size: 0.6rem;
  }
  
  .stat-badge {
    font-size: 0.65rem;
    padding: 4px 10px;
  }
  
  .hour-number {
    font-size: 0.6rem;
  }
  
  .hour-cell {
    height: 36px;
  }
  
  .time-label {
    font-size: 0.7rem;
    padding: 10px 4px;
  }
  
  .legend-item {
    font-size: 0.65rem;
  }
  
  .legend-color {
    width: 20px;
    height: 20px;
  }
}

@media (max-width: 640px) {
  .week-header-info {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .week-stats {
    width: 100%;
    justify-content: flex-start;
  }
}

/* Стили для скроллбара */
.week-view::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.week-view::-webkit-scrollbar-track {
  background: var(--scrollbar-track);
  border-radius: 10px;
}

.week-view::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb);
  border-radius: 10px;
  transition: all 0.2s ease;
}

.week-view::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-thumb-hover);
}

/* Анимация загрузки */
.week-view {
  animation: fadeInUp 0.4s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Эффект ripple при клике */
.hour-cell:active {
  transform: scale(0.98);
}
</style>