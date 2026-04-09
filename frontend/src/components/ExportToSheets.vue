<template>
  <button @click="exportToCSV" class="export-btn">
    📊 Экспорт в Google Таблицы (CSV)
  </button>
</template>

<script setup>
import { scheduleStore } from '../store/scheduleStore.js'

// Генерируем CSV из данных хранилища
function exportToCSV() {
  const employees = scheduleStore.employees
  if (!employees.length) {
    alert('Нет данных для экспорта')
    return
  }

  // Собираем все уникальные даты
  const allDatesSet = new Set()
  employees.forEach(emp => {
    emp.shifts.forEach(shift => allDatesSet.add(shift.date))
  })
  const allDates = Array.from(allDatesSet).sort()

  // Заголовки: "Сотрудник (Альянс, Группа)" + даты
  const headers = ['Сотрудник (Альянс / Группа)', ...allDates]
  
  // Строки данных
  const rows = employees.map(emp => {
    const row = [`${emp.name} (${emp.alliance}, ${emp.group})`]
    
    allDates.forEach(date => {
      const shift = emp.shifts.find(s => s.date === date)
      if (shift) {
        if (shift.startTime === 'Выходной') {
          row.push('Выходной')
        } else {
          row.push(`${shift.startTime}-${shift.endTime}`)
        }
      } else {
        row.push('—')
      }
    })
    
    return row
  })

  // Формируем CSV
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  // Скачивание файла
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' }) // BOM для UTF-8
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `schedule_export_${new Date().toISOString().slice(0,10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.export-btn {
  background-color: #0f9d58;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  margin: 10px 0;
}
.export-btn:hover {
  background-color: #0b8043;
}
</style>