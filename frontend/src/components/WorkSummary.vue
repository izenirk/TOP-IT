<template>
  <div class="summary">
    <div class="summary-header">
      <h2>Общий свод</h2>
      <div class="total-badge" v-if="totalShifts > 0">
        {{ totalShifts }} смен
      </div>
    </div>
    
    <div v-if="totalShifts > 0">
      <!-- Распределение по дням недели -->
      <div class="summary-section">
        <div class="section-title">
          <svg viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
            <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2"/>
            <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2"/>
            <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/>
          </svg>
          <span>По дням недели</span>
        </div>
        
        <div class="stats-list">
          <div v-for="day in weekdaysData" :key="day.name" class="stat-row">
            <div class="stat-label">
              <span class="day-name" :class="getDayClass(day.name)">{{ day.shortName || day.name }}</span>
            </div>
            <div class="stat-bar-wrapper">
              <div class="stat-bar" :style="{ width: day.percentage + '%', backgroundColor: getBarColor(day.name) }"></div>
            </div>
            <div class="stat-value">{{ day.percentage }}%</div>
            <div class="stat-count">{{ day.count }}</div>
          </div>
        </div>
      </div>

      <!-- Целевое распределение -->
      <div class="target-section">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M12 8V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
        </svg>
        <div class="target-text">
          <div class="target-title">Целевое распределение (5/2)</div>
          <div class="target-values">
            <span class="weekday-target">Будни: 71.4%</span>
            <span class="weekend-target">Выходные: 28.6%</span>
          </div>
        </div>
      </div>

      <!-- Распределение по времени -->
      <div class="summary-section">
        <div class="section-title">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <polyline points="12 6 12 12 16 14" stroke="currentColor" stroke-width="2"/>
          </svg>
          <span>По времени суток</span>
        </div>
        
        <div class="time-stats">
          <div class="time-row">
            <div class="time-icon">🌅</div>
            <div class="time-info">
              <div class="time-label">Начинаются до 11:00</div>
              <div class="time-bar-wrapper">
                <div class="time-bar morning" :style="{ width: before11Percentage + '%' }"></div>
              </div>
            </div>
            <div class="time-percent">{{ before11Percentage }}%</div>
            <div class="time-count">{{ before11Shifts }}</div>
          </div>
          
          <div class="time-row">
            <div class="time-icon">🌙</div>
            <div class="time-info">
              <div class="time-label">Заканчиваются после 19:00</div>
              <div class="time-bar-wrapper">
                <div class="time-bar evening" :style="{ width: after19Percentage + '%' }"></div>
              </div>
            </div>
            <div class="time-percent">{{ after19Percentage }}%</div>
            <div class="time-count">{{ after19Shifts }}</div>
          </div>
          
          <div class="time-row">
            <div class="time-icon">☀️</div>
            <div class="time-info">
              <div class="time-label">Остальное время</div>
              <div class="time-bar-wrapper">
                <div class="time-bar other" :style="{ width: otherTimePercentage + '%' }"></div>
              </div>
            </div>
            <div class="time-percent">{{ otherTimePercentage }}%</div>
            <div class="time-count">—</div>
          </div>
        </div>
      </div>

      <!-- Предупреждения -->
      <div v-if="warnings.length > 0" class="warnings">
        <div v-for="(warning, idx) in warnings" :key="idx" class="warning">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 8V12M12 16H12.01M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          {{ warning }}
        </div>
      </div>
    </div>
    
    <div v-else class="empty">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M9 12H15M12 9V15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <p>Нет данных для свода</p>
      <span>Добавьте смены для отображения статистики</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WorkSummary',
  props: {
    employees: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      dayNames: ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'],
      dayShort: {
        'Понедельник': 'ПН',
        'Вторник': 'ВТ',
        'Среда': 'СР',
        'Четверг': 'ЧТ',
        'Пятница': 'ПТ',
        'Суббота': 'СБ',
        'Воскресенье': 'ВС'
      }
    }
  },
  computed: {
    totalShifts() {
      return this.employees.reduce((total, emp) => total + emp.shifts.length, 0)
    },
    
    shiftsByDay() {
      const counts = [0, 0, 0, 0, 0, 0, 0]
      this.employees.forEach(emp => {
        emp.shifts.forEach(shift => {
          const date = new Date(shift.date)
          const day = date.getDay()
          const dayIndex = day === 0 ? 6 : day - 1
          counts[dayIndex]++
        })
      })
      return counts
    },
    
    weekdaysData() {
      if (this.totalShifts === 0) return []
      return this.dayNames.map((name, i) => ({
        name,
        shortName: this.dayShort[name],
        count: this.shiftsByDay[i],
        percentage: ((this.shiftsByDay[i] / this.totalShifts) * 100).toFixed(1)
      }))
    },
    
    before11Shifts() {
      let count = 0
      this.employees.forEach(emp => {
        emp.shifts.forEach(shift => {
          if (shift.startTime !== 'Выходной') {
            const startHour = parseInt(shift.startTime.split(':')[0])
            if (startHour < 11) count++
          }
        })
      })
      return count
    },
    
    after19Shifts() {
      let count = 0
      this.employees.forEach(emp => {
        emp.shifts.forEach(shift => {
          if (shift.endTime && shift.endTime !== '') {
            let endHour = parseInt(shift.endTime.split(':')[0])
            if (shift.endTime === '00:00' && shift.startTime !== 'Выходной') {
              const startHour = parseInt(shift.startTime.split(':')[0])
              if (startHour < 19) count++
            } else if (endHour > 19) {
              count++
            }
          }
        })
      })
      return count
    },
    
    before11Percentage() {
      return this.totalShifts > 0 
        ? ((this.before11Shifts / this.totalShifts) * 100).toFixed(1) 
        : '0.0'
    },
    
    after19Percentage() {
      return this.totalShifts > 0 
        ? ((this.after19Shifts / this.totalShifts) * 100).toFixed(1) 
        : '0.0'
    },
    
    otherTimePercentage() {
      return (100 - parseFloat(this.before11Percentage) - parseFloat(this.after19Percentage)).toFixed(1)
    },
    
    longShifts() {
      let count = 0
      this.employees.forEach(emp => {
        emp.shifts.forEach(shift => {
          if (shift.startTime !== 'Выходной' && shift.endTime) {
            const [startHour, startMinute] = shift.startTime.split(':').map(Number)
            const [endHour, endMinute] = shift.endTime.split(':').map(Number)
            
            let startTotal = startHour * 60 + startMinute
            let endTotal = endHour * 60 + endMinute
            
            if (endHour < 6 && endHour !== 0) endTotal += 24 * 60
            if (endHour === 0 && endMinute === 0 && startHour > 0) endTotal += 24 * 60
            
            if (endTotal - startTotal > 720) count++
          }
        })
      })
      return count
    },
    
    employeesWithExcessConsecutive() {
      let count = 0
      this.employees.forEach(emp => {
        if (this.calculateMaxConsecutiveShifts(emp) > 6) count++
      })
      return count
    },
    
    warnings() {
      const warningsList = []
      if (this.employeesWithExcessConsecutive > 0) {
        warningsList.push(`${this.employeesWithExcessConsecutive} сотрудник(ов) имеют более 6 смен подряд`)
      }
      if (this.longShifts > 0) {
        warningsList.push(`${this.longShifts} смен(ы) длительностью более 12 часов`)
      }
      return warningsList
    }
  },
  methods: {
    getDayClass(day) {
      if (day === 'Суббота' || day === 'Воскресенье') return 'weekend'
      return 'weekday'
    },
    
    getBarColor(day) {
      const colors = {
        'Понедельник': '#6366f1',
        'Вторник': '#8b5cf6',
        'Среда': '#a855f7',
        'Четверг': '#d946ef',
        'Пятница': '#ec4899',
        'Суббота': '#f59e0b',
        'Воскресенье': '#ef4444'
      }
      return colors[day] || '#6366f1'
    },
    
    calculateMaxConsecutiveShifts(employee) {
      if (!employee || employee.shifts.length === 0) return 0
      
      const sortedShifts = [...employee.shifts].sort((a, b) => new Date(a.date) - new Date(b.date))
      
      let maxConsecutive = 1
      let currentConsecutive = 1
      let lastDate = new Date(sortedShifts[0].date)
      
      for (let i = 1; i < sortedShifts.length; i++) {
        const currentDate = new Date(sortedShifts[i].date)
        const diffDays = Math.round((currentDate - lastDate) / (1000 * 60 * 60 * 24))
        
        if (diffDays === 1) {
          currentConsecutive++
          maxConsecutive = Math.max(maxConsecutive, currentConsecutive)
        } else {
          currentConsecutive = 1
        }
        lastDate = currentDate
      }
      return maxConsecutive
    }
  }
}
</script>

