<template>
    <div class="selection-form">
        <h2>Выбор сотрудника</h2>
        <form @submit.prevent="handleSubmit">
            <div class="form-group">
                <label for="alliance">Выберите альянс:</label>
                <select id="alliance" v-model="selectedAlliance" @change="onAllianceChange" required>
                    <option value="">-- Выберите альянс --</option>
                    <option v-for="alliance in alliances" :key="alliance" :value="alliance">
                        {{ alliance }}
                    </option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="group">Выберите группу:</label>
                <select id="group" v-model="selectedGroup" @change="onGroupChange" :disabled="!selectedAlliance" required>
                    <option value="">-- Сначала выберите альянс --</option>
                    <option v-for="group in availableGroups" :key="group.name" :value="group.name">
                        {{ group.name }}
                    </option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="employee">Выберите сотрудника:</label>
                <select id="employee" v-model="selectedEmployee" :disabled="!selectedGroup" required>
                    <option value="">-- Сначала выберите группу --</option>
                    <option v-for="emp in availableEmployees" :key="emp" :value="emp">
                        {{ emp }}
                    </option>
                </select>
            </div>
        </form>
    </div>
</template>

<script>
import { alliancesData } from '../data/alliancesData.js'

export default {
    name: 'SelectionForm',
    props: {
        modelValue: {
            type: Object,
            default: () => ({})
        }
    },
    data() {
        return {
            alliances: Object.keys(alliancesData),
            selectedAlliance: '',
            selectedGroup: '',
            selectedEmployee: ''
        }
    },
    computed: {
        availableGroups() {
            if (!this.selectedAlliance) return [];
            return alliancesData[this.selectedAlliance] || [];
        },
        availableEmployees() {
            if (!this.selectedAlliance || !this.selectedGroup) return [];
            const group = alliancesData[this.selectedAlliance].find(g => g.name === this.selectedGroup);
            return group ? group.employees : [];
        }
    },
    watch: {
        selectedEmployee(newVal) {
            if (newVal) {
                this.$emit('update:modelValue', {
                    alliance: this.selectedAlliance,
                    group: this.selectedGroup,
                    employee: newVal
                });
            }
        }
    },
    methods: {
        onAllianceChange() {
            this.selectedGroup = '';
            this.selectedEmployee = '';
            this.$emit('update:modelValue', null);
        },
        onGroupChange() {
            this.selectedEmployee = '';
            this.$emit('update:modelValue', null);
        },
        handleSubmit() {
            // Форма только для выбора, не для отправки
        }
    }
}
</script>

<style scoped>
.selection-form {
    background-color: #f9f9f9;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
    margin-bottom: 20px;
}

.selection-form h2 {
    margin-bottom: 15px;
    font-size: 1.2em;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
}

.form-group select {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
}

.form-group select:disabled {
    background-color: #eee;
    cursor: not-allowed;
}
</style>