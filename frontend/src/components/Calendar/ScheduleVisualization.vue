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
.schedule-visualization {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 16px;
  padding: 24px;
  margin-top: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.visualization-content {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.visualization-content:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .schedule-visualization {
    padding: 16px;
  }
  
  .visualization-content {
    padding: 12px;
    overflow-x: auto;
  }
}

.visualization-content::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.visualization-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.visualization-content::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.visualization-content::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>