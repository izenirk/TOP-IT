<template>
  <div class="day-view">
    <div class="day-header">
      <div class="day-header-icon">
        <svg viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <polyline points="12 6 12 12 16 14" stroke="currentColor" stroke-width="2"/>
        </svg>
      </div>
      <div class="day-header-text">
        <h3>{{ formatDate(currentDate, 'full') }}</h3>
        <p class="shifts-count">{{ dayShifts.length }} {{ getShiftsText(dayShifts.length) }}</p>
      </div>
    </div>
    
    <div class="day-schedule">
      <div class="timeline">
        <div class="timeline-hours">
          <div v-for="hour in timelineHours" :key="hour" class="hour-marker" :class="{ 'current-hour': isCurrentHour(hour) }">
            <span class="hour-label">{{ hour }}:00</span>
            <span class="hour-ampm" v-if="getAmPm(hour)">{{ getAmPm(hour) }}</span>
          </div>
        </div>
        <div class="shifts-container">
          <div class="time-background">
            <div v-for="hour in 24" :key="hour" class="time-slot" :class="{ 'even': hour % 2 === 0 }"></div>
          </div>
          <ShiftBlock 
            v-for="shift in dayShifts" 
            :key="shift.id"
            :shift="shift"
            @shift-click="$emit('shift-click', $event)"
          />
        </div>
      </div>
    </div>
    
    <div v-if="dayShifts.length === 0" class="no-shifts">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M9 12H15M12 9V15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <p>Нет смен на этот день</p>
    </div>
  </div>
</template>

<script>
import ShiftBlock from '../ShiftBlock.vue';
import { formatDate, getDayShifts } from '../utils/dateUtils.js';

export default {
  name: 'DayView',
  
  components: {
    ShiftBlock
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
  
  computed: {
    timelineHours() {
      return Array.from({ length: 24 }, (_, i) => i)
    },
    
    dayShifts() {
      const dateStr = this.formatDate(this.currentDate, 'iso')
      return getDayShifts(this.shifts, dateStr)
    }
  },
  
  methods: {
    formatDate,
    
    getShiftsText(count) {
      if (count === 0) return 'нет смен'
      if (count === 1) return 'смена'
      if (count >= 2 && count <= 4) return 'смены'
      return 'смен'
    },
    
    getAmPm(hour) {
      if (hour === 0) return 'AM'
      if (hour === 12) return 'PM'
      return ''
    },
    
    isCurrentHour(hour) {
      const now = new Date()
      const today = this.formatDate(now, 'iso')
      const viewDate = this.formatDate(this.currentDate, 'iso')
      
      if (today !== viewDate) return false
      
      const currentHour = now.getHours()
      return currentHour === hour
    }
  }
}
</script>

<style scoped>
/* CSS Variables для светлой и тёмной темы */
.day-view {
  --day-bg: #ffffff;
  --day-border: #e2e8f0;
  --day-text: #0f172a;
  --day-text-secondary: #64748b;
  --header-icon-bg: linear-gradient(135deg, #6366f1, #8b5cf6);
  --timeline-bg: #f8fafc;
  --timeline-border: #e2e8f0;
  --hour-text: #94a3b8;
  --current-hour-bg: #eef2ff;
  --current-hour-text: #4f46e5;
  --slot-bg: #ffffff;
  --slot-even-bg: #fafcff;
  --no-shifts-icon: #cbd5e1;
}

@media (prefers-color-scheme: dark) {
  .day-view {
    --day-bg: #1e293b;
    --day-border: #334155;
    --day-text: #f1f5f9;
    --day-text-secondary: #94a3b8;
    --header-icon-bg: linear-gradient(135deg, #818cf8, #a78bfa);
    --timeline-bg: #0f172a;
    --timeline-border: #334155;
    --hour-text: #64748b;
    --current-hour-bg: #312e81;
    --current-hour-text: #a5b4fc;
    --slot-bg: #1e293b;
    --slot-even-bg: #1a2535;
    --no-shifts-icon: #475569;
  }
}

.day-view {
  background: var(--day-bg);
  border-radius: 20px;
  overflow: hidden;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
}

/* Шапка дня */
.day-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: linear-gradient(135deg, var(--day-bg) 0%, var(--timeline-bg) 100%);
  border-bottom: 1px solid var(--day-border);
}

.day-header-icon {
  width: 48px;
  height: 48px;
  background: var(--header-icon-bg);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
}

.day-header-icon svg {
  width: 26px;
  height: 26px;
  color: white;
}

.day-header-text h3 {
  margin: 0 0 4px 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--day-text);
  letter-spacing: -0.01em;
}

.shifts-count {
  margin: 0;
  font-size: 0.8rem;
  color: var(--day-text-secondary);
}

/* Расписание дня */
.day-schedule {
  position: relative;
  min-height: 600px;
  overflow-x: auto;
}

.timeline {
  display: flex;
  position: relative;
  min-width: 600px;
}

.timeline-hours {
  width: 80px;
  flex-shrink: 0;
  background: var(--timeline-bg);
  border-right: 1px solid var(--timeline-border);
}

.hour-marker {
  height: 60px;
  border-bottom: 1px solid var(--timeline-border);
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  padding-right: 12px;
  font-size: 0.7rem;
  color: var(--hour-text);
  font-family: 'SF Mono', 'Courier New', monospace;
  position: relative;
}

.hour-label {
  font-weight: 500;
  font-size: 0.7rem;
}

.hour-ampm {
  font-size: 0.55rem;
  opacity: 0.6;
}

/* Текущий час */
.hour-marker.current-hour {
  background: var(--current-hour-bg);
  position: relative;
}

.hour-marker.current-hour .hour-label {
  color: var(--current-hour-text);
  font-weight: 600;
}

.hour-marker.current-hour::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--current-hour-text);
}

