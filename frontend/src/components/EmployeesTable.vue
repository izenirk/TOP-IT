<template>
  <div class="employees-table">
    <div class="table-header">
      <h2>Список графиков</h2>
      <div class="export-actions">
        <button class="export-btn csv-btn" @click="exportToCSV" title="Скачать CSV для импорта">
          📥 Скачать CSV
        </button>
        <button class="export-btn google-btn" @click="sendToGoogleSheets" title="Отправить напрямую в Google Таблицы">
          📊 Отправить в Google Таблицы
        </button>
      </div>
    </div>

    <!-- Поле для ввода ссылки на таблицу -->
    <div class="spreadsheet-url-input">
      <label for="sheetUrl">🔗 Ссылка на вашу Google Таблицу:</label>
      <input
        id="sheetUrl"
        type="text"
        v-model="customSpreadsheetUrl"
        placeholder="https://docs.google.com/spreadsheets/d/..."
        @change="saveSpreadsheetUrl"
      />
      <small>Вставьте сюда ссылку на таблицу, куда отправляются данные. Она будет показана после экспорта.</small>
    </div>

    <div v-if="employeesList.length > 0">
      <div v-for="alliance in uniqueAlliances" :key="alliance" class="alliance-section">
        <table>
          <caption><strong>{{ alliance }}</strong></caption>
          <thead>
            <tr>
              <th>Группа</th>
              <th>Сотрудник</th>
              <th>Смены</th>
              <th>Макс. подряд</th>
              <th>% в будни</th>
              <th>% в выходные</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="group in getGroupsByAlliance(alliance)" :key="group">
              <tr class="group-separator">
                <td colspan="7"><strong>{{ group }}</strong></td>
              </tr>
              <tr v-for="employee in getEmployeesByGroup(alliance, group)" :key="employee.originalIndex">
                <td></td>
                <td>{{ employee.name }}</td>
                <td class="shifts-cell">
                  {{ formatShifts(employee.shifts) }}
                </td>
                <td :class="{ warning: employee.maxConsecutive > 6 }">
                  {{ employee.maxConsecutive }}
                </td>
                <td>{{ employee.metrics.weekdayPercentage }}%</td>
                <td>{{ employee.metrics.weekendPercentage }}%</td>
                <td class="actions-cell">
                  <button class="edit-btn" @click="showDetails(employee.originalIndex)" title="Редактировать">
                    ✏️
                  </button>
                  <button class="delete-btn" @click="confirmDeleteEmployee(employee.originalIndex, employee.name)" title="Удалить сотрудника">
                    🗑️
                  </button>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
    <div v-else class="no-data">
      <p>Нет внесенных графиков.</p>
    </div>

    <!-- Модальное окно с результатом и вашей ссылкой -->
    <div v-if="showResultModal" class="modal-overlay" @click="closeResultModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>✅ Экспорт выполнен</h3>
          <button class="close-btn" @click="closeResultModal">&times;</button>
        </div>
        <div class="modal-body">
          <p>Данные успешно отправлены в Google Таблицы!</p>
          <div v-if="customSpreadsheetUrl" class="sheet-link">
            <p>Ваша таблица доступна по ссылке:</p>
            <a :href="customSpreadsheetUrl" target="_blank" class="spreadsheet-link">
              {{ customSpreadsheetUrl }}
            </a>
            <div class="modal-actions">
              <button class="action-btn primary" @click="openCustomSpreadsheet">
                📂 Открыть таблицу
              </button>
              <button class="action-btn secondary" @click="closeResultModal">
                Закрыть
              </button>
            </div>
          </div>
          <div v-else class="modal-actions">
            <p><a href="https://docs.google.com/spreadsheets/d/1y3N8UTLihi0OVvBZdxgoTZp_fbvoq1iSjf2_drBgMqE/edit?hl=ru&gid=0#gid=0">Просмотр таблицы</a>.</p>
            <button class="action-btn secondary" @click="closeResultModal">
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { calculateEmployeeMetrics, calculateMaxConsecutiveShifts } from '../utils/helpers.js'
import { scheduleStore } from '../store/scheduleStore.js'

