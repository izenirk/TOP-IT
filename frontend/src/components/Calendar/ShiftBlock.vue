<template>
  <div 
    class="shift-block"
    :style="shiftStyle"
    :class="{ 
      'day-off': shift.startTime === 'Выходной',
      'night-shift': isNightShift,
      'long-shift': isLongShift,
      'hover-effect': true
    }"
    :title="shiftTitle"
    @click="onShiftClick"
  >
    <div class="shift-time-indicator" v-if="shift.startTime !== 'Выходной'">
      <span class="shift-duration">{{ shiftDuration }}</span>
    </div>
    
    <div class="shift-info">
      <div class="shift-employee">
        <strong>{{ shift.employeeName }}</strong>
        <span class="shift-badge" v-if="isNightShift">🌙 Ночь</span>
        <span class="shift-badge long" v-if="isLongShift">⏱ Длинная</span>
      </div>
      
      <div class="shift-time" v-if="shift.startTime !== 'Выходной'">
        <span class="time-icon">🕐</span>
        <span class="time-range">{{ shift.startTime }} - {{ shift.endTime }}</span>
        <span class="duration-badge">{{ getDurationInHours }}</span>
      </div>
      
      <div class="shift-day-off" v-else>
        <span class="dayoff-icon">🌙</span>
        <span>Выходной</span>
      </div>
    </div>
    
    <div class="shift-tooltip">
      {{ getDetailedTooltip() }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'ShiftBlock',
  
  props: {
    shift: {
      type: Object,
      required: true
    }
  },
  
  computed: {
    shiftStyle() {
      if (this.shift.startTime === 'Выходной') {
        return { top: '0px', height: '60px' }
      }
      
      const [startHour, startMinute] = this.shift.startTime.split(':').map(Number)
      const [endHour, endMinute] = this.shift.endTime.split(':').map(Number)
      
      let startTotal = startHour * 60 + startMinute
      let endTotal = endHour * 60 + endMinute
      
      if (endHour < startHour || (endHour === 0 && startHour > 0)) {
        endTotal += 24 * 60
      }
      
      const top = (startTotal / 1440) * 1440
      const height = ((endTotal - startTotal) / 1440) * 1440
      
      return {
        top: `${top}px`,
        height: `${Math.max(height, 40)}px`,
        '--duration': `${((endTotal - startTotal) / 60).toFixed(1)}`
      }
    },
    
    shiftTitle() {
      if (this.shift.startTime === 'Выходной') {
        return `${this.shift.employeeName}: Выходной`
      }
      const duration = this.getShiftDurationInMinutes()
      const hours = Math.floor(duration / 60)
      const minutes = duration % 60
      return `${this.shift.employeeName}: ${this.shift.startTime} - ${this.shift.endTime} (${hours}ч ${minutes}мин)`
    },
    
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
    
    shiftDuration() {
      if (this.shift.startTime === 'Выходной') return ''
      const duration = this.getShiftDurationInMinutes()
      const hours = Math.floor(duration / 60)
      const minutes = duration % 60
      return `${hours}ч ${minutes}мин`
    },
    
    getDurationInHours() {
      if (this.shift.startTime === 'Выходной') return ''
      const duration = this.getShiftDurationInMinutes()
      const hours = (duration / 60).toFixed(1)
      return `${hours} ч`
    }
  },
  
  methods: {
    getShiftDurationInMinutes() {
      const [startHour, startMinute] = this.shift.startTime.split(':').map(Number)
      const [endHour, endMinute] = this.shift.endTime.split(':').map(Number)
      
      let startTotal = startHour * 60 + startMinute
      let endTotal = endHour * 60 + endMinute
      
      if (endTotal < startTotal) {
        endTotal += 24 * 60
      }
      
      return endTotal - startTotal
    },
    
    getDetailedTooltip() {
      if (this.shift.startTime === 'Выходной') {
        return `${this.shift.employeeName}\nВыходной день`
      }
      
      const duration = this.getShiftDurationInMinutes()
      const hours = Math.floor(duration / 60)
      const minutes = duration % 60
      const type = this.isNightShift ? 'Ночная смена' : this.isLongShift ? 'Длинная смена' : 'Обычная смена'
      
      return `${this.shift.employeeName}\n${this.shift.startTime} - ${this.shift.endTime}\nДлительность: ${hours}ч ${minutes}мин\nТип: ${type}`
    },
    
    onShiftClick() {
      this.$emit('shift-click', this.shift)
    }
  }
}
</script>

