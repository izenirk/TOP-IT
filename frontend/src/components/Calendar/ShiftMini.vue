<template>
  <div 
    class="shift-mini"
    :class="{ 
      'night-shift': isNightShift,
      'long-shift': isLongShift,
      'day-off': shift.startTime === 'Выходной'
    }"
    :title="getDetailedTitle()"
    @click="onShiftClick"
  >
    <span class="shift-initials">{{ getShortName(shift.employeeName) }}</span>
    <span class="shift-dot" v-if="hasMultipleShifts"></span>
  </div>
</template>

<script>
export default {
  name: 'ShiftMini',
  
  props: {
    shift: {
      type: Object,
      required: true
    },
    compact: {
      type: Boolean,
      default: false
    }
  },
  
  computed: {
    isNightShift() {
      if (this.shift.startTime === 'Выходной') return false
      const startHour = parseInt(this.shift.startTime.split(':')[0])
      const endHour = parseInt(this.shift.endTime.split(':')[0])
      return startHour >= 22 || startHour < 6 || endHour < 6
    },
    
    isLongShift() {
      if (this.shift.startTime === 'Выходной') return false
      const duration = this.getShiftDurationInMinutes()
      return duration > 480 // Больше 8 часов
    },
    
    hasMultipleShifts() {
      // Проверяем, есть ли несколько смен в этом часе
      return this.$parent?.$children?.filter(child => 
        child !== this && child.shift?.date === this.shift.date
      ).length > 0
    }
  },
  
  methods: {
    getShortName(fullName) {
      if (!fullName) return '?'
      const parts = fullName.split(' ')
      if (parts.length >= 2) {
        return `${parts[0].charAt(0)}${parts[1].charAt(0)}`
      }
      return parts[0].charAt(0) || fullName.charAt(0)
    },
    
    getShiftDurationInMinutes() {
      if (this.shift.startTime === 'Выходной') return 0
      
      const [startHour, startMinute] = this.shift.startTime.split(':').map(Number)
      const [endHour, endMinute] = this.shift.endTime.split(':').map(Number)
      
      let startTotal = startHour * 60 + startMinute
      let endTotal = endHour * 60 + endMinute
      
      if (endTotal < startTotal) {
        endTotal += 24 * 60
      }
      
      return endTotal - startTotal
    },
    
    getDetailedTitle() {
      if (this.shift.startTime === 'Выходной') {
        return `${this.shift.employeeName}: Выходной`
      }
      
      const duration = this.getShiftDurationInMinutes()
      const hours = Math.floor(duration / 60)
      const minutes = duration % 60
      const type = this.isNightShift ? 'Ночная' : this.isLongShift ? 'Длинная' : 'Обычная'
      
      return `${this.shift.employeeName}\n${this.shift.startTime} - ${this.shift.endTime}\nДлительность: ${hours}ч ${minutes}мин\nТип: ${type}`
    },
    
    onShiftClick() {
      this.$emit('click', this.shift)
    }
  }
}
</script>

<style scoped>
.shift-mini {
  position: absolute;
  top: 2px;
  left: 2px;
  right: 2px;
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 3px 6px;
  border-radius: 4px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
}

/* Ночная смена */
.shift-mini.night-shift {
  background: linear-gradient(135deg, #3f51b5 0%, #303f9f 100%);
  box-shadow: 0 1px 2px rgba(63, 81, 181, 0.3);
}

/* Длинная смена */
.shift-mini.long-shift {
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  box-shadow: 0 1px 2px rgba(255, 152, 0, 0.3);
}

/* Выходной */
.shift-mini.day-off {
  background: linear-gradient(135deg, #9e9e9e 0%, #757575 100%);
  opacity: 0.7;
  font-style: italic;
}

/* Инициалы */
.shift-initials {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

/* Точка для нескольких смен */
.shift-dot {
  width: 4px;
  height: 4px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
}

/* Эффекты при наведении */
.shift-mini:hover {
  transform: translateY(-1px) scale(1.02);
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  filter: brightness(1.05);
}

.shift-mini:active {
  transform: translateY(0) scale(0.98);
  transition: transform 0.05s;
}

/* Анимация появления */
.shift-mini {
  animation: fadeInUp 0.2s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Разные размеры для компактного режима */
.shift-mini[class*="compact"] {
  padding: 2px 4px;
  font-size: 8px;
}

/* Инструменты для отображения статуса */
.shift-mini::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 2px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px 0 0 2px;
}

/* Подсветка для активной смены */
.shift-mini:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.5);
}

/* Множественные смены в одном часе */
.shift-mini:not(:first-child) {
  top: auto;
  margin-top: 2px;
}

/* Адаптивность */
@media (max-width: 768px) {
  .shift-mini {
    padding: 2px 4px;
    font-size: 8px;
  }
  
  .shift-initials {
    font-size: 7px;
  }
}

@media (max-width: 480px) {
  .shift-mini {
    padding: 1px 3px;
    font-size: 7px;
  }
  
  .shift-initials {
    font-size: 6px;
  }
}

/* Тултип при наведении (кастомный) */
.shift-mini:hover::after {
  content: attr(title);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: #2c3e50;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  white-space: nowrap;
  z-index: 1000;
  margin-bottom: 4px;
  pointer-events: none;
  font-weight: normal;
}

.shift-mini:hover::before {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 4px;
  border-style: solid;
  border-color: #2c3e50 transparent transparent transparent;
  margin-bottom: -4px;
  pointer-events: none;
}

/* Индикатор загрузки для смены */
.shift-mini.loading {
  animation: pulse 1s ease infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

/* Стили для печати */
@media print {
  .shift-mini {
    background: #f0f0f0 !important;
    color: black !important;
    border: 1px solid #ccc;
    print-color-adjust: exact;
  }
  
  .shift-mini::after {
    display: none;
  }
}

/* Эффект для первого элемента в группе */
.shift-mini:first-of-type {
  margin-top: 0;
}

/* Индикатор, что смена началась */
.shift-mini.active {
  animation: glow 1s ease infinite;
  box-shadow: 0 0 8px rgba(76, 175, 80, 0.5);
}

@keyframes glow {
  0%, 100% {
    box-shadow: 0 0 8px rgba(76, 175, 80, 0.5);
  }
  50% {
    box-shadow: 0 0 16px rgba(76, 175, 80, 0.8);
  }
}
</style>