<template>
  <div class="viz-controls">
    <div class="controls-header">
      <div class="view-selector">
        <button 
          v-for="view in views" 
          :key="view.value"
          :class="{ active: currentView === view.value }" 
          @click="handleViewChange(view.value)"
        >
          <span class="view-icon">{{ view.icon }}</span>
          <span class="view-label">{{ view.label }}</span>
        </button>
      </div>
      
      <div class="nav-controls">
        <button @click="handlePrevious" class="nav-btn" title="Предыдущий период">
          <span class="nav-icon">◀</span>
          <span class="nav-label">Назад</span>
        </button>
        
        <div class="period-display">
          <span class="period-icon">📅</span>
          <span class="current-period">{{ currentPeriodLabel }}</span>
        </div>
        
        <button @click="handleNext" class="nav-btn" title="Следующий период">
          <span class="nav-label">Вперед</span>
          <span class="nav-icon">▶</span>
        </button>
        
        <button @click="handleToday" class="today-btn" title="Перейти к сегодня">
          <span class="today-icon">📆</span>
          <span class="today-label">Сегодня</span>
        </button>
      </div>
    </div>
    
    <div class="employee-selector" v-if="employees.length > 0">
      <label class="selector-label">
        <span class="label-icon">👥</span>
        <span class="label-text">Сотрудник:</span>
      </label>
      <div class="select-wrapper">
        <select v-model="localEmployeeId" @change="onEmployeeChange">
          <option value="">Все сотрудники ({{ employees.length }})</option>
          <option 
            v-for="emp in employees" 
            :key="emp.id" 
            :value="emp.id"
          >
            {{ emp.name }} ({{ emp.alliance }} - {{ emp.group }})
          </option>
        </select>
        <span class="select-arrow">▼</span>
      </div>
      <div class="selected-info" v-if="localEmployeeId">
        <span class="selected-badge">✓</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VisualizationControls',
  
  props: {
    currentView: {
      type: String,
      required: true
    },
    currentPeriodLabel: {
      type: String,
      required: true
    },
    employees: {
      type: Array,
      default: () => []
    },
    selectedEmployeeId: {
      type: String,
      default: ''
    }
  },
  
  data() {
    return {
      localEmployeeId: this.selectedEmployeeId,
      views: [
        { value: 'day', label: 'День', icon: '📅' },
        { value: 'week', label: 'Неделя', icon: '📊' },
        { value: 'month', label: 'Месяц', icon: '📆' }
      ]
    }
  },
  
  watch: {
    selectedEmployeeId(newVal) {
      this.localEmployeeId = newVal
    }
  },
  
  methods: {
    handleViewChange(view) {
      this.$emit('view-change', view)
    },
    
    handlePrevious() {
      this.$emit('previous', this.currentView)
      console.log(`← Назад: ${this.currentView}`)
    },
    
    handleNext() {
      this.$emit('next', this.currentView)
      console.log(`→ Вперед: ${this.currentView}`)
    },
    
    handleToday() {
      this.$emit('today')
      console.log(`📆 Переход к сегодня: ${this.currentView}`)
    },
    
    onEmployeeChange() {
      this.$emit('employee-filter-change', this.localEmployeeId)
    }
  }
}
</script>

<style scoped>
/* CSS Variables для светлой и тёмной темы */
.viz-controls {
  --controls-bg-start: #ffffff;
  --controls-bg-end: #f8fafc;
  --controls-border: #e2e8f0;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --selector-bg: #f1f5f9;
  --btn-bg: #ffffff;
  --btn-hover: #10b981;
  --btn-active: #059669;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --gradient-start: #6366f1;
  --gradient-end: #8b5cf6;
}

@media (prefers-color-scheme: dark) {
  .viz-controls {
    --controls-bg-start: #1e293b;
    --controls-bg-end: #0f172a;
    --controls-border: #334155;
    --text-primary: #f1f5f9;
    --text-secondary: #94a3b8;
    --selector-bg: #334155;
    --btn-bg: #1e293b;
    --btn-hover: #059669;
    --btn-active: #047857;
    --gradient-start: #818cf8;
    --gradient-end: #a78bfa;
  }
}

.viz-controls {
  background: linear-gradient(135deg, var(--controls-bg-start) 0%, var(--controls-bg-end) 100%);
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow-md);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--controls-border);
}

.viz-controls:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.controls-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.25rem;
  margin-bottom: 1rem;
}

.view-selector {
  display: flex;
  gap: 0.5rem;
  background: var(--selector-bg);
  padding: 0.25rem;
  border-radius: 14px;
}

.view-selector button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.25rem;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 600;
  color: var(--text-secondary);
  position: relative;
  overflow: hidden;
  font-size: 0.875rem;
}

.view-selector button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(16, 185, 129, 0.2);
  transform: translate(-50%, -50%);
  transition: width 0.5s, height 0.5s;
}

.view-selector button:hover::before {
  width: 100%;
  height: 100%;
}

.view-selector button:hover {
  color: var(--text-primary);
  background: rgba(16, 185, 129, 0.1);
}

