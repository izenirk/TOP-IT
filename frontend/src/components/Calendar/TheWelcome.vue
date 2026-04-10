<script setup>
import WelcomeItem from './WelcomeItem.vue'
import DocumentationIcon from './icons/IconDocumentation.vue'
import ToolingIcon from './icons/IconTooling.vue'
import EcosystemIcon from './icons/IconEcosystem.vue'
import CommunityIcon from './icons/IconCommunity.vue'
import SupportIcon from './icons/IconSupport.vue'

const openReadmeInEditor = () => fetch('/__open-in-editor?file=README.md')
</script>

<template>
  <div class="welcome-grid">
    <WelcomeItem>
      <template #icon>
        <DocumentationIcon />
      </template>
      <template #heading>Documentation</template>
  
      Vue’s
      <a href="https://vuejs.org/" target="_blank" rel="noopener">official documentation</a>
      provides you with all information you need to get started.
    </WelcomeItem>
  
    <WelcomeItem>
      <template #icon>
        <ToolingIcon />
      </template>
      <template #heading>Tooling</template>
  
      This project is served and bundled with
      <a href="https://vite.dev/guide/features.html" target="_blank" rel="noopener">Vite</a>. The
      recommended IDE setup is
      <a href="https://code.visualstudio.com/" target="_blank" rel="noopener">VSCode</a>
      +
      <a href="https://github.com/vuejs/language-tools" target="_blank" rel="noopener"
        >Vue - Official</a
      >. If you need to test your components and web pages, check out
      <a href="https://vitest.dev/" target="_blank" rel="noopener">Vitest</a>
      and
      <a href="https://www.cypress.io/" target="_blank" rel="noopener">Cypress</a>
      /
      <a href="https://playwright.dev/" target="_blank" rel="noopener">Playwright</a>.
  
      <br />
  
      More instructions are available in
      <a href="javascript:void(0)" @click="openReadmeInEditor"><code>README.md</code></a
      >.
    </WelcomeItem>
  
    <WelcomeItem>
      <template #icon>
        <EcosystemIcon />
      </template>
      <template #heading>Ecosystem</template>
  
      Get official tools and libraries for your project:
      <a href="https://pinia.vuejs.org/" target="_blank" rel="noopener">Pinia</a>,
      <a href="https://router.vuejs.org/" target="_blank" rel="noopener">Vue Router</a>,
      <a href="https://test-utils.vuejs.org/" target="_blank" rel="noopener">Vue Test Utils</a>, and
      <a href="https://github.com/vuejs/devtools" target="_blank" rel="noopener">Vue Dev Tools</a>. If
      you need more resources, we suggest paying
      <a href="https://github.com/vuejs/awesome-vue" target="_blank" rel="noopener">Awesome Vue</a>
      a visit.
    </WelcomeItem>
  
    <WelcomeItem>
      <template #icon>
        <CommunityIcon />
      </template>
      <template #heading>Community</template>
  
      Got stuck? Ask your question on
      <a href="https://chat.vuejs.org" target="_blank" rel="noopener">Vue Land</a>
      (our official Discord server), or
      <a href="https://stackoverflow.com/questions/tagged/vue.js" target="_blank" rel="noopener"
        >StackOverflow</a
      >. You should also follow the official
      <a href="https://bsky.app/profile/vuejs.org" target="_blank" rel="noopener">@vuejs.org</a>
      Bluesky account or the
      <a href="https://x.com/vuejs" target="_blank" rel="noopener">@vuejs</a>
      X account for latest news in the Vue world.
    </WelcomeItem>
  
    <WelcomeItem>
      <template #icon>
        <SupportIcon />
      </template>
      <template #heading>Support Vue</template>
  
      As an independent project, Vue relies on community backing for its sustainability. You can help
      us by
      <a href="https://vuejs.org/sponsor/" target="_blank" rel="noopener">becoming a sponsor</a>.
    </WelcomeItem>
  </div>
</template>