/* Контейнер смен */
.shifts-container {
  flex: 1;
  position: relative;
  min-height: 1440px;
  background: var(--day-bg);
}

/* Фоновая сетка времени */
.time-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.time-slot {
  height: 60px;
  border-bottom: 1px solid var(--timeline-border);
  background: var(--slot-bg);
}

.time-slot.even {
  background: var(--slot-even-bg);
}

/* Нет смен */
.no-shifts {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 32px;
  text-align: center;
}

.no-shifts svg {
  width: 64px;
  height: 64px;
  color: var(--no-shifts-icon);
  margin-bottom: 16px;
  opacity: 0.5;
}

.no-shifts p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--day-text-secondary);
}

/* Адаптивность */
@media (max-width: 768px) {
  .day-header {
    padding: 16px 20px;
  }
  
  .day-header-icon {
    width: 40px;
    height: 40px;
    border-radius: 16px;
  }
  
  .day-header-icon svg {
    width: 22px;
    height: 22px;
  }
  
  .day-header-text h3 {
    font-size: 1.1rem;
  }
  
  .timeline-hours {
    width: 65px;
  }
  
  .hour-marker {
    height: 55px;
    padding-right: 8px;
  }
  
  .time-slot {
    height: 55px;
  }
}

@media (max-width: 480px) {
  .day-header {
    padding: 12px 16px;
  }
  
  .day-header-icon {
    width: 36px;
    height: 36px;
    border-radius: 14px;
  }
  
  .day-header-icon svg {
    width: 18px;
    height: 18px;
  }
  
  .day-header-text h3 {
    font-size: 0.95rem;
  }
  
  .shifts-count {
    font-size: 0.7rem;
  }
  
  .timeline-hours {
    width: 55px;
  }
  
  .hour-marker {
    height: 50px;
    padding-right: 6px;
  }
  
  .hour-label {
    font-size: 0.6rem;
  }
  
  .hour-ampm {
    font-size: 0.5rem;
  }
  
  .time-slot {
    height: 50px;
  }
  
  .no-shifts svg {
    width: 48px;
    height: 48px;
  }
  
  .no-shifts p {
    font-size: 0.8rem;
  }
}

/* Кастомный скроллбар */
.day-schedule::-webkit-scrollbar {
  height: 8px;
}

.day-schedule::-webkit-scrollbar-track {
  background: var(--timeline-border);
  border-radius: 10px;
}

.day-schedule::-webkit-scrollbar-thumb {
  background: var(--hour-text);
  border-radius: 10px;
}

.day-schedule::-webkit-scrollbar-thumb:hover {
  background: var(--day-text-secondary);
}
</style>