<style scoped>
.shift-block {
  position: absolute;
  left: 4px;
  right: 4px;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-left: 4px solid #2196F3;
  margin: 2px 0;
  padding: 8px 10px;
  border-radius: 8px;
  overflow: hidden;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

/* Ночная смена */
.shift-block.night-shift {
  background: linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%);
  border-left-color: #3f51b5;
}

/* Длинная смена */
.shift-block.long-shift {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  border-left-color: #ff9800;
}

/* Выходной */
.shift-block.day-off {
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
  border-left-color: #9e9e9e;
  opacity: 0.8;
}

/* Индикатор времени */
.shift-time-indicator {
  position: absolute;
  top: 4px;
  right: 8px;
  font-size: 9px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.5);
  font-family: 'Courier New', monospace;
}

.shift-duration {
  background: rgba(255, 255, 255, 0.8);
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 9px;
}

/* Информация о смене */
.shift-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  height: 100%;
  justify-content: center;
}

.shift-employee {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.shift-employee strong {
  font-size: 12px;
  color: #1a237e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.shift-badge {
  font-size: 9px;
  padding: 2px 6px;
  border-radius: 10px;
  background: rgba(33, 150, 243, 0.2);
  color: #1976d2;
  font-weight: 500;
}

.shift-badge.long {
  background: rgba(255, 152, 0, 0.2);
  color: #e65100;
}

.shift-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  color: #424242;
  font-family: 'Courier New', monospace;
}

.time-icon {
  font-size: 10px;
}

.time-range {
  font-weight: 500;
}

.duration-badge {
  background: rgba(0, 0, 0, 0.05);
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 9px;
  font-weight: 600;
}

.shift-day-off {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #757575;
  font-size: 11px;
}

.dayoff-icon {
  font-size: 12px;
}

/* Тултип при наведении */
.shift-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: #2c3e50;
  color: white;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 10px;
  white-space: nowrap;
  z-index: 1000;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease;
  margin-bottom: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.shift-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 5px;
  border-style: solid;
  border-color: #2c3e50 transparent transparent transparent;
}

.shift-block:hover .shift-tooltip {
  opacity: 1;
}

/* Эффекты при наведении */
.shift-block:hover {
  transform: scale(1.02);
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  filter: brightness(1.02);
}

.shift-block.hover-effect {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Анимация появления */
.shift-block {
  animation: slideInRight 0.3s ease;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Разные размеры для разных длительностей */
.shift-block[style*="--duration"] {
  position: relative;
}

/* Компактный вид для маленьких блоков */
.shift-block:has(.shift-info) {
  min-height: 50px;
}

/* Когда блок маленький (менее 60px) */
.shift-block[style*="height: 40px"] .shift-info {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.shift-block[style*="height: 40px"] .shift-employee strong {
  font-size: 10px;
}

.shift-block[style*="height: 40px"] .shift-time {
  font-size: 9px;
}

.shift-block[style*="height: 40px"] .shift-badge,
.shift-block[style*="height: 40px"] .duration-badge {
  display: none;
}

/* Адаптивность */
@media (max-width: 768px) {
  .shift-block {
    padding: 4px 6px;
    font-size: 9px;
  }
  
  .shift-employee strong {
    font-size: 10px;
  }
  
  .shift-time {
    font-size: 8px;
  }
  
  .shift-badge {
    font-size: 7px;
    padding: 1px 4px;
  }
  
  .shift-tooltip {
    font-size: 9px;
    white-space: normal;
    max-width: 200px;
  }
}

/* Эффект при клике */
.shift-block:active {
  transform: scale(0.98);
  transition: transform 0.05s;
}

/* Полоса прогресса для длительности */
.shift-block::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: rgba(33, 150, 243, 0.5);
  width: var(--duration, 0%);
  max-width: 100%;
  border-radius: 0 0 0 4px;
}

.shift-block.night-shift::after {
  background: rgba(63, 81, 181, 0.5);
}

.shift-block.long-shift::after {
  background: rgba(255, 152, 0, 0.5);
}
</style>