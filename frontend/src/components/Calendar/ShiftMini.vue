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
      return duration > 480
    },
    
    hasMultipleShifts() {
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
/* CSS Variables для светлой и тёмной темы */
.shift-mini {
  --shift-regular-bg-start: #10b981;
  --shift-regular-bg-end: #059669;
  --shift-night-bg-start: #6366f1;
  --shift-night-bg-end: #4f46e5;
  --shift-long-bg-start: #f59e0b;
  --shift-long-bg-end: #d97706;
  --shift-off-bg-start: #94a3b8;
  --shift-off-bg-end: #64748b;
  --shift-text: #ffffff;
  --shift-shadow: rgba(0, 0, 0, 0.1);
  --tooltip-bg: #1e293b;
  --tooltip-text: #f1f5f9;
}

@media (prefers-color-scheme: dark) {
  .shift-mini {
    --shift-regular-bg-start: #059669;
    --shift-regular-bg-end: #047857;
    --shift-night-bg-start: #4f46e5;
    --shift-night-bg-end: #4338ca;
    --shift-long-bg-start: #d97706;
    --shift-long-bg-end: #b45309;
    --shift-off-bg-start: #64748b;
    --shift-off-bg-end: #475569;
    --shift-text: #f8fafc;
    --shift-shadow: rgba(0, 0, 0, 0.3);
    --tooltip-bg: #0f172a;
    --tooltip-text: #e2e8f0;
  }
}

.shift-mini {
  position: absolute;
  top: 2px;
  left: 2px;
  right: 2px;
  background: linear-gradient(135deg, var(--shift-regular-bg-start) 0%, var(--shift-regular-bg-end) 100%);
  color: var(--shift-text);
  font-size: 10px;
  font-weight: 600;
  padding: 3px 6px;
  border-radius: 6px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px var(--shift-shadow);
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  backdrop-filter: blur(0px);
}

.shift-mini.night-shift {
  background: linear-gradient(135deg, var(--shift-night-bg-start) 0%, var(--shift-night-bg-end) 100%);
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.3);
}

.shift-mini.long-shift {
  background: linear-gradient(135deg, var(--shift-long-bg-start) 0%, var(--shift-long-bg-end) 100%);
  box-shadow: 0 1px 3px rgba(245, 158, 11, 0.3);
}

.shift-mini.day-off {
  background: linear-gradient(135deg, var(--shift-off-bg-start) 0%, var(--shift-off-bg-end) 100%);
  opacity: 0.75;
  font-style: italic;
}

.shift-initials {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
}

.shift-dot {
  width: 5px;
  height: 5px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.15);
  animation: pulseDot 1.5s ease infinite;
}

@keyframes pulseDot {
  0%, 100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

.shift-mini:hover {
  transform: translateY(-2px) scale(1.02);
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  filter: brightness(1.05);
}

.shift-mini:active {
  transform: translateY(0) scale(0.98);
  transition: transform 0.05s;
}

.shift-mini {
  animation: slideInRight 0.2s ease;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.shift-mini::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 3px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 3px 0 0 3px;
}

.shift-mini:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.5);
}

.shift-mini:not(:first-child) {
  top: auto;
  margin-top: 2px;
}

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

.shift-mini:hover::after {
  content: attr(title);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: var(--tooltip-bg);
  color: var(--tooltip-text);
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 10px;
  white-space: nowrap;
  z-index: 1000;
  margin-bottom: 6px;
  pointer-events: none;
  font-weight: normal;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  letter-spacing: normal;
}

.shift-mini:hover::before {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 5px;
  border-style: solid;
  border-color: var(--tooltip-bg) transparent transparent transparent;
  margin-bottom: -4px;
  pointer-events: none;
}

.shift-mini.loading {
  animation: shimmer 1s ease infinite;
}

@keyframes shimmer {
  0%, 100% {
    opacity: 0.7;
  }
  50% {
    opacity: 0.4;
  }
}

@media print {
  .shift-mini {
    background: #e2e8f0 !important;
    color: #0f172a !important;
    border: 1px solid #cbd5e1;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
    box-shadow: none;
  }
  
  .shift-mini::after,
  .shift-mini::before {
    display: none;
  }
}

.shift-mini:first-of-type {
  margin-top: 0;
}

.shift-mini.active {
  animation: glowPulse 1.5s ease infinite;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.6);
}

@keyframes glowPulse {
  0%, 100% {
    box-shadow: 0 0 5px rgba(16, 185, 129, 0.4);
  }
  50% {
    box-shadow: 0 0 15px rgba(16, 185, 129, 0.8);
  }
}

@media (min-width: 1200px) {
  .shift-mini {
    padding: 4px 8px;
    font-size: 11px;
  }
  
  .shift-initials {
    font-size: 10px;
  }
}
</style>