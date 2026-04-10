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
        <div class="employee-avatar">{{ getInitials(shift.employeeName) }}</div>
        <strong>{{ shift.employeeName }}</strong>
        <span class="shift-badge" v-if="isNightShift">🌙 Ночь</span>
        <span class="shift-badge long" v-if="isLongShift">⏱ Длинная</span>
      </div>
      
      <div class="shift-time" v-if="shift.startTime !== 'Выходной'">
        <svg class="time-icon" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <polyline points="12 6 12 12 16 14" stroke="currentColor" stroke-width="2"/>
        </svg>
        <span class="time-range">{{ shift.startTime }} — {{ shift.endTime }}</span>
        <span class="duration-badge">{{ getDurationInHours }}</span>
      </div>
      
      <div class="shift-day-off" v-else>
        <svg class="dayoff-icon" viewBox="0 0 24 24" fill="none">
          <path d="M12 8V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
        </svg>
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
        height: `${Math.max(height, 44)}px`,
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
      return `${this.shift.employeeName}: ${this.shift.startTime} — ${this.shift.endTime} (${hours}ч ${minutes}мин)`
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
    getInitials(name) {
      if (!name) return '?'
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    },
    
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
      
      return `${this.shift.employeeName}\n${this.shift.startTime} — ${this.shift.endTime}\nДлительность: ${hours}ч ${minutes}мин\nТип: ${type}`
    },
    
    onShiftClick() {
      this.$emit('shift-click', this.shift)
    }
  }
}
</script>

