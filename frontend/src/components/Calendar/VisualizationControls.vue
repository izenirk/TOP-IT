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
      // Отправляем событие с информацией о текущем виде
      this.$emit('previous', this.currentView)
      console.log(`← Назад: ${this.currentView}`)
    },
    
    handleNext() {
      // Отправляем событие с информацией о текущем виде
      this.$emit('next', this.currentView)
      console.log(`→ Вперед: ${this.currentView}`)
    },
    
    handleToday() {
      // Отправляем событие перехода к сегодня
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
.viz-controls {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.viz-controls:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.controls-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 16px;
}

/* Селектор вида */
.view-selector {
  display: flex;
  gap: 8px;
  background: #f1f3f5;
  padding: 4px;
  border-radius: 12px;
}

.view-selector button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  color: #6c757d;
  position: relative;
  overflow: hidden;
}

.view-selector button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(76, 175, 80, 0.2);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.view-selector button:hover::before {
  width: 100%;
  height: 100%;
}

.view-selector button:hover {
  color: #495057;
  background: rgba(76, 175, 80, 0.1);
}

.view-selector button.active {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
}

.view-icon {
  font-size: 16px;
}

.view-label {
  font-size: 14px;
  font-weight: 600;
}

/* Навигация */
.nav-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 40px;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  background: white;
  cursor: pointer;
  border-radius: 30px;
  transition: all 0.3s ease;
  font-weight: 500;
  color: #495057;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.nav-btn:hover {
  background: #4CAF50;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.nav-btn:active {
  transform: translateY(0);
}

.nav-icon {
  font-size: 12px;
}

.nav-label {
  font-size: 13px;
}

.period-display {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  background: white;
  border-radius: 30px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-width: 220px;
  justify-content: center;
}

.period-icon {
  font-size: 14px;
}

.current-period {
  font-weight: 600;
  font-size: 14px;
  color: #2c3e50;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.today-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  cursor: pointer;
  border-radius: 30px;
  transition: all 0.3s ease;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
}

.today-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.today-btn:active {
  transform: translateY(0);
}

.today-icon {
  font-size: 14px;
}

.today-label {
  font-size: 13px;
}

/* Селектор сотрудника */
.employee-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e9ecef;
  flex-wrap: wrap;
}

.selector-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  color: #495057;
}

.label-icon {
  font-size: 14px;
}

.label-text {
  font-size: 13px;
}

.select-wrapper {
  position: relative;
  flex: 1;
  min-width: 250px;
}

.select-wrapper select {
  width: 100%;
  padding: 10px 36px 10px 14px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  font-size: 13px;
  color: #2c3e50;
  transition: all 0.3s ease;
  appearance: none;
  font-weight: 500;
}

.select-wrapper select:hover {
  border-color: #4CAF50;
}

.select-wrapper select:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.select-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  color: #6c757d;
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
  width: 24px;
  height: 24px;
  background: #4CAF50;
  color: white;
  border-radius: 50%;
  font-size: 12px;
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

/* Адаптивность */
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
    padding: 16px;
  }
  
  .view-selector button {
    padding: 6px 14px;
  }
  
  .view-label {
    font-size: 12px;
  }
  
  .nav-btn, .today-btn {
    padding: 6px 12px;
  }
  
  .nav-label, .today-label {
    font-size: 11px;
  }
  
  .period-display {
    min-width: 180px;
    padding: 6px 12px;
  }
  
  .current-period {
    font-size: 12px;
  }
  
  .select-wrapper {
    min-width: 200px;
  }
  
  .select-wrapper select {
    padding: 8px 32px 8px 12px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .view-selector {
    flex-direction: column;
    gap: 6px;
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

/* Анимации для кнопок */
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

/* Стили для опций select */
.select-wrapper select option {
  padding: 10px;
  font-size: 13px;
}

/* Индикатор загрузки */
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
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
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
</style>