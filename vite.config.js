import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig({
  base: '/sutra/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        admin: resolve(import.meta.dirname, 'admin/index.html'),
        dashboard: resolve(import.meta.dirname, 'admin/dashboard.html'),
        resetPassword: resolve(import.meta.dirname, 'admin/reset-password.html'),
        service: resolve(import.meta.dirname, 'service.html'),
        project: resolve(import.meta.dirname, 'project.html')
      }
    }
  }
})
