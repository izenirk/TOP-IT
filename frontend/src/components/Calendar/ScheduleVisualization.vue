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
      selectedEmployeeId: '',
      testEmployees: []
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
    
    activeEmployees() {
      if (this.employees && this.employees.length > 0) {
        return this.employees
      }
      return this.testEmployees
    },
    
    filteredEmployees() {
      if (!this.selectedEmployeeId) return this.activeEmployees
      return this.activeEmployees.filter(emp => emp.id == this.selectedEmployeeId)
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
              id: `${emp.id}_${shift.date}_${Date.now()}`
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
  
  mounted() {
    this.loadTestData()
  },
  
  methods: {
    loadTestData() {
      this.testEmployees = [
        {
          id: 1,
          name: 'Сизый Александр Петрович',
          alliance: 'Пупкина',
          group: 'Группа Сизых',
          shifts: [
            { date: '2026-04-01', startTime: '09:00', endTime: '18:00' },
            { date: '2026-04-02', startTime: '09:00', endTime: '18:00' },
            { date: '2026-04-03', startTime: '09:00', endTime: '18:00' },
            { date: '2026-04-04', startTime: 'Выходной', endTime: '' },
            { date: '2026-04-05', startTime: 'Выходной', endTime: '' },
            { date: '2026-04-06', startTime: '14:00', endTime: '23:00' },
            { date: '2026-04-07', startTime: '14:00', endTime: '23:00' },
            { date: '2026-04-08', startTime: '14:00', endTime: '23:00' },
            { date: '2026-04-09', startTime: '09:00', endTime: '18:00' },
            { date: '2026-04-10', startTime: '09:00', endTime: '18:00' },
            { date: '2026-04-11', startTime: 'Выходной', endTime: '' },
            { date: '2026-04-12', startTime: 'Выходной', endTime: '' },
            { date: '2026-04-13', startTime: '22:00', endTime: '06:00' },
            { date: '2026-04-14', startTime: '22:00', endTime: '06:00' },
            { date: '2026-04-15', startTime: '22:00', endTime: '06:00' }
          ]
        },
        {
          id: 2,
          name: 'Сизый Мария Ивановна',
          alliance: 'Пупкина',
          group: 'Группа Сизых',
          shifts: [
            { date: '2026-04-01', startTime: '10:00', endTime: '19:00' },
            { date: '2026-04-02', startTime: '10:00', endTime: '19:00' },
            { date: '2026-04-03', startTime: 'Выходной', endTime: '' },
            { date: '2026-04-04', startTime: '10:00', endTime: '19:00' },
            { date: '2026-04-05', startTime: '10:00', endTime: '19:00' },
            { date: '2026-04-06', startTime: 'Выходной', endTime: '' },
            { date: '2026-04-07', startTime: '12:00', endTime: '21:00' },
            { date: '2026-04-08', startTime: '12:00', endTime: '21:00' },
            { date: '2026-04-09', startTime: '12:00', endTime: '21:00' },
            { date: '2026-04-10', startTime: '10:00', endTime: '19:00' },
            { date: '2026-04-11', startTime: '10:00', endTime: '19:00' },
            { date: '2026-04-12', startTime: 'Выходной', endTime: '' },
            { date: '2026-04-13', startTime: '10:00', endTime: '19:00' }
          ]
        },
        {
          id: 3,
          name: 'Васильков Иван Сергеевич',
          alliance: 'Пупкина',
          group: 'Группа Василькова',
          shifts: [
            { date: '2026-04-01', startTime: '08:00', endTime: '17:00' },
            { date: '2026-04-02', startTime: '08:00', endTime: '17:00' },
            { date: '2026-04-03', startTime: '08:00', endTime: '17:00' },
            { date: '2026-04-04', startTime: '08:00', endTime: '17:00' },
            { date: '2026-04-05', startTime: 'Выходной', endTime: '' },
            { date: '2026-04-06', startTime: 'Выходной', endTime: '' },
            { date: '2026-04-07', startTime: '16:00', endTime: '01:00' },
            { date: '2026-04-08', startTime: '16:00', endTime: '01:00' },
            { date: '2026-04-09', startTime: '16:00', endTime: '01:00' },
            { date: '2026-04-10', startTime: '16:00', endTime: '01:00' },
            { date: '2026-04-11', startTime: '08:00', endTime: '17:00' },
            { date: '2026-04-12', startTime: 'Выходной', endTime: '' },
            { date: '2026-04-13', startTime: 'Выходной', endTime: '' }
          ]
        },
        {
          id: 4,
          name: 'Кузнецов Виктор Михайлович',
          alliance: 'Тумбочкина',
          group: 'Группа Кузнецовых',
          shifts: [
            { date: '2026-04-01', startTime: '07:00', endTime: '16:00' },
            { date: '2026-04-02', startTime: '07:00', endTime: '16:00' },
            { date: '2026-04-03', startTime: '07:00', endTime: '16:00' },
            { date: '2026-04-04', startTime: 'Выходной', endTime: '' },
            { date: '2026-04-05', startTime: 'Выходной', endTime: '' },
            { date: '2026-04-06', startTime: '15:00', endTime: '00:00' },
            { date: '2026-04-07', startTime: '15:00', endTime: '00:00' },
            { date: '2026-04-08', startTime: '15:00', endTime: '00:00' },
            { date: '2026-04-09', startTime: '07:00', endTime: '16:00' },
            { date: '2026-04-10', startTime: '07:00', endTime: '16:00' },
            { date: '2026-04-11', startTime: '07:00', endTime: '16:00' },
            { date: '2026-04-12', startTime: 'Выходной', endTime: '' },
            { date: '2026-04-13', startTime: 'Выходной', endTime: '' }
          ]
        },
        {
          id: 5,
          name: 'Морозовых Андрей Владимирович',
          alliance: 'Петровича',
          group: 'Группа Морозовых',
          shifts: [
            { date: '2026-04-01', startTime: '09:00', endTime: '18:00' },
            { date: '2026-04-02', startTime: 'Выходной', endTime: '' },
            { date: '2026-04-03', startTime: '09:00', endTime: '18:00' },
            { date: '2026-04-04', startTime: '09:00', endTime: '18:00' },
            { date: '2026-04-05', startTime: '09:00', endTime: '18:00' },
            { date: '2026-04-06', startTime: 'Выходной', endTime: '' },
            { date: '2026-04-07', startTime: '14:00', endTime: '23:00' },
            { date: '2026-04-08', startTime: '14:00', endTime: '23:00' },
            { date: '2026-04-09', startTime: '14:00', endTime: '23:00' },
            { date: '2026-04-10', startTime: 'Выходной', endTime: '' },
            { date: '2026-04-11', startTime: '09:00', endTime: '18:00' },
            { date: '2026-04-12', startTime: '09:00', endTime: '18:00' },
            { date: '2026-04-13', startTime: '09:00', endTime: '18:00' }
          ]
        }
      ]
    },
    
    setView(view) {
      this.currentView = view
      this.$emit('view-change', view)
    },
    
    // НОВЫЙ МЕТОД - универсальная навигация
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

/* Адаптивность */
@media (max-width: 768px) {
  .schedule-visualization {
    padding: 16px;
  }
  
  .visualization-content {
    padding: 12px;
    overflow-x: auto;
  }
}

/* Стили для скроллбара */
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