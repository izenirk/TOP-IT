import { reactive } from 'vue'

class ScheduleStore {
    constructor() {
        this.state = reactive({
            employees: [],
            selectedAlliance: '',
            selectedGroup: '',
            selectedEmployee: null,
            showEmployeeDetails: false,
            currentEmployeeIndex: null,
            errorMessage: '',
            modalVisible: false,
            modalMessage: '',
            modalCallback: null
        });
        
        this.loadFromLocalStorage();
    }
    
    get employees() {
        return this.state.employees;
    }
    
    loadFromLocalStorage() {
        const saved = localStorage.getItem('employees');
        if (saved) {
            this.state.employees = JSON.parse(saved);
        } else {
            // Загружаем тестовые данные, если нет сохраненных
            this.loadTestData();
        }
    }
    
    saveToLocalStorage() {
        localStorage.setItem('employees', JSON.stringify(this.state.employees));
    }
    
    loadTestData() {
        this.state.employees = [
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
                    { date: '2026-04-10', startTime: '09:00', endTime: '18:00' }
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
                    { date: '2026-04-05', startTime: '10:00', endTime: '19:00' }
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
                    { date: '2026-04-03', startTime: '08:00', endTime: '17:00' }
                ]
            },
            {
                id: 4,
                name: 'Кузнецов Виктор Михайлович',
                alliance: 'Тумбочкина',
                group: 'Группа Кузнецовых',
                shifts: [
                    { date: '2026-04-01', startTime: '07:00', endTime: '16:00' },
                    { date: '2026-04-02', startTime: '07:00', endTime: '16:00' }
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
                    { date: '2026-04-03', startTime: '09:00', endTime: '18:00' }
                ]
            }
        ];
        this.saveToLocalStorage();
    }
    
    addShift(employeeName, alliance, group, shift) {
        // Генерируем id для новой смены
        shift.id = Date.now();
        
        let existingEmployee = this.state.employees.find(emp => 
            emp.name === employeeName && emp.alliance === alliance && emp.group === group
        );
        
        if (existingEmployee) {
            existingEmployee.shifts.push(shift);
        } else {
            // Генерируем новый id для сотрудника
            const newId = Math.max(...this.state.employees.map(e => e.id || 0), 0) + 1;
            this.state.employees.push({
                id: newId,
                name: employeeName,
                alliance,
                group,
                shifts: [shift]
            });
        }
        
        this.saveToLocalStorage();
        this.state.errorMessage = '';
        return true;
    }
    
    deleteShift(employeeIndex, shiftIndex) {
        if (this.state.employees[employeeIndex] && this.state.employees[employeeIndex].shifts[shiftIndex]) {
            this.state.employees[employeeIndex].shifts.splice(shiftIndex, 1);
            
            if (this.state.employees[employeeIndex].shifts.length === 0) {
                this.state.employees.splice(employeeIndex, 1);
                this.state.showEmployeeDetails = false;
                this.state.currentEmployeeIndex = null;
            }
            
            this.saveToLocalStorage();
            return true;
        }
        return false;
    }
    
    deleteEmployee(employeeIndex) {
        if (this.state.employees[employeeIndex]) {
            this.state.employees.splice(employeeIndex, 1);
            this.state.showEmployeeDetails = false;
            this.state.currentEmployeeIndex = null;
            this.saveToLocalStorage();
            return true;
        }
        return false;
    }
    
    showModal(message, callback) {
        this.state.modalMessage = message;
        this.state.modalCallback = callback;
        this.state.modalVisible = true;
    }
    
    hideModal() {
        this.state.modalVisible = false;
        this.state.modalCallback = null;
    }
    
    confirmModal() {
        if (this.state.modalCallback) {
            this.state.modalCallback();
        }
        this.hideModal();
    }
    
    setError(message) {
        this.state.errorMessage = message;
    }
    
    clearError() {
        this.state.errorMessage = '';
    }
    
    get groupedEmployees() {
        const grouped = {};
        this.state.employees.forEach((emp, index) => {
            if (!grouped[emp.alliance]) grouped[emp.alliance] = {};
            if (!grouped[emp.alliance][emp.group]) grouped[emp.alliance][emp.group] = [];
            grouped[emp.alliance][emp.group].push({ ...emp, originalIndex: index });
        });
        return grouped;
    }
}

export const scheduleStore = new ScheduleStore();