<style scoped>
/* CSS Variables для светлой и тёмной темы */
.summary {
  --summary-bg: #ffffff;
  --summary-border: #e2e8f0;
  --summary-text: #0f172a;
  --summary-text-secondary: #475569;
  --target-bg: #f1f5f9;
  --warning-bg: #fef3c7;
  --warning-text: #92400e;
  --bar-bg: #e2e8f0;
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

@media (prefers-color-scheme: dark) {
  .summary {
    --summary-bg: #1e293b;
    --summary-border: #334155;
    --summary-text: #f1f5f9;
    --summary-text-secondary: #94a3b8;
    --target-bg: #334155;
    --warning-bg: #78350f;
    --warning-text: #fde68a;
    --bar-bg: #334155;
    --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
  }
}

.summary {
  background-color: var(--summary-bg);
  border: 1px solid var(--summary-border);
  border-radius: 24px;
  padding: 20px;
  width: 360px;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  transition: all 0.2s ease;
  box-shadow: var(--shadow);
}

/* Шапка */
.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--summary-border);
}

.summary-header h2 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--summary-text);
  letter-spacing: -0.01em;
}

.total-badge {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  padding: 4px 12px;
  border-radius: 40px;
  font-size: 0.75rem;
  font-weight: 600;
}

/* Секции */
.summary-section {
  margin-bottom: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  font-weight: 600;
  color: var(--summary-text);
  font-size: 0.85rem;
}

