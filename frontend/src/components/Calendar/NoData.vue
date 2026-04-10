<template>
  <div class="no-data">
    <div class="no-data-icon">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 12H15M12 9V15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" opacity="0.3"/>
      </svg>
    </div>
    <h3 class="no-data-title">Нет данных для отображения</h3>
    <p class="no-data-message">Добавьте сотрудников и смены, чтобы увидеть график</p>
  </div>
</template>

<script>
export default {
  name: 'NoData'
}
</script>

<style scoped>
/* CSS Variables для светлой и тёмной темы */
.no-data {
  --no-data-bg: rgba(255, 255, 255, 0.5);
  --no-data-icon: #94a3b8;
  --no-data-title: #475569;
  --no-data-message: #94a3b8;
  --no-data-border: #e2e8f0;
}

@media (prefers-color-scheme: dark) {
  .no-data {
    --no-data-bg: rgba(30, 41, 59, 0.5);
    --no-data-icon: #64748b;
    --no-data-title: #94a3b8;
    --no-data-message: #64748b;
    --no-data-border: #334155;
  }
}

.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 48px 32px;
  background: var(--no-data-bg);
  border-radius: 20px;
  border: 1px dashed var(--no-data-border);
  backdrop-filter: blur(4px);
  transition: all 0.3s ease;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
}

.no-data-icon {
  margin-bottom: 20px;
  animation: gentleFloat 3s ease-in-out infinite;
}

.no-data-icon svg {
  width: 72px;
  height: 72px;
  color: var(--no-data-icon);
}

.no-data-title {
  margin: 0 0 8px 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--no-data-title);
  letter-spacing: -0.01em;
}

.no-data-message {
  margin: 0;
  font-size: 0.9rem;
  color: var(--no-data-message);
}

/* Анимация плавания */
@keyframes gentleFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

/* Hover эффект */
.no-data:hover {
  border-color: var(--no-data-icon);
  background: var(--no-data-bg);
  transform: scale(1.01);
}

/* Адаптивность */
@media (max-width: 768px) {
  .no-data {
    padding: 36px 24px;
    border-radius: 16px;
  }
  
  .no-data-icon svg {
    width: 56px;
    height: 56px;
  }
  
  .no-data-title {
    font-size: 1rem;
  }
  
  .no-data-message {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .no-data {
    padding: 28px 20px;
    border-radius: 14px;
  }
  
  .no-data-icon svg {
    width: 48px;
    height: 48px;
  }
  
  .no-data-title {
    font-size: 0.9rem;
  }
  
  .no-data-message {
    font-size: 0.75rem;
  }
}
</style>