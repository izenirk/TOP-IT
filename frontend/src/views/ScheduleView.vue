<template>
    <div class="schedule-view">
        <div class="header">
            <h1>График сотрудников</h1>
            <div class="user-info">
                <span>👤 {{ username }}</span>
                <button @click="logout" class="logout-btn">Выйти</button>
            </div>
        </div>
        
        <div class="container">
            <div class="main-content">
                <SelectionForm v-model="selectedEmployeeData" />
                <ScheduleForm :selected-employee="selectedEmployeeData" />
                <EmployeesTable @show-details="showEmployeeDetails" />
            </div>
            
            <SummaryPanel />
        </div>
        
        <EmployeeDetails 
            :visible="detailsVisible"
            :employee-index="currentEmployeeIndex"
            @close="closeEmployeeDetails"
        />
        
        <DeleteModal
            :visible="modalVisible"
            :message="modalMessage"
            :on-confirm="modalConfirmCallback"
            @close="closeModal"
        />
    </div>
</template>

<script>
import SelectionForm from '../components/SelectionForm.vue'
import ScheduleForm from '../components/ScheduleForm.vue'
import EmployeesTable from '../components/EmployeesTable.vue'
import SummaryPanel from '../components/SummaryPanel.vue'
import EmployeeDetails from '../components/EmployeeDetails.vue'
import DeleteModal from '../components/DeleteModal.vue'
import { scheduleStore } from '../store/scheduleStore.js'

export default {
    name: 'ScheduleView',
    components: {
        SelectionForm,
        ScheduleForm,
        EmployeesTable,
        SummaryPanel,
        EmployeeDetails,
        DeleteModal
    },
    data() {
        return {
            selectedEmployeeData: null,
            detailsVisible: false,
            currentEmployeeIndex: null,
            username: ''
        }
    },
    computed: {
        errorMessage() {
            return scheduleStore.state.errorMessage;
        },
        modalVisible() {
            return scheduleStore.state.modalVisible;
        },
        modalMessage() {
            return scheduleStore.state.modalMessage;
        },
        modalConfirmCallback() {
            return scheduleStore.state.modalCallback;
        }
    },
    mounted() {
        // Проверяем авторизацию
        const isLoggedIn = localStorage.getItem('isLoggedIn')
        if (!isLoggedIn) {
            this.$router.push('/')
        }
        this.username = localStorage.getItem('username') || 'Пользователь'
    },
    methods: {
        showEmployeeDetails(index) {
            this.currentEmployeeIndex = index;
            this.detailsVisible = true;
        },
        closeEmployeeDetails() {
            this.detailsVisible = false;
            this.currentEmployeeIndex = null;
        },
        closeModal() {
            scheduleStore.hideModal();
        },
        logout() {
            localStorage.removeItem('isLoggedIn')
            localStorage.removeItem('username')
            this.$router.push('/')
        }
    }
}
</script>

<style scoped>
.schedule-view {
    min-height: 100vh;
    background-color: #f5f5f5;
}

.header {
    background: white;
    padding: 15px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    margin-bottom: 20px;
}

.header h1 {
    margin: 0;
    font-size: 1.5rem;
    color: #333;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 15px;
}

.logout-btn {
    padding: 5px 15px;
    background-color: #f44336;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

.logout-btn:hover {
    background-color: #d32f2f;
}

.container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    gap: 20px;
}

.main-content {
    flex: 1;
}

@media (max-width: 768px) {
    .container {
        flex-direction: column;
    }
    
    .header {
        flex-direction: column;
        gap: 10px;
    }
}
</style>