import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    // Proxy API calls to the backend so the browser sees same-origin
    // requests in dev (avoids CORS without changing backend files).
    proxy: {
      '/jobs': 'http://localhost:8000',
    },
  },
})
