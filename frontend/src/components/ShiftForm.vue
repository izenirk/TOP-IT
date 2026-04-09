<template>
  <form @submit.prevent="handleSubmit" class="shift-form">
    <div class="form-header">
      <h3>➕ Добавление смены</h3>
      <div class="form-subtitle" v-if="employee">
        для {{ employee.name }}
      </div>
    </div>

    <!-- Выбор даты -->
    <div class="form-group">
      <label for="shiftDate">
        <svg viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
          <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2"/>
          <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2"/>
          <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/>
        </svg>
        Дата смены
      </label>
      <select id="shiftDate" v-model="form.date" required @change="checkConsecutive">
        <option value="" disabled>Выберите дату</option>
        <option v-for="date in dateOptions" :key="date.value" :value="date.value">
          {{ date.label }}
        </option>
      </select>
    </div>

    <!-- Предупреждение о подряд идущих сменах -->
    <div v-if="consecutiveWarning" class="alert" :class="warningClass">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M12 8V12M12 16H12.01M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      {{ consecutiveWarning }}
    </div>

    <!-- Начало смены -->
    <div class="form-group">
      <label for="startTime">
        <svg viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <polyline points="12 6 12 12 16 14" stroke="currentColor" stroke-width="2"/>
        </svg>
        Начало смены
      </label>
      <select id="startTime" v-model="form.startTime" required @change="onStartTimeChange">
        <option value="" disabled>-- Выберите время --</option>
        <option value="Выходной">🌙 Выходной</option>
        <option v-for="time in startTimeOptions" :key="time" :value="time">
          {{ time }}
        </option>
      </select>
    </div>

    <!-- Конец смены -->
    <div class="form-group" :class="{ 'fade-in': isEndTimeEnabled }">
      <label for="endTime">
        <svg viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <polyline points="12 6 12 12 16 14" stroke="currentColor" stroke-width="2"/>
        </svg>
        Конец смены
      </label>
      <select
        id="endTime"
        v-model="form.endTime"
        :disabled="!isEndTimeEnabled"
        required
      >
        <option value="" disabled>-- Выберите время --</option>
        <option v-for="time in endTimeOptions" :key="time.value" :value="time.value">
          {{ time.label }}
        </option>
      </select>
    </div>

    <button type="submit" class="submit-btn">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      Добавить график
    </button>
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
    consecutiveWarning.value = `При добавлении этой смены будет ${maxConsecutive} смен подряд! Максимально допустимо - 6 смен.`
    warningClass.value = 'warning'
  } else if (maxConsecutive > 4) {
    consecutiveWarning.value = `${maxConsecutive} смен подряд. Осталось ${6 - maxConsecutive} до лимита.`
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
/* CSS Variables для светлой и тёмной темы */
.shift-form {
  --form-bg: #ffffff;
  --form-border: #e2e8f0;
  --form-text: #0f172a;
  --form-label: #475569;
  --input-bg: #ffffff;
  --input-border: #cbd5e1;
  --input-focus: #4f46e5;
  --alert-bg: #fef3c7;
  --alert-text: #92400e;
  --warning-bg: #fee2e2;
  --warning-text: #dc2626;
  --info-bg: #dbeafe;
  --info-text: #1e40af;
  --submit-bg: #10b981;
  --submit-hover: #059669;
  --header-border: #f1f5f9;
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

@media (prefers-color-scheme: dark) {
  .shift-form {
    --form-bg: #1e293b;
    --form-border: #334155;
    --form-text: #f1f5f9;
    --form-label: #94a3b8;
    --input-bg: #334155;
    --input-border: #475569;
    --input-focus: #818cf8;
    --alert-bg: #78350f;
    --alert-text: #fde68a;
    --warning-bg: #7f1d1d;
    --warning-text: #fca5a5;
    --info-bg: #1e3a5f;
    --info-text: #93c5fd;
    --submit-bg: #059669;
    --submit-hover: #10b981;
    --header-border: #334155;
    --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
  }
}

.shift-form {
  background-color: var(--form-bg);
  border-radius: 24px;
  padding: 24px;
  border: 1px solid var(--form-border);
  box-shadow: var(--shadow);
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  transition: all 0.2s ease;
  max-width: 480px;
  width: 100%;
}

/* Шапка */
.form-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--header-border);
}

.form-header h3 {
  margin: 0 0 4px 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--form-text);
  letter-spacing: -0.01em;
}

.form-subtitle {
  font-size: 0.8rem;
  color: var(--form-label);
  margin-top: 4px;
}

/* Группа полей */
.form-group {
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.form-group.fade-in {
  animation: fadeInUp 0.3s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  color: var(--form-label);
  font-weight: 500;
  font-size: 0.85rem;
  letter-spacing: 0.3px;
}

.form-group label svg {
  width: 18px;
  height: 18px;
}

.form-group select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--input-border);
  border-radius: 16px;
  font-size: 0.95rem;
  background-color: var(--input-bg);
  color: var(--form-text);
  transition: all 0.2s ease;
  font-family: inherit;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 18px;
}

.form-group select:focus {
  outline: none;
  border-color: var(--input-focus);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
}

.form-group select:disabled {
  background-color: var(--form-border);
  cursor: not-allowed;
  opacity: 0.7;
}

/* Алерты */
.alert {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 16px;
  margin-bottom: 20px;
  font-size: 0.85rem;
  line-height: 1.4;
}

.alert svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.alert.alert-info {
  background-color: var(--info-bg);
  color: var(--info-text);
  border-left: 3px solid #3b82f6;
}

.alert.warning {
  background-color: var(--warning-bg);
  color: var(--warning-text);
  border-left: 3px solid #ef4444;
}

/* Кнопка отправки */
.submit-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background-color: var(--submit-bg);
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 40px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  font-family: inherit;
  transition: all 0.2s ease;
  margin-top: 8px;
}

.submit-btn svg {
  width: 20px;
  height: 20px;
}

.submit-btn:hover {
  background-color: var(--submit-hover);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
}

.submit-btn:active {
  transform: translateY(0);
}

/* Адаптивность */
@media (max-width: 520px) {
  .shift-form {
    padding: 20px;
    border-radius: 20px;
  }
  
  .form-header h3 {
    font-size: 1.2rem;
  }
  
  .form-group select {
    padding: 10px 14px;
    font-size: 0.9rem;
  }
  
  .submit-btn {
    padding: 11px 16px;
    font-size: 0.9rem;
  }
  
  .alert {
    padding: 10px 12px;
    font-size: 0.8rem;
  }
}
</style>