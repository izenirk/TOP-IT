<script setup>
import WorkSummary from '../components/WorkSummary.vue'  // импорт вашего компонента

// Данные для примера (можно заменить на реальные из вашего хранилища/API)
import { ref } from 'vue'

const employees = ref([
  // Пример структуры данных
  {
    name: 'Сизый Александр Петрович',
    alliance: 'Пупкина',
    group: 'Группа Сизых',
    shifts: [
      { date: '2026-04-10', startTime: '09:00', endTime: '18:00' },
      { date: '2026-04-11', startTime: 'Выходной', endTime: '' }
    ]
  }
])
</script>

<template>
  <main>
    <TheWelcome />
    
    <!-- Использование компонента -->
    <WorkSummary :employees="employees" />
  </main>
</template>