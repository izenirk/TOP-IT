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
          {{ getShortTime(shift.startTime) }}-{{ getShortTime(shift.endTime) }}
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
.day-cell {
  min-height: 110px;
  padding: 8px;
  background: white;
  border-right: 1px solid #e8e8e8;
  border-bottom: 1px solid #e8e8e8;
  transition: all 0.2s ease;
  position: relative;
  cursor: pointer;
}

.day-cell:hover {
  background: #fafbfc;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

/* Ячейки других месяцев */
.day-cell.other-month {
  background: #fafafa;
  color: #bdbdbd;
}

.day-cell.other-month:hover {
  background: #f5f5f5;
}

/* Выходные дни */
.day-cell.weekend {
  background: #fffaf5;
}

.day-cell.weekend:hover {
  background: #fff5eb;
}

/* Сегодняшний день */
.day-cell.today {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border: 2px solid #2196F3;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.2);
}

.day-cell.today .day-number {
  color: #1976d2;
}

/* Ячейки со сменами */
.day-cell.has-shifts {
  background: #f8fff8;
}

/* Заголовок дня */
.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.day-number {
  font-weight: 600;
  font-size: 15px;
  color: #2c3e50;
  transition: all 0.2s ease;
}

.day-cell.today .day-number {
  font-size: 17px;
  font-weight: 700;
}

.shifts-badge {
  background: #4CAF50;
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

.day-cell.weekend .shifts-badge {
  background: #ff9800;
}

/* Список смен */
.day-shifts {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.day-shift {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  padding: 5px 8px;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.day-shift::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #4CAF50;
}

.day-shift:hover {
  transform: translateX(2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Выходной день */
.day-shift.day-off {
  background: linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%);
  color: #9e9e9e;
}

.day-shift.day-off::before {
  background: #9e9e9e;
}

/* Ночная смена */
.day-shift.night-shift {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
}

.day-shift.night-shift::before {
  background: #2196F3;
}

/* Длинная смена */
.day-shift.long-shift {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
}

.day-shift.long-shift::before {
  background: #ff9800;
}

.shift-name {
  font-weight: 600;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.shift-time {
  font-size: 9px;
  font-family: 'Courier New', monospace;
  opacity: 0.8;
  white-space: nowrap;
}

/* Кнопка "еще смены" */
.more-shifts {
  font-size: 10px;
  padding: 4px 8px;
  background: #f0f0f0;
  border-radius: 6px;
  text-align: center;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
}

.more-shifts:hover {
  background: #e0e0e0;
  transform: scale(1.02);
}

/* Нет смен */
.no-shifts {
  text-align: center;
  color: #e0e0e0;
  font-size: 14px;
  padding: 8px;
  font-weight: 300;
}

/* Анимации */
.day-shift {
  animation: slideIn 0.2s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Адаптивность */
@media (max-width: 768px) {
  .day-cell {
    min-height: 80px;
    padding: 4px;
  }
  
  .day-number {
    font-size: 12px;
  }
  
  .day-shift {
    font-size: 8px;
    padding: 3px 5px;
  }
  
  .shift-name {
    font-size: 8px;
  }
  
  .shift-time {
    font-size: 7px;
  }
  
  .more-shifts {
    font-size: 8px;
    padding: 2px 4px;
  }
  
  .shifts-badge {
    font-size: 8px;
    padding: 1px 4px;
    min-width: 16px;
  }
}

@media (max-width: 480px) {
  .day-shift {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }
  
  .shift-time {
    font-size: 7px;
  }
}

/* Тултип при наведении */
.day-shift[title] {
  position: relative;
}

/* Эффект при клике */
.day-shift:active {
  transform: scale(0.98);
}

/* Стили для печати */
@media print {
  .day-cell {
    break-inside: avoid;
    page-break-inside: avoid;
  }
  
  .day-shift {
    background: #f0f0f0;
    print-color-adjust: exact;
  }
}
</style>