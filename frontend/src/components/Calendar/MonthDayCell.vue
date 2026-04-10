<template>
  <div 
    class="day-cell"
    :class="{ 
      'other-month': !day.isCurrentMonth,
      'weekend': day.isWeekend,
      'today': day.isToday,
      'has-shifts': day.shifts.length > 0
    }"
  >
    <div class="day-header">
      <div class="day-number">{{ day.dayNumber }}</div>
      <div class="shifts-badge" v-if="day.shifts.length > 0">
        {{ day.shifts.length }}
      </div>
    </div>
    
    <div class="day-shifts">
      <div 
        v-for="shift in displayedShifts" 
        :key="shift.id"
        class="day-shift"
        :class="{ 
          'day-off': shift.startTime === 'Выходной',
          'night-shift': isNightShift(shift),
          'long-shift': isLongShift(shift)
        }"
        :title="getShiftTitle(shift)"
        @click="onShiftClick(shift)"
      >
        <span class="shift-name">{{ getShortName(shift.employeeName) }}</span>
        <span class="shift-time" v-if="shift.startTime !== 'Выходной'">
          {{ getShortTime(shift.startTime) }}—{{ getShortTime(shift.endTime) }}
        </span>
      </div>
      
      <div v-if="remainingShiftsCount > 0" class="more-shifts">
        +{{ remainingShiftsCount }} {{ getShiftsText(remainingShiftsCount) }}
      </div>
      
      <div v-if="day.shifts.length === 0" class="no-shifts">
        —
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MonthDayCell',
  
  props: {
    day: {
      type: Object,
      required: true
    }
  },
  
  data() {
    return {
      maxDisplayShifts: 3 // Максимальное количество отображаемых смен
    }
  },
  
  computed: {
    displayedShifts() {
      return this.day.shifts.slice(0, this.maxDisplayShifts)
    },
    
    remainingShiftsCount() {
      return Math.max(0, this.day.shifts.length - this.maxDisplayShifts)
    }
  },
  
  methods: {
    getShortName(fullName) {
      if (!fullName) return '?'
      const parts = fullName.split(' ')
      return parts[0] || fullName
    },
    
    getShortTime(time) {
      if (!time) return ''
      return time.substring(0, 5) // Показывает только HH:MM
    },
    
    getShiftTitle(shift) {
      if (shift.startTime === 'Выходной') {
        return `${shift.employeeName}: Выходной`
      }
      return `${shift.employeeName}: ${shift.startTime} - ${shift.endTime}`
    },
    
    getShiftsText(count) {
      const lastDigit = count % 10
      const lastTwoDigits = count % 100
      
      if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
        return 'смен'
      }
      
      if (lastDigit === 1) return 'смена'
      if (lastDigit >= 2 && lastDigit <= 4) return 'смены'
      return 'смен'
    },
    
    isNightShift(shift) {
      if (shift.startTime === 'Выходной') return false
      const startHour = parseInt(shift.startTime.split(':')[0])
      return startHour >= 22 || startHour < 6
    },
    
    isLongShift(shift) {
      if (shift.startTime === 'Выходной') return false
      const [startHour, startMinute] = shift.startTime.split(':').map(Number)
      const [endHour, endMinute] = shift.endTime.split(':').map(Number)
      
      let startTotal = startHour * 60 + startMinute
      let endTotal = endHour * 60 + endMinute
      
      if (endTotal < startTotal) {
        endTotal += 24 * 60
      }
      
      const duration = endTotal - startTotal
      return duration > 480 // Больше 8 часов
    },
    
    onShiftClick(shift) {
      this.$emit('shift-click', shift)
    }
  }
}
</script>

<style scoped>
/* CSS Variables для светлой и тёмной темы */
.day-cell {
  --cell-bg: #ffffff;
  --cell-border: #e2e8f0;
  --cell-text: #0f172a;
  --cell-text-secondary: #64748b;
  --cell-hover-bg: #f8fafc;
  --badge-bg: #10b981;
  --badge-text: #ffffff;
  --off-bg: #f1f5f9;
  --off-border: #cbd5e1;
  --night-bg: #e0e7ff;
  --night-border: #818cf8;
  --long-bg: #fef3c7;
  --long-border: #f59e0b;
  --more-bg: #f1f5f9;
  --more-hover: #e2e8f0;
  --no-shifts: #cbd5e1;
}

@media (prefers-color-scheme: dark) {
  .day-cell {
    --cell-bg: #1e293b;
    --cell-border: #334155;
    --cell-text: #f1f5f9;
    --cell-text-secondary: #94a3b8;
    --cell-hover-bg: #334155;
    --badge-bg: #059669;
    --badge-text: #ffffff;
    --off-bg: #334155;
    --off-border: #475569;
    --night-bg: #1e1b4b;
    --night-border: #6366f1;
    --long-bg: #78350f;
    --long-border: #f59e0b;
    --more-bg: #334155;
    --more-hover: #475569;
    --no-shifts: #475569;
  }
}

.day-cell {
  min-height: 120px;
  padding: 10px;
  background: var(--cell-bg);
  border-right: 1px solid var(--cell-border);
  border-bottom: 1px solid var(--cell-border);
  transition: all 0.2s ease;
  position: relative;
  cursor: pointer;
}

