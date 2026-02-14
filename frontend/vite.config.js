import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: './', // Required for Electron relative paths
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // Spring Boot Backend
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
