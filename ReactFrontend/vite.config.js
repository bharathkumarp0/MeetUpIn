import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy API calls to Spring Boot so CORS is not an issue during dev
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/activities': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/joinrequests': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
