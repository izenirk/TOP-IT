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
        }
        // Тестовые данные не загружаются
    }
    
    saveToLocalStorage() {
        localStorage.setItem('employees', JSON.stringify(this.state.employees));
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
            const newId = this.state.employees.length > 0 
                ? Math.max(...this.state.employees.map(e => e.id || 0)) + 1 
                : 1;
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