.view-selector button.active {
  background: linear-gradient(135deg, var(--btn-hover) 0%, var(--btn-active) 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.view-icon {
  font-size: 1rem;
}

.view-label {
  font-size: 0.875rem;
  font-weight: 600;
}

.nav-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--selector-bg);
  padding: 0.25rem 0.5rem;
  border-radius: 50px;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  border: none;
  background: var(--btn-bg);
  cursor: pointer;
  border-radius: 40px;
  transition: all 0.3s ease;
  font-weight: 500;
  color: var(--text-secondary);
  box-shadow: var(--shadow-sm);
  font-size: 0.813rem;
}

.nav-btn:hover {
  background: linear-gradient(135deg, var(--btn-hover) 0%, var(--btn-active) 100%);
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.nav-btn:active {
  transform: translateY(0);
}

.nav-icon {
  font-size: 0.75rem;
}

.nav-label {
  font-size: 0.813rem;
}

.period-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.25rem;
  background: var(--btn-bg);
  border-radius: 40px;
  box-shadow: var(--shadow-sm);
  min-width: 220px;
  justify-content: center;
  border: 1px solid var(--controls-border);
}

.period-icon {
  font-size: 0.875rem;
}

.current-period {
  font-weight: 700;
  font-size: 0.875rem;
  background: linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.today-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  border: none;
  background: linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%);
  color: white;
  cursor: pointer;
  border-radius: 40px;
  transition: all 0.3s ease;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(99, 102, 241, 0.3);
  font-size: 0.813rem;
}

.today-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
  filter: brightness(1.05);
}

.today-btn:active {
  transform: translateY(0);
}

.today-icon {
  font-size: 0.875rem;
}

.today-label {
  font-size: 0.813rem;
}

.employee-selector {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid var(--controls-border);
  flex-wrap: wrap;
}

.selector-label {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.label-icon {
  font-size: 0.875rem;
}

.label-text {
  font-size: 0.813rem;
}

.select-wrapper {
  position: relative;
  flex: 1;
  min-width: 250px;
}

.select-wrapper select {
  width: 100%;
  padding: 0.625rem 2.25rem 0.625rem 0.875rem;
  border: 2px solid var(--controls-border);
  border-radius: 12px;
  background: var(--btn-bg);
  cursor: pointer;
  font-size: 0.813rem;
  color: var(--text-primary);
  transition: all 0.3s ease;
  appearance: none;
  font-weight: 500;
}

.select-wrapper select:hover {
  border-color: var(--btn-hover);
}

.select-wrapper select:focus {
  outline: none;
  border-color: var(--btn-hover);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.select-arrow {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.625rem;
  color: var(--text-secondary);
  pointer-events: none;
  transition: transform 0.3s ease;
}

.select-wrapper:hover .select-arrow {
  transform: translateY(-50%) rotate(180deg);
}

.selected-info {
  display: flex;
  align-items: center;
}

.selected-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  background: linear-gradient(135deg, var(--btn-hover) 0%, var(--btn-active) 100%);
  color: white;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: bold;
  animation: fadeInScale 0.3s ease;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@media (max-width: 1024px) {
  .controls-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .view-selector {
    justify-content: center;
  }
  
  .nav-controls {
    justify-content: center;
    flex-wrap: wrap;
  }
}

@media (max-width: 768px) {
  .viz-controls {
    padding: 1rem;
  }
  
  .view-selector button {
    padding: 0.375rem 0.875rem;
  }
  
  .view-label {
    font-size: 0.75rem;
  }
  
  .nav-btn, .today-btn {
    padding: 0.375rem 0.75rem;
  }
  
  .nav-label, .today-label {
    font-size: 0.688rem;
  }
  
  .period-display {
    min-width: 180px;
    padding: 0.375rem 0.75rem;
  }
  
  .current-period {
    font-size: 0.75rem;
  }
  
  .select-wrapper {
    min-width: 200px;
  }
  
  .select-wrapper select {
    padding: 0.5rem 2rem 0.5rem 0.75rem;
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .view-selector {
    flex-direction: column;
    gap: 0.375rem;
  }
  
  .view-selector button {
    justify-content: center;
  }
  
  .nav-controls {
    flex-direction: column;
    width: 100%;
  }
  
  .nav-btn, .today-btn {
    width: 100%;
    justify-content: center;
  }
  
  .period-display {
    width: 100%;
  }
  
  .employee-selector {
    flex-direction: column;
    align-items: stretch;
  }
  
  .select-wrapper {
    width: 100%;
  }
}

.view-selector button:active::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 80%);
  transform: translate(-50%, -50%);
  animation: ripple 0.6s ease-out;
  pointer-events: none;
}

@keyframes ripple {
  0% {
    transform: scale(0);
    opacity: 0.5;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
}

.select-wrapper select option {
  padding: 0.625rem;
  font-size: 0.813rem;
}

.viz-controls.loading {
  position: relative;
  overflow: hidden;
}

.viz-controls.loading::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  animation: loading 1.5s ease infinite;
}

@keyframes loading {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

@media print {
  .viz-controls {
    break-inside: avoid;
    box-shadow: none;
    border: 1px solid #ccc;
  }
}
</style>