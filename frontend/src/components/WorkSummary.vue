<template>
  <div class="summary">
    <h2>Общий свод</h2>
    <div v-if="totalShifts > 0">
      <div class="summary-section">
        <strong>Распределение смен по дням недели (100%):</strong><br>
        <div v-for="day in weekdaysData" :key="day.name">
          {{ day.name }}: {{ day.percentage }}% ({{ day.count }} смен)
        </div>
      </div>

      <div class="summary-section">
        <small>Целевое распределение (норма 5/2):<br>
        Пн-Пт: ~71.43% (5/7), Сб-Вс: ~28.57% (2/7)</small>
      </div>

      <div class="summary-section">
        <strong>Смены по времени (100%):</strong><br>
        Начинаются до 11:00: {{ before11Percentage }}% ({{ before11Shifts }} смен)<br>
        Заканчиваются после 19:00: {{ after19Percentage }}% ({{ after19Shifts }} смен)<br>
        Остальное время: {{ otherTimePercentage }}%
      </div>

      <div v-if="warnings.length > 0" class="warnings">
        <div v-for="(warning, idx) in warnings" :key="idx" class="warning">
          ⚠️ {{ warning }}
        </div>
      </div>
    </div>
    <div v-else class="empty">
      Нет данных для свода.
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
      dayNames: ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']
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
        count: this.shiftsByDay[i],
        percentage: ((this.shiftsByDay[i] / this.totalShifts) * 100).toFixed(2)
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
        ? ((this.before11Shifts / this.totalShifts) * 100).toFixed(2) 
        : '0.00'
    },
    
    after19Percentage() {
      return this.totalShifts > 0 
        ? ((this.after19Shifts / this.totalShifts) * 100).toFixed(2) 
        : '0.00'
    },
    
    otherTimePercentage() {
      return (100 - parseFloat(this.before11Percentage) - parseFloat(this.after19Percentage)).toFixed(2)
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
        warningsList.push(`${this.employeesWithExcessConsecutive} сотрудник(ов) имеют более 6 смен подряд!`)
      }
      if (this.longShifts > 0) {
        warningsList.push(`${this.longShifts} смен(ы) длительностью более 12 часов!`)
      }
      return warningsList
    }
  },
  methods: {
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
.summary {
  width: 300px;
  border: 1px solid #ccc;
  padding: 10px;
}
.summary-section {
  margin-bottom: 12px;
}
.warning {
  color: orange;
  font-weight: bold;
}
.warnings {
  margin-top: 10px;
}
.empty {
  color: #666;
  font-style: italic;
}
</style>