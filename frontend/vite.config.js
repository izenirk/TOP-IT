import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/theme.scss";`
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})