.day-cell:hover {
  background: var(--cell-hover-bg);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  z-index: 2;
}

/* Ячейки других месяцев */
.day-cell.other-month {
  background: var(--cell-hover-bg);
  opacity: 0.7;
}

.day-cell.other-month .day-number {
  color: var(--cell-text-secondary);
}

/* Выходные дни */
.day-cell.weekend {
  background: linear-gradient(135deg, var(--cell-bg) 0%, rgba(245, 158, 11, 0.05) 100%);
}

.day-cell.weekend .day-number {
  color: #f59e0b;
}

/* Сегодняшний день */
.day-cell.today {
  background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
  border: 2px solid #6366f1;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
}

.day-cell.today .day-number {
  color: #4f46e5;
  font-weight: 700;
}

@media (prefers-color-scheme: dark) {
  .day-cell.today {
    background: linear-gradient(135deg, #312e81 0%, #4338ca 100%);
  }
  
  .day-cell.today .day-number {
    color: #a5b4fc;
  }
}

/* Ячейки со сменами */
.day-cell.has-shifts {
  background: linear-gradient(135deg, var(--cell-bg) 0%, rgba(16, 185, 129, 0.03) 100%);
}

/* Заголовок дня */
.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.day-number {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--cell-text);
  transition: all 0.2s ease;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
}

.day-cell.today .day-number {
  background: #4f46e5;
  color: white;
}

.shifts-badge {
  background: var(--badge-bg);
  color: var(--badge-text);
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 20px;
  min-width: 24px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Список смен */
.day-shifts {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.day-shift {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  font-size: 0.7rem;
  padding: 6px 10px;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  border-left: 3px solid #10b981;
}

@media (prefers-color-scheme: dark) {
  .day-shift {
    background: linear-gradient(135deg, #064e3b 0%, #065f46 100%);
  }
}

.day-shift:hover {
  transform: translateX(3px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Выходной день */
.day-shift.day-off {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-left-color: #94a3b8;
}

@media (prefers-color-scheme: dark) {
  .day-shift.day-off {
    background: linear-gradient(135deg, #334155 0%, #475569 100%);
  }
}

.day-shift.day-off .shift-name {
  color: var(--cell-text-secondary);
}

/* Ночная смена */
.day-shift.night-shift {
  background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
  border-left-color: #6366f1;
}

@media (prefers-color-scheme: dark) {
  .day-shift.night-shift {
    background: linear-gradient(135deg, #1e1b4b 0%, #2e1065 100%);
  }
}

/* Длинная смена */
.day-shift.long-shift {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border-left-color: #f59e0b;
}

@media (prefers-color-scheme: dark) {
  .day-shift.long-shift {
    background: linear-gradient(135deg, #78350f 0%, #92400e 100%);
  }
}

.shift-name {
  font-weight: 600;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--cell-text);
}

.shift-time {
  font-size: 0.6rem;
  font-family: 'SF Mono', 'Courier New', monospace;
  opacity: 0.7;
  white-space: nowrap;
  color: var(--cell-text-secondary);
}

/* Кнопка "еще смены" */
.more-shifts {
  font-size: 0.65rem;
  padding: 5px 10px;
  background: var(--more-bg);
  border-radius: 10px;
  text-align: center;
  color: var(--cell-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.more-shifts:hover {
  background: var(--more-hover);
  transform: scale(1.02);
}

/* Нет смен */
.no-shifts {
  text-align: center;
  color: var(--no-shifts);
  font-size: 1rem;
  padding: 12px;
  font-weight: 300;
}

/* Анимации */
.day-shift {
  animation: slideIn 0.2s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Эффект при клике */
.day-shift:active {
  transform: scale(0.97);
}

/* Адаптивность */
@media (max-width: 1024px) {
  .day-cell {
    min-height: 100px;
    padding: 8px;
  }
  
  .day-shift {
    font-size: 0.65rem;
    padding: 5px 8px;
  }
}

@media (max-width: 768px) {
  .day-cell {
    min-height: 80px;
    padding: 6px;
  }
  
  .day-number {
    font-size: 0.8rem;
    width: 24px;
    height: 24px;
  }
  
  .day-shift {
    font-size: 0.6rem;
    padding: 4px 6px;
    gap: 4px;
  }
  
  .shift-name {
    font-size: 0.6rem;
  }
  
  .shift-time {
    font-size: 0.55rem;
  }
  
  .more-shifts {
    font-size: 0.6rem;
    padding: 3px 6px;
  }
  
  .shifts-badge {
    font-size: 0.65rem;
    padding: 1px 6px;
    min-width: 20px;
  }
}

@media (max-width: 480px) {
  .day-shift {
    flex-direction: column;
    align-items: flex-start;
    gap: 3px;
  }
  
  .shift-time {
    font-size: 0.5rem;
  }
  
  .day-number {
    font-size: 0.7rem;
  }
}

/* Стили для печати */
@media print {
  .day-cell {
    break-inside: avoid;
    page-break-inside: avoid;
    box-shadow: none;
    border: 1px solid #ccc;
  }
  
  .day-shift {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
}
</style>