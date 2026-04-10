<template>
    <div class="container">
        <div class="main-content">
            <SelectionForm v-model="selectedEmployeeData" />
            
            <ScheduleForm :selected-employee="selectedEmployeeData" />
            
            <EmployeesTable @show-details="showEmployeeDetails" />
        </div>
        
        <SummaryPanel />
        
        <div v-if="errorMessage" class="error">
            {{ errorMessage }}
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
import SelectionForm from './components/SelectionForm.vue'
import ScheduleForm from './components/ScheduleForm.vue'
import EmployeesTable from './components/EmployeesTable.vue'
import SummaryPanel from './components/SummaryPanel.vue'
import EmployeeDetails from './components/EmployeeDetails.vue'
import DeleteModal from './components/DeleteModal.vue'
import { scheduleStore } from './store/scheduleStore.js'

export default {
    name: 'App',
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
            currentEmployeeIndex: null
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
        }
    }
}
</script>

<style scoped>
body {
    color: black !important;
    background-color: white;
}
.container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px;
    display: flex;
    gap: 20px;
}

.main-content {
    flex: 1;
}

.error {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
    max-width: 400px;
}
</style>