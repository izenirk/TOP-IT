<template>
  <div class="day-view">
    <h3>{{ formatDate(currentDate, 'full') }}</h3>
    <div class="day-schedule">
      <div class="timeline">
        <div class="timeline-hours">
          <div v-for="hour in 24" :key="hour" class="hour-marker">
            {{ hour }}:00
          </div>
        </div>
        <div class="shifts-container">
          <ShiftBlock 
            v-for="shift in dayShifts" 
            :key="shift.id"
            :shift="shift"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ShiftBlock from '../ShiftBlock.vue';
import { formatDate, getDayShifts } from '../utils/dateUtils.js';

export default {
  name: 'DayView',
  
  components: {
    ShiftBlock
  },
  
  props: {
    currentDate: {
      type: Date,
      required: true
    },
    shifts: {
      type: Array,
      default: () => []
    }
  },
  
  computed: {
    dayShifts() {
      const dateStr = this.formatDate(this.currentDate, 'iso')
      return getDayShifts(this.shifts, dateStr)
    }
  },
  
  methods: {
    formatDate
  }
}
</script>

<style scoped>
.day-view {
  overflow-x: auto;
}

.day-view h3 {
  margin-bottom: 20px;
  color: #333;
}

.day-schedule {
  position: relative;
  min-height: 600px;
}

.timeline {
  display: flex;
  position: relative;
}

.timeline-hours {
  width: 60px;
  flex-shrink: 0;
}

.hour-marker {
  height: 60px;
  border-bottom: 1px solid #eee;
  font-size: 12px;
  text-align: right;
  padding-right: 8px;
  color: #666;
}

.shifts-container {
  flex: 1;
  position: relative;
  background: #fafafa;
  min-height: 1440px;
}
</style>