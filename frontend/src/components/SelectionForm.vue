<template>
    <div class="selection-form">
        <div class="form-header">
            <h2>Выбор сотрудника</h2>
            <div class="form-step-indicator" v-if="selectedAlliance && selectedGroup && selectedEmployee">
                <span class="step-dot active"></span>
                <span class="step-line"></span>
                <span class="step-dot active"></span>
                <span class="step-line"></span>
                <span class="step-dot active"></span>
            </div>
        </div>
        
        <form @submit.prevent="handleSubmit">
            <div class="form-group">
                <label for="alliance">
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    Альянс
                </label>
                <select id="alliance" v-model="selectedAlliance" @change="onAllianceChange" required>
                    <option value="" disabled>Выберите альянс</option>
                    <option v-for="alliance in alliances" :key="alliance" :value="alliance">
                        {{ alliance }}
                    </option>
                </select>
                <div class="field-icon" v-if="selectedAlliance">
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </div>
            </div>
            
            <div class="form-group" :class="{ 'fade-in': selectedAlliance }">
                <label for="group">
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M20 7H4C2.9 7 2 7.9 2 9V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V9C22 7.9 21.1 7 20 7Z" stroke="currentColor" stroke-width="2"/>
                        <path d="M16 21V5C16 4.5 15.5 4 15 4H9C8.5 4 8 4.5 8 5V21" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    Группа
                </label>
                <select id="group" v-model="selectedGroup" @change="onGroupChange" :disabled="!selectedAlliance" required>
                    <option value="" disabled>-- Сначала выберите альянс --</option>
                    <option v-for="group in availableGroups" :key="group.name" :value="group.name">
                        {{ group.name }}
                    </option>
                </select>
            </div>
            
            <div class="form-group" :class="{ 'fade-in': selectedGroup }">
                <label for="employee">
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M20 21V19C20 16.8 18.2 15 16 15H8C5.8 15 4 16.8 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    Сотрудник
                </label>
                <select id="employee" v-model="selectedEmployee" :disabled="!selectedGroup" required>
                    <option value="" disabled>-- Сначала выберите группу --</option>
                    <option v-for="emp in availableEmployees" :key="emp" :value="emp">
                        {{ emp }}
                    </option>
                </select>
            </div>
            
            <div class="selected-preview" v-if="selectedEmployee">
                <div class="preview-card">
                    <div class="preview-icon">✅</div>
                    <div class="preview-info">
                        <div class="preview-title">Выбран сотрудник</div>
                        <div class="preview-details">
                            {{ selectedEmployee }} • {{ selectedGroup }} • {{ selectedAlliance }}
                        </div>
                    </div>
                </div>
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
/* CSS Variables для светлой и тёмной темы */
.selection-form {
    --form-bg: #ffffff;
    --form-border: #e2e8f0;
    --form-text: #0f172a;
    --form-label: #475569;
    --input-bg: #ffffff;
    --input-border: #cbd5e1;
    --input-focus: #4f46e5;
    --disabled-bg: #f1f5f9;
    --disabled-text: #94a3b8;
    --preview-bg: #f0fdf4;
    --preview-border: #bbf7d0;
    --preview-text: #166534;
    --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

@media (prefers-color-scheme: dark) {
    .selection-form {
        --form-bg: #1e293b;
        --form-border: #334155;
        --form-text: #f1f5f9;
        --form-label: #94a3b8;
        --input-bg: #334155;
        --input-border: #475569;
        --input-focus: #818cf8;
        --disabled-bg: #0f172a;
        --disabled-text: #64748b;
        --preview-bg: #064e3b;
        --preview-border: #10b981;
        --preview-text: #a7f3d0;
        --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
    }
}

.selection-form {
    background-color: var(--form-bg);
    border-radius: 24px;
    padding: 28px;
    margin-bottom: 24px;
    border: 1px solid var(--form-border);
    box-shadow: var(--shadow);
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
    transition: all 0.2s ease;
}

/* Шапка формы */
.form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 12px;
}

.form-header h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--form-text);
    letter-spacing: -0.01em;
}

/* Индикатор шагов */
.form-step-indicator {
    display: flex;
    align-items: center;
    gap: 6px;
}

.step-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: var(--input-border);
    transition: all 0.3s ease;
}

.step-dot.active {
    background-color: var(--input-focus);
    transform: scale(1.2);
}

.step-line {
    width: 20px;
    height: 2px;
    background-color: var(--input-border);
}

/* Группа полей */
.form-group {
    margin-bottom: 24px;
    position: relative;
    transition: all 0.3s ease;
}

.form-group.fade-in {
    animation: fadeInUp 0.3s ease;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(10px);
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
    padding: 12px 40px 12px 16px;
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
    background-color: var(--disabled-bg);
    color: var(--disabled-text);
    cursor: not-allowed;
    opacity: 0.7;
}

.form-group select option {
    background-color: var(--input-bg);
    color: var(--form-text);
}

/* Иконка успеха */
.field-icon {
    position: absolute;
    right: 12px;
    top: 38px;
    pointer-events: none;
}

.field-icon svg {
    width: 18px;
    height: 18px;
    color: #10b981;
}

/* Превью выбранного сотрудника */
.selected-preview {
    margin-top: 20px;
    animation: fadeInUp 0.3s ease;
}

.preview-card {
    display: flex;
    align-items: center;
    gap: 14px;
    background-color: var(--preview-bg);
    border: 1px solid var(--preview-border);
    border-radius: 20px;
    padding: 14px 18px;
}

.preview-icon {
    font-size: 1.8rem;
}

.preview-info {
    flex: 1;
}

.preview-title {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--preview-text);
    opacity: 0.7;
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.preview-details {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--preview-text);
    word-break: break-word;
}

/* Адаптивность */
@media (max-width: 640px) {
    .selection-form {
        padding: 20px;
        border-radius: 20px;
    }
    
    .form-header h2 {
        font-size: 1.3rem;
    }
    
    .form-step-indicator {
        display: none;
    }
    
    .form-group select {
        padding: 10px 36px 10px 14px;
        font-size: 0.9rem;
    }
    
    .preview-card {
        padding: 12px 14px;
    }
    
    .preview-icon {
        font-size: 1.5rem;
    }
    
    .preview-details {
        font-size: 0.8rem;
    }
}
</style>