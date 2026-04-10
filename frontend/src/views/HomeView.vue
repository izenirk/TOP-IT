<<<<<<< HEAD
<script setup>
<<<<<<< HEAD
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
=======

import ShiftForm from '../components/ShiftForm.vue'

>>>>>>> refs/remotes/origin/main
</script>

<template>
  <main>
<<<<<<< HEAD
    <TheWelcome />
    
    <!-- Использование компонента -->
    <WorkSummary :employees="employees" />
  </main>
</template>
=======

    <ShiftForm />
  
  </main>
</template>
=======
<template>
  <div class="home">
    <h1>Главная страница</h1>
    <p>Добро пожаловать в систему управления графиком сотрудников</p>
  </div>
</template>

<script>
export default {
  name: 'HomeView'
}
</script>

<style scoped>
.home {
  padding: 20px;
  text-align: center;
}

h1 {
  color: #333;
  margin-bottom: 20px;
}

p {
  color: #666;
  font-size: 16px;
}
</style>
>>>>>>> c34e5662eb943eb6a3d9e8367a509e0bca09514c
>>>>>>> refs/remotes/origin/main