<style scoped>
/* CSS Variables для светлой и тёмной темы */
.shift-block {
  --shift-bg-start: #eef2ff;
  --shift-bg-end: #e0e7ff;
  --shift-border: #6366f1;
  --shift-text: #1e1b4b;
  --shift-text-secondary: #4338ca;
  --night-bg-start: #e0e7ff;
  --night-bg-end: #c7d2fe;
  --night-border: #4f46e5;
  --long-bg-start: #fffbeb;
  --long-bg-end: #fef3c7;
  --long-border: #f59e0b;
  --off-bg-start: #f8fafc;
  --off-bg-end: #f1f5f9;
  --off-border: #94a3b8;
  --badge-bg: rgba(99, 102, 241, 0.15);
  --badge-text: #4f46e5;
  --tooltip-bg: #1e293b;
  --avatar-bg: linear-gradient(135deg, #6366f1, #8b5cf6);
}

@media (prefers-color-scheme: dark) {
  .shift-block {
    --shift-bg-start: #1e1b4b;
    --shift-bg-end: #2e1065;
    --shift-border: #818cf8;
    --shift-text: #e0e7ff;
    --shift-text-secondary: #c7d2fe;
    --night-bg-start: #1e1b4b;
    --night-bg-end: #312e81;
    --night-border: #818cf8;
    --long-bg-start: #78350f;
    --long-bg-end: #92400e;
    --long-border: #fbbf24;
    --off-bg-start: #334155;
    --off-bg-end: #475569;
    --off-border: #64748b;
    --badge-bg: rgba(129, 140, 248, 0.2);
    --badge-text: #a5b4fc;
    --tooltip-bg: #0f172a;
    --avatar-bg: linear-gradient(135deg, #818cf8, #a78bfa);
  }
}

.shift-block {
  position: absolute;
  left: 6px;
  right: 6px;
  background: linear-gradient(135deg, var(--shift-bg-start) 0%, var(--shift-bg-end) 100%);
  border-left: 4px solid var(--shift-border);
  margin: 2px 0;
  padding: 8px 12px;
  border-radius: 12px;
  overflow: hidden;
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  z-index: 1;
  backdrop-filter: blur(2px);
}

/* Ночная смена */
.shift-block.night-shift {
  background: linear-gradient(135deg, var(--night-bg-start) 0%, var(--night-bg-end) 100%);
  border-left-color: var(--night-border);
}

/* Длинная смена */
.shift-block.long-shift {
  background: linear-gradient(135deg, var(--long-bg-start) 0%, var(--long-bg-end) 100%);
  border-left-color: var(--long-border);
}

/* Выходной */
.shift-block.day-off {
  background: linear-gradient(135deg, var(--off-bg-start) 0%, var(--off-bg-end) 100%);
  border-left-color: var(--off-border);
  opacity: 0.85;
}

/* Индикатор времени */
.shift-time-indicator {
  position: absolute;
  top: 6px;
  right: 10px;
  font-size: 0.55rem;
  font-weight: 600;
  color: var(--shift-text-secondary);
  font-family: 'SF Mono', 'Courier New', monospace;
}

.shift-duration {
  background: rgba(255, 255, 255, 0.9);
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 0.55rem;
  font-weight: 500;
}

@media (prefers-color-scheme: dark) {
  .shift-duration {
    background: rgba(0, 0, 0, 0.4);
  }
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

.employee-avatar {
  width: 24px;
  height: 24px;
  background: var(--avatar-bg);
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  font-weight: 600;
  color: white;
  flex-shrink: 0;
}

.shift-employee strong {
  font-size: 0.75rem;
  color: var(--shift-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.shift-badge {
  font-size: 0.6rem;
  padding: 2px 8px;
  border-radius: 20px;
  background: var(--badge-bg);
  color: var(--badge-text);
  font-weight: 500;
}

.shift-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.6rem;
  color: var(--shift-text-secondary);
  font-family: 'SF Mono', 'Courier New', monospace;
}

.time-icon {
  width: 12px;
  height: 12px;
}

.time-range {
  font-weight: 500;
}

.duration-badge {
  background: rgba(0, 0, 0, 0.05);
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 0.55rem;
  font-weight: 600;
}

@media (prefers-color-scheme: dark) {
  .duration-badge {
    background: rgba(255, 255, 255, 0.1);
  }
}

.shift-day-off {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--shift-text-secondary);
  font-size: 0.65rem;
}

.dayoff-icon {
  width: 14px;
  height: 14px;
}

/* Тултип при наведении */
.shift-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: var(--tooltip-bg);
  color: white;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 0.7rem;
  white-space: nowrap;
  z-index: 1000;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease, transform 0.2s ease;
  margin-bottom: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  font-weight: 400;
  letter-spacing: 0.3px;
}

.shift-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 6px;
  border-style: solid;
  border-color: var(--tooltip-bg) transparent transparent transparent;
}

.shift-block:hover .shift-tooltip {
  opacity: 1;
  transform: translateX(-50%) translateY(-2px);
}

/* Эффекты при наведении */
.shift-block:hover {
  transform: scale(1.01);
  z-index: 100;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  filter: brightness(1.01);
}

.shift-block.hover-effect {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Анимация появления */
.shift-block {
  animation: slideInRight 0.25s ease;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(-15px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Компактный вид для маленьких блоков */
.shift-block:has(.shift-info) {
  min-height: 52px;
}

/* Когда блок маленький (менее 60px) */
.shift-block[style*="height: 44px"] .shift-info {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.shift-block[style*="height: 44px"] .shift-employee strong {
  font-size: 0.65rem;
}

.shift-block[style*="height: 44px"] .shift-time {
  font-size: 0.55rem;
}

.shift-block[style*="height: 44px"] .shift-badge,
.shift-block[style*="height: 44px"] .duration-badge,
.shift-block[style*="height: 44px"] .employee-avatar {
  display: none;
}

/* Адаптивность */
@media (max-width: 768px) {
  .shift-block {
    padding: 6px 10px;
    left: 4px;
    right: 4px;
  }
  
  .shift-employee strong {
    font-size: 0.65rem;
  }
  
  .shift-time {
    font-size: 0.55rem;
  }
  
  .shift-badge {
    font-size: 0.5rem;
    padding: 1px 6px;
  }
  
  .shift-tooltip {
    font-size: 0.6rem;
    white-space: normal;
    max-width: 200px;
    text-align: center;
  }
  
  .employee-avatar {
    width: 20px;
    height: 20px;
    font-size: 0.5rem;
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
  height: 3px;
  background: var(--shift-border);
  width: calc(var(--duration, 0) / 12 * 100%);
  max-width: 100%;
  border-radius: 0 0 0 12px;
  opacity: 0.4;
  transition: width 0.3s ease;
}

.shift-block.night-shift::after {
  background: var(--night-border);
}

.shift-block.long-shift::after {
  background: var(--long-border);
}

.shift-block.day-off::after {
  display: none;
}
</style>