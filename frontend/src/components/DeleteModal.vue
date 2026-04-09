<template>
    <transition name="modal-fade">
        <div v-if="visible" class="modal" @click.self="close">
            <div class="modal-content">
                <button class="close" @click="close" aria-label="Закрыть">×</button>
                <div class="modal-icon">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 8V12M12 16H12.01M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </div>
                <h3>Подтверждение удаления</h3>
                <p>{{ message }}</p>
                <div class="modal-buttons">
                    <button class="cancel-btn" @click="close">Отмена</button>
                    <button class="confirm-btn" @click="confirm">Удалить</button>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
export default {
    name: 'DeleteModal',
    props: {
        visible: Boolean,
        message: String,
        onConfirm: Function
    },
    methods: {
        close() {
            this.$emit('close');
        },
        confirm() {
            if (this.onConfirm) {
                this.onConfirm();
            }
            this.close();
        }
    }
}
</script>

<style scoped>
/* CSS Variables для светлой и тёмной темы */
.modal {
    --modal-bg: #ffffff;
    --modal-text: #1e293b;
    --modal-text-secondary: #475569;
    --modal-border: #e2e8f0;
    --modal-overlay: rgba(0, 0, 0, 0.5);
    --cancel-bg: #f1f5f9;
    --cancel-hover: #e2e8f0;
    --cancel-text: #334155;
    --confirm-bg: #ef4444;
    --confirm-hover: #dc2626;
    --confirm-text: #ffffff;
    --icon-stroke: #ef4444;
    --shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

@media (prefers-color-scheme: dark) {
    .modal {
        --modal-bg: #1e293b;
        --modal-text: #f1f5f9;
        --modal-text-secondary: #94a3b8;
        --modal-border: #334155;
        --modal-overlay: rgba(0, 0, 0, 0.7);
        --cancel-bg: #334155;
        --cancel-hover: #475569;
        --cancel-text: #e2e8f0;
        --confirm-bg: #f97316;
        --confirm-hover: #ea580c;
        --confirm-text: #ffffff;
        --icon-stroke: #f97316;
        --shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
}

/* Анимация появления */
.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}

.modal-fade-enter-active .modal-content,
.modal-fade-leave-active .modal-content {
    transition: transform 0.2s ease, opacity 0.2s ease;
}

.modal-fade-enter-from .modal-content,
.modal-fade-leave-to .modal-content {
    transform: scale(0.95);
    opacity: 0;
}

/* Оверлей */
.modal {
    position: fixed;
    z-index: 2000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: var(--modal-overlay);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
}

/* Карточка модалки */
.modal-content {
    background-color: var(--modal-bg);
    padding: 32px 28px 28px 28px;
    width: 420px;
    max-width: calc(100% - 32px);
    border-radius: 24px;
    position: relative;
    text-align: center;
    box-shadow: var(--shadow);
    border: 1px solid var(--modal-border);
    transition: all 0.2s ease;
}

/* Кнопка закрытия (крестик) */
.close {
    position: absolute;
    top: 16px;
    right: 20px;
    background: none;
    border: none;
    font-size: 28px;
    font-weight: 400;
    line-height: 1;
    cursor: pointer;
    color: var(--modal-text-secondary);
    padding: 4px 8px;
    border-radius: 12px;
    transition: all 0.2s ease;
    font-family: monospace;
}

.close:hover {
    color: var(--modal-text);
    background-color: var(--cancel-bg);
    transform: scale(1.05);
}

/* Иконка предупреждения */
.modal-icon {
    margin-bottom: 20px;
    display: flex;
    justify-content: center;
}

.modal-icon svg {
    width: 56px;
    height: 56px;
    stroke: var(--icon-stroke);
    stroke-width: 1.8;
}

/* Заголовок */
.modal-content h3 {
    margin: 0 0 12px 0;
    font-size: 1.6rem;
    font-weight: 600;
    color: var(--modal-text);
    letter-spacing: -0.01em;
}

/* Текст сообщения */
.modal-content p {
    margin: 0 0 28px 0;
    font-size: 1rem;
    line-height: 1.5;
    color: var(--modal-text-secondary);
}

/* Контейнер кнопок */
.modal-buttons {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
}

/* Базовые стили кнопок */
.modal-buttons button {
    padding: 10px 24px;
    border: none;
    border-radius: 40px;
    cursor: pointer;
    font-size: 0.95rem;
    font-weight: 500;
    font-family: inherit;
    transition: all 0.2s ease;
    min-width: 110px;
}

/* Кнопка "Отмена" */
.cancel-btn {
    background-color: var(--cancel-bg);
    color: var(--cancel-text);
}

.cancel-btn:hover {
    background-color: var(--cancel-hover);
    transform: translateY(-2px);
}

.cancel-btn:active {
    transform: translateY(0);
}

/* Кнопка "Удалить" */
.confirm-btn {
    background-color: var(--confirm-bg);
    color: var(--confirm-text);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
}

.confirm-btn:hover {
    background-color: var(--confirm-hover);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(239, 68, 68, 0.35);
}

.confirm-btn:active {
    transform: translateY(0);
}

/* Адаптивность для маленьких экранов */
@media (max-width: 480px) {
    .modal-content {
        padding: 24px 20px 20px 20px;
        border-radius: 20px;
    }

    .modal-content h3 {
        font-size: 1.4rem;
    }

    .modal-buttons button {
        padding: 8px 20px;
        min-width: 90px;
        font-size: 0.9rem;
    }

    .modal-icon svg {
        width: 48px;
        height: 48px;
    }

    .close {
        top: 12px;
        right: 14px;
        font-size: 26px;
    }
}
</style>