.section-title svg {
  width: 18px;
  height: 18px;
}

/* Список статистики */
.stats-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stat-row {
  display: grid;
  grid-template-columns: 40px 1fr 45px 30px;
  align-items: center;
  gap: 8px;
}

.stat-label .day-name {
  font-weight: 600;
  font-size: 0.8rem;
}

.day-name.weekday {
  color: var(--summary-text);
}

.day-name.weekend {
  color: #f59e0b;
}

@media (prefers-color-scheme: dark) {
  .day-name.weekend {
    color: #fbbf24;
  }
}

.stat-bar-wrapper {
  background-color: var(--bar-bg);
  border-radius: 20px;
  height: 6px;
  overflow: hidden;
}

.stat-bar {
  height: 100%;
  border-radius: 20px;
  transition: width 0.3s ease;
}

.stat-value {
  font-weight: 600;
  color: var(--summary-text);
  font-size: 0.75rem;
  text-align: right;
}

.stat-count {
  color: var(--summary-text-secondary);
  font-size: 0.7rem;
  text-align: right;
}

/* Целевая секция */
.target-section {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background-color: var(--target-bg);
  padding: 12px;
  border-radius: 16px;
  margin-bottom: 20px;
}

.target-section svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  margin-top: 2px;
}

.target-text {
  flex: 1;
}

.target-title {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--summary-text);
  margin-bottom: 6px;
}

.target-values {
  display: flex;
  gap: 12px;
  font-size: 0.65rem;
}

.weekday-target {
  color: #10b981;
}

.weekend-target {
  color: #f59e0b;
}

/* Статистика по времени */
.time-stats {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.time-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.time-icon {
  font-size: 1.2rem;
  width: 28px;
}

.time-info {
  flex: 1;
}

.time-label {
  font-size: 0.7rem;
  color: var(--summary-text-secondary);
  margin-bottom: 4px;
}

.time-bar-wrapper {
  background-color: var(--bar-bg);
  border-radius: 20px;
  height: 5px;
  overflow: hidden;
}

.time-bar {
  height: 100%;
  border-radius: 20px;
  transition: width 0.3s ease;
}

.time-bar.morning {
  background: linear-gradient(90deg, #f59e0b, #f97316);
}

.time-bar.evening {
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
}

.time-bar.other {
  background: linear-gradient(90deg, #10b981, #34d399);
}

.time-percent {
  font-weight: 600;
  color: var(--summary-text);
  font-size: 0.75rem;
  min-width: 40px;
  text-align: right;
}

.time-count {
  color: var(--summary-text-secondary);
  font-size: 0.7rem;
  min-width: 30px;
  text-align: right;
}

/* Предупреждения */
.warnings {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.warning {
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: var(--warning-bg);
  padding: 10px 12px;
  border-radius: 14px;
  font-size: 0.75rem;
  color: var(--warning-text);
  border-left: 3px solid #f59e0b;
}

.warning svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* Пустое состояние */
.empty {
  text-align: center;
  padding: 40px 20px;
}

.empty svg {
  width: 56px;
  height: 56px;
  color: var(--summary-text-secondary);
  opacity: 0.4;
  margin-bottom: 12px;
}

.empty p {
  margin: 0 0 6px 0;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--summary-text);
}

.empty span {
  font-size: 0.7rem;
  color: var(--summary-text-secondary);
}

/* Адаптивность */
@media (max-width: 768px) {
  .summary {
    width: 100%;
    border-radius: 20px;
  }
  
  .stat-row {
    grid-template-columns: 45px 1fr 45px 30px;
  }
  
  .target-values {
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>