<style scoped>
/* CSS Variables для светлой и тёмной темы */
.welcome-grid {
  --grid-bg: #ffffff;
  --grid-gap: 1.5rem;
  --card-bg: #f8fafc;
  --card-border: #e2e8f0;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --link-color: #3b82f6;
  --link-hover: #2563eb;
  --code-bg: #f1f5f9;
  --code-text: #0f172a;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

@media (prefers-color-scheme: dark) {
  .welcome-grid {
    --grid-bg: #0f172a;
    --card-bg: #1e293b;
    --card-border: #334155;
    --text-primary: #f1f5f9;
    --text-secondary: #94a3b8;
    --link-color: #60a5fa;
    --link-hover: #93c5fd;
    --code-bg: #334155;
    --code-text: #e2e8f0;
  }
}

.welcome-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--grid-gap);
  padding: 2rem;
  background: var(--grid-bg);
  max-width: 1400px;
  margin: 0 auto;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Адаптация под разные экраны */
@media (max-width: 768px) {
  .welcome-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }
}

@media (min-width: 1024px) {
  .welcome-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
    padding: 2.5rem;
  }
}

@media (min-width: 1280px) {
  .welcome-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Стили для всех ссылок внутри грида */
.welcome-grid :deep(a) {
  color: var(--link-color);
  text-decoration: none;
  transition: all 0.2s ease;
  position: relative;
  font-weight: 500;
}

.welcome-grid :deep(a:hover) {
  color: var(--link-hover);
  text-decoration: underline;
  text-underline-offset: 2px;
}

/* Стили для кода */
.welcome-grid :deep(code) {
  background: var(--code-bg);
  color: var(--code-text);
  padding: 0.2rem 0.4rem;
  border-radius: 6px;
  font-size: 0.875em;
  font-family: 'SF Mono', 'Monaco', 'Cascadia Code', monospace;
  transition: all 0.2s ease;
}

.welcome-grid :deep(code:hover) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

/* Анимация для элементов WelcomeItem при появлении */
.welcome-grid :deep(.welcome-item) {
  animation: slideUp 0.4s ease backwards;
  animation-delay: calc(var(--item-index, 0) * 0.05s);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Добавляем отступы для текста */
.welcome-grid :deep(p) {
  margin: 0.75rem 0;
  line-height: 1.6;
  color: var(--text-secondary);
}

/* Стили для заголовков внутри WelcomeItem */
.welcome-grid :deep(h3) {
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

/* Эффект наведения на карточки */
.welcome-grid :deep(.welcome-item) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: default;
}

.welcome-grid :deep(.welcome-item:hover) {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

/* Стили для иконок */
.welcome-grid :deep(svg) {
  transition: transform 0.2s ease;
}

.welcome-grid :deep(.welcome-item:hover svg) {
  transform: scale(1.05);
}

/* Разделитель между секциями */
.welcome-grid :deep(.welcome-item:not(:last-child)) {
  border-bottom: none;
}

/* Стили для мобильных устройств */
@media (max-width: 640px) {
  .welcome-grid {
    gap: 0.875rem;
    padding: 0.875rem;
  }
  
  .welcome-grid :deep(.welcome-item) {
    padding: 1rem;
  }
  
  .welcome-grid :deep(h3) {
    font-size: 1.125rem;
  }
}

/* Стили для печати */
@media print {
  .welcome-grid {
    display: block;
    padding: 0;
    background: white;
  }
  
  .welcome-grid :deep(.welcome-item) {
    break-inside: avoid;
    page-break-inside: avoid;
    box-shadow: none;
    border: 1px solid #ccc;
    margin-bottom: 1rem;
  }
  
  .welcome-grid :deep(a) {
    text-decoration: underline;
    color: black;
  }
}

/* Фокус для доступности */
.welcome-grid :deep(a:focus-visible) {
  outline: 2px solid var(--link-color);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Плавный скролл для всей страницы */
html {
  scroll-behavior: smooth;
}

/* Кастомный скроллбар для WebKit */
.welcome-grid::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.welcome-grid::-webkit-scrollbar-track {
  background: var(--card-border);
  border-radius: 4px;
}

.welcome-grid::-webkit-scrollbar-thumb {
  background: var(--link-color);
  border-radius: 4px;
}

.welcome-grid::-webkit-scrollbar-thumb:hover {
  background: var(--link-hover);
}
</style>