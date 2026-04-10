<template>
  <div class="schedule-visualization">
    <VisualizationControls 
      :current-view="currentView"
      :current-period-label="currentPeriodLabel"
      :employees="employees"
      :selected-employee-id="selectedEmployeeId"
      @view-change="setView"
      @previous="(view) => navigatePeriod(-1, view)"
      @next="(view) => navigatePeriod(1, view)"
      @today="goToToday"
      @employee-filter-change="selectedEmployeeId = $event"
    />
    
    <div class="visualization-content">
      <component 
        :is="currentViewComponent"
        :current-date="currentDate"
        :shifts="filteredShifts"
        :employees="filteredEmployees"
      />
    </div>
    
    <NoData v-if="!hasShifts" />
  </div>
</template>

<script>
import VisualizationControls from './VisualizationControls.vue'
import DayView from './views/DayView.vue'
import WeekView from './views/WeekView.vue'
import MonthView from './views/MonthView.vue'
import NoData from './NoData.vue'

export default {
  name: 'ScheduleVisualization',
  
  components: {
    VisualizationControls,
    DayView,
    WeekView,
    MonthView,
    NoData
  },
  
  props: {
    employees: {
      type: Array,
      default: () => []
    },
    initialView: {
      type: String,
      default: 'week',
      validator: (value) => ['day', 'week', 'month'].includes(value)
    },
    initialDate: {
      type: Date,
      default: () => new Date()
    }
  },
  
  data() {
    return {
      currentView: this.initialView,
      currentDate: new Date(this.initialDate),
      selectedEmployeeId: ''
    }
  },
  
  computed: {
    currentViewComponent() {
      const views = {
        day: DayView,
        week: WeekView,
        month: MonthView
      }
      return views[this.currentView]
    },
    
    filteredEmployees() {
      if (!this.selectedEmployeeId) return this.employees
      return this.employees.filter(emp => emp.id == this.selectedEmployeeId)
    },
    
    filteredShifts() {
      const shifts = []
      this.filteredEmployees.forEach(emp => {
        if (emp.shifts && emp.shifts.length) {
          emp.shifts.forEach(shift => {
            shifts.push({
              ...shift,
              employeeId: emp.id,
              employeeName: emp.name,
              alliance: emp.alliance,
              group: emp.group,
              id: `${emp.id}_${shift.date}_${Date.now()}_${Math.random()}`
            })
          })
        }
      })
      return shifts
    },
    
    currentPeriodLabel() {
      switch (this.currentView) {
        case 'day':
          return this.formatDate(this.currentDate, 'full')
        case 'week':
          const start = this.getStartOfWeek(this.currentDate)
          const end = new Date(start)
          end.setDate(start.getDate() + 6)
          return `${this.formatDate(start, 'short')} - ${this.formatDate(end, 'short')}`
        case 'month':
          return this.formatDate(this.currentDate, 'monthYear')
        default:
          return ''
      }
    },
    
    hasShifts() {
      return this.filteredShifts.length > 0
    }
  },
  
  methods: {
    setView(view) {
      this.currentView = view
      this.$emit('view-change', view)
    },
    
    navigatePeriod(direction, view) {
      const newDate = new Date(this.currentDate);
      
      switch(view) {
        case 'day':
          newDate.setDate(newDate.getDate() + direction);
          break;
        case 'week':
          newDate.setDate(newDate.getDate() + (direction * 7));
          break;
        case 'month':
          newDate.setMonth(newDate.getMonth() + direction);
          break;
      }
      
      this.currentDate = newDate;
      this.$emit('period-change', this.currentDate);
    },
    
    goToToday() {
      this.currentDate = new Date();
      this.$emit('period-change', this.currentDate);
    },
    
    formatDate(date, format = 'iso') {
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      
      switch (format) {
        case 'iso':
          return `${year}-${month}-${day}`
        case 'day':
          return `${day}.${month}`
        case 'short':
          return `${day}.${month}`
        case 'full':
          const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 
                         'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
          const weekdays = ['воскресенье', 'понедельник', 'вторник', 'среда', 
                           'четверг', 'пятница', 'суббота']
          return `${day} ${months[d.getMonth()]} ${year}, ${weekdays[d.getDay()]}`
        case 'monthYear':
          const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                             'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
          return `${monthNames[d.getMonth()]} ${year}`
        default:
          return `${year}-${month}-${day}`
      }
    },
    
    getStartOfWeek(date) {
      const d = new Date(date)
      const day = d.getDay()
      const diff = (day === 0 ? 6 : day - 1)
      d.setDate(d.getDate() - diff)
      return d
    }
  }
}
</script>

<style scoped>
/* CSS Variables для светлой и тёмной темы */
.schedule-visualization {
  --viz-bg-start: #f8fafc;
  --viz-bg-end: #e2e8f0;
  --content-bg: #ffffff;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --border-color: #e2e8f0;
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.12);
  --scrollbar-track: #f1f5f9;
  --scrollbar-thumb: #cbd5e1;
  --scrollbar-thumb-hover: #94a3b8;
}

@media (prefers-color-scheme: dark) {
  .schedule-visualization {
    --viz-bg-start: #0f172a;
    --viz-bg-end: #1e293b;
    --content-bg: #1e293b;
    --text-primary: #f1f5f9;
    --text-secondary: #94a3b8;
    --border-color: #334155;
    --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.2);
    --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.3);
    --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.4);
    --scrollbar-track: #1e293b;
    --scrollbar-thumb: #475569;
    --scrollbar-thumb-hover: #64748b;
  }
}

.schedule-visualization {
  background: linear-gradient(135deg, var(--viz-bg-start) 0%, var(--viz-bg-end) 100%);
  border-radius: 28px;
  padding: 24px;
  margin-top: 32px;
  box-shadow: var(--shadow-lg);
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.visualization-content {
  background: var(--content-bg);
  border-radius: 20px;
  padding: 20px;
  margin-top: 20px;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
  overflow-x: auto;
}

.visualization-content:hover {
  box-shadow: var(--shadow-md);
}

/* Адаптивность */
@media (max-width: 768px) {
  .schedule-visualization {
    padding: 16px;
    border-radius: 24px;
    margin-top: 24px;
  }
  
  .visualization-content {
    padding: 12px;
    border-radius: 16px;
  }
}

@media (max-width: 480px) {
  .schedule-visualization {
    padding: 12px;
    border-radius: 20px;
    margin-top: 20px;
  }
  
  .visualization-content {
    padding: 8px;
    border-radius: 14px;
  }
}

/* Кастомный скроллбар */
.visualization-content::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.visualization-content::-webkit-scrollbar-track {
  background: var(--scrollbar-track);
  border-radius: 10px;
}

.visualization-content::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb);
  border-radius: 10px;
  transition: background 0.2s ease;
}

.visualization-content::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-thumb-hover);
}

/* Анимация появления контента */
.visualization-content {
  animation: fadeInUp 0.4s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>