export default {
  name: 'EmployeesTable',
  data() {
    return {
      googleScriptUrl: 'https://script.google.com/macros/s/AKfycbx5w_1G0msz-T6XYbBLeePUaHTFBsLyYAgJLL2x1Lyh4thaDDu5mPfWkbY3MIsriF35Og/exec',
      
      // Пользовательская ссылка на таблицу (вводится вручную)
      customSpreadsheetUrl: localStorage.getItem('customSpreadsheetUrl') || '',
      
      // Состояние модального окна
      showResultModal: false,
      isExporting: false
    }
  },
  computed: {
    employeesList() {
      const list = [];
      scheduleStore.employees.forEach((emp, index) => {
        const metrics = calculateEmployeeMetrics(emp);
        const maxConsecutive = calculateMaxConsecutiveShifts(emp);
        
        list.push({
          ...emp,
          originalIndex: index,
          metrics,
          maxConsecutive
        });
      });
      return list;
    },
    
    uniqueAlliances() {
      return [...new Set(this.employeesList.map(emp => emp.alliance))];
    }
  },
  methods: {
    getGroupsByAlliance(alliance) {
      const groups = this.employeesList
        .filter(emp => emp.alliance === alliance)
        .map(emp => emp.group);
      return [...new Set(groups)];
    },
    
    getEmployeesByGroup(alliance, group) {
      return this.employeesList.filter(emp => emp.alliance === alliance && emp.group === group);
    },
    
    formatShifts(shifts) {
      if (!shifts || shifts.length === 0) return 'Нет смен';
      return shifts.map(s => 
        `${s.date} (${s.startTime}${s.endTime ? '-' + s.endTime : ''})`
      ).join('; ');
    },
    
    showDetails(index) {
      this.$emit('show-details', index);
    },
    
    confirmDeleteEmployee(index, name) {
      scheduleStore.showModal(
        `Удалить сотрудника ${name} и все его смены?`,
        () => scheduleStore.deleteEmployee(index)
      );
    },

    // Сохраняем ссылку в localStorage при изменении
    saveSpreadsheetUrl() {
      localStorage.setItem('customSpreadsheetUrl', this.customSpreadsheetUrl);
    },

    // Экспорт в CSV
    exportToCSV() {
      // ... без изменений
      const employees = scheduleStore.employees;
      if (!employees.length) {
        alert('Нет данных для экспорта');
        return;
      }

      const allDatesSet = new Set();
      employees.forEach(emp => {
        emp.shifts.forEach(shift => allDatesSet.add(shift.date));
      });
      const allDates = Array.from(allDatesSet).sort();

      const headers = ['Сотрудник (Альянс / Группа)', ...allDates];
      
      const rows = employees.map(emp => {
        const row = [`${emp.name} (${emp.alliance}, ${emp.group})`];
        
        allDates.forEach(date => {
          const shift = emp.shifts.find(s => s.date === date);
          if (shift) {
            if (shift.startTime === 'Выходной') {
              row.push('Выходной');
            } else {
              row.push(`${shift.startTime}-${shift.endTime}`);
            }
          } else {
            row.push('—');
          }
        });
        
        return row;
      });

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `schedule_export_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },

    // Отправка в Google Таблицы
    sendToGoogleSheets() {
      const employees = scheduleStore.employees;
      if (!employees.length) {
        alert('Нет данных для отправки');
        return;
      }

      this.isExporting = true;
      const dataToSend = { employees };

      fetch(this.googleScriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend)
      })
      .then(() => {
        // Показываем модальное окно с нашей ссылкой
        this.showResultModal = true;
      })
      .catch(error => {
        console.error('Ошибка при отправке:', error);
        alert('❌ Ошибка при отправке данных. Проверьте консоль.');
      })
      .finally(() => {
        this.isExporting = false;
      });
    },

    closeResultModal() {
      this.showResultModal = false;
    },

    openCustomSpreadsheet() {
      if (this.customSpreadsheetUrl) {
        window.open(this.customSpreadsheetUrl, '_blank');
      }
      this.closeResultModal();
    }
  }
}
</script>

<style scoped>
/* Новые стили для поля ввода ссылки */
.spreadsheet-url-input {
  margin: 15px 0;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #dee2e6;
}

.spreadsheet-url-input label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #495057;
}

.spreadsheet-url-input input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 5px;
}

.spreadsheet-url-input small {
  color: #6c757d;
  font-size: 12px;
}

/* Остальные стили (без изменений) */
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.table-header h2 {
  margin: 0;
  color: #333;
}

.export-actions {
  display: flex;
  gap: 10px;
}

.export-btn {
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.csv-btn {
  background-color: #f1c40f;
  color: #333;
}

.csv-btn:hover {
  background-color: #d4ac0d;
}

.google-btn {
  background-color: #0f9d58;
  color: white;
}

.google-btn:hover {
  background-color: #0b8043;
}

.employees-table {
  margin-top: 20px;
}

.alliance-section {
  margin-bottom: 30px;
}

table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

caption {
  text-align: left;
  font-size: 1.1em;
  margin-bottom: 10px;
  padding: 10px;
  background-color: #f2f2f2;
  border-radius: 4px;
  font-weight: bold;
}

th, td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: left;
}

th {
  background-color: #f2f2f2;
  font-weight: bold;
}

.group-separator {
  background-color: #f9f9f9;
}

.group-separator td {
  padding: 8px 10px;
  background-color: #e9ecef;
}

.shifts-cell {
  max-width: 300px;
  word-wrap: break-word;
  font-size: 0.9em;
}

.actions-cell {
  white-space: nowrap;
}

.edit-btn, .delete-btn {
  padding: 5px 10px;
  margin: 0 2px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.edit-btn {
  background-color: #4CAF50;
  color: white;
}

.edit-btn:hover {
  background-color: #45a049;
  transform: translateY(-1px);
}

.delete-btn {
  background-color: #f44336;
  color: white;
}

.delete-btn:hover {
  background-color: #da190b;
  transform: translateY(-1px);
}

.warning {
  color: #ff9800;
  font-weight: bold;
}

.no-data {
  text-align: center;
  padding: 40px;
  background-color: white;
  border-radius: 4px;
  color: #666;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

/* Модальное окно */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 20px;
}

.sheet-link {
  margin-top: 15px;
}

.spreadsheet-link {
  display: block;
  word-break: break-all;
  color: #1a73e8;
  text-decoration: none;
  margin: 10px 0;
  padding: 8px;
  background-color: #f1f3f4;
  border-radius: 4px;
}

.spreadsheet-link:hover {
  text-decoration: underline;
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  justify-content: flex-end;
}

.action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.action-btn.primary {
  background-color: #1a73e8;
  color: white;
}

.action-btn.primary:hover {
  background-color: #1557b0;
}

.action-btn.secondary {
  background-color: #e0e0e0;
  color: #333;
}

.action-btn.secondary:hover {
  background-color: #ccc;
}
</style>