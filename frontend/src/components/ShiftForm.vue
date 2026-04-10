<template>
  <form @submit.prevent="handleSubmit" class="shift-form">
    <!-- Выбор даты -->
    <div class="form-group">
      <label for="shiftDate">Выберите дату:</label>
      <select id="shiftDate" v-model="form.date" required @change="checkConsecutive">
        <option v-for="date in dateOptions" :key="date.value" :value="date.value">
          {{ date.label }}
        </option>
      </select>
    </div>

    <!-- Предупреждение о подряд идущих сменах -->
    <div v-if="consecutiveWarning" class="alert" :class="warningClass">
      {{ consecutiveWarning }}
    </div>

    <!-- Начало смены -->
    <div class="form-group">
      <label for="startTime">Начало смены:</label>
      <select id="startTime" v-model="form.startTime" required @change="onStartTimeChange">
        <option value="">-- Выберите время --</option>
        <option value="Выходной">Выходной</option>
        <option v-for="time in startTimeOptions" :key="time" :value="time">
          {{ time }}
        </option>
      </select>
    </div>

    <!-- Конец смены -->
    <div class="form-group">
      <label for="endTime">Конец смены:</label>
      <select
        id="endTime"
        v-model="form.endTime"
        :disabled="!isEndTimeEnabled"
        required
      >
        <option value="">-- Выберите время --</option>
        <option v-for="time in endTimeOptions" :key="time.value" :value="time.value">
          {{ time.label }}
        </option>
      </select>
    </div>

    <button type="submit" class="submit-btn">Добавить график</button>
  </form>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'

// Пропсы: можно передать сотрудника и его текущие смены для проверки подряд идущих смен
const props = defineProps({
  employee: {
    type: Object,
    default: null
  }
})

// Событие, которое компонент отправляет при добавлении смены
const emit = defineEmits(['add-shift'])

// Реактивная форма
const form = reactive({
  date: '',
  startTime: '',
  endTime: ''
})

// Предупреждение о количестве смен подряд
const consecutiveWarning = ref('')
const warningClass = ref('')

// Генерация списка дат на 30 дней вперёд
const dateOptions = computed(() => {
  const options = []
  const today = new Date()
  const weekdays = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']

  for (let i = 0; i < 30; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const value = `${year}-${month}-${day}`
    const label = `${value} (${weekdays[date.getDay()]})`
    options.push({ value, label })
  }
  return options
})

// Опции для времени начала (с 6:30, шаг 15 минут)
const startTimeOptions = computed(() => {
  const times = []
  for (let hour = 6; hour < 24; hour++) {
    for (const minute of [0, 15, 30, 45]) {
      // Пропускаем время до 6:30
      if (hour === 6 && minute < 30) continue
      times.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`)
    }
  }
  return times
})

// Доступность выбора конца смены
const isEndTimeEnabled = computed(() => {
  return form.startTime && form.startTime !== 'Выходной'
})

// Динамическая генерация времени окончания на основе выбранного начала
const endTimeOptions = computed(() => {
  if (!form.startTime || form.startTime === 'Выходной') return []

  const [startHour, startMinute] = form.startTime.split(':').map(Number)
  const startTotal = startHour * 60 + startMinute

  const options = []

  for (let hour = 0; hour <= 24; hour++) {
    for (const minute of [0, 15, 30, 45]) {
      if (hour === 24 && minute > 0) continue

      let endTotal = hour * 60 + minute
      // Если конец приходится на следующий день (например, 02:00)
      if (hour < 6 && hour !== 0) endTotal += 24 * 60
      if (hour === 0 && minute === 0 && startHour > 0) endTotal += 24 * 60

      // Время окончания должно быть позже начала
      if (endTotal <= startTotal) continue

      const duration = endTotal - startTotal
      if (duration > 720) continue // максимум 12 часов

      // Нельзя заканчивать позже 2:00 (кроме ровно 2:00)
      if (hour > 2 && hour < 6) continue
      if (hour === 2 && minute > 0) continue

      const value = `${String(hour === 24 ? 0 : hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
      const nextDay = hour >= 24 || hour < 6
      const label = nextDay ? `${value} (след. день)` : value

      options.push({ value, label })
    }
  }

  // Сортируем по времени (учитывая переход через полночь)
  options.sort((a, b) => {
    const getMinutes = (timeStr) => {
      const [h, m] = timeStr.split(':').map(Number)
      let total = h * 60 + m
      if (h < 6) total += 24 * 60
      return total
    }
    return getMinutes(a.value) - getMinutes(b.value)
  })

  return options
})

// Обработка изменения времени начала
function onStartTimeChange() {
  form.endTime = ''
  checkConsecutive()
}

// Проверка количества смен подряд (если передан сотрудник)
function checkConsecutive() {
  if (!props.employee || !form.date) {
    consecutiveWarning.value = ''
    return
  }

  const shifts = [...props.employee.shifts]
  const newDate = form.date

  // Сортируем все даты смен
  const allDates = [...shifts.map(s => s.date), newDate].sort()
  let maxConsecutive = 0
  let currentStreak = 0
  let lastDate = null

  for (const dateStr of allDates) {
    const current = new Date(dateStr)
    if (lastDate) {
      const diff = Math.round((current - lastDate) / (1000 * 60 * 60 * 24))
      if (diff === 1) {
        currentStreak++
      } else {
        currentStreak = 1
      }
    } else {
      currentStreak = 1
    }
    maxConsecutive = Math.max(maxConsecutive, currentStreak)
    lastDate = current
  }

  if (maxConsecutive > 6) {
    consecutiveWarning.value = `⚠️ Предупреждение: При добавлении этой смены будет ${maxConsecutive} смен подряд! Максимально допустимо - 6 смен.`
    warningClass.value = 'warning'
  } else if (maxConsecutive > 4) {
    consecutiveWarning.value = `⚠️ Внимание: ${maxConsecutive} смен подряд. Осталось ${6 - maxConsecutive} до лимита.`
    warningClass.value = 'alert-info'
  } else {
    consecutiveWarning.value = ''
    warningClass.value = ''
  }
}

// Отправка формы
function handleSubmit() {
  if (!form.date || !form.startTime) return
  if (form.startTime !== 'Выходной' && !form.endTime) return

  // Проверка длительности (уже учтена в генерации опций, но дополнительная страховка)
  if (form.startTime !== 'Выходной') {
    const [sh, sm] = form.startTime.split(':').map(Number)
    const [eh, em] = form.endTime.split(':').map(Number)
    let start = sh * 60 + sm
    let end = eh * 60 + em
    if (eh < 6) end += 24 * 60
    if (end - start > 720) {
      alert('Длительность смены не может превышать 12 часов!')
      return
    }
  }

  const shift = {
    date: form.date,
    startTime: form.startTime,
    endTime: form.startTime === 'Выходной' ? '' : form.endTime
  }

  emit('add-shift', shift)

  // Сброс формы
  form.date = ''
  form.startTime = ''
  form.endTime = ''
  consecutiveWarning.value = ''
}
</script>

<style scoped>
.shift-form {
  padding: 1rem;
  border: 1px solid #ccc;
  background-color: #f9f9f9;
  border-radius: 8px;
  max-width: 400px;
}
.form-group {
  margin-bottom: 1rem;
}
label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: bold;
}
select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.submit-btn {
  background-color: #4caf50;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}
.submit-btn:hover {
  background-color: #45a049;
}
.alert {
  padding: 0.75rem;
  margin: 1rem 0;
  border-radius: 4px;
}
.warning {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeeba;
}
.alert-info {
  background-color: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}
</style>