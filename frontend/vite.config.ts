import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-motion": ["framer-motion"],
          // lucide-react v1 does not tree-shake cleanly under Vite — putting it
          // in a dedicated vendor chunk keeps individual page chunks tiny and
          // lets the browser cache the icon library across navigations.
          "vendor-icons": ["lucide-react"],
        },
      },
    },
  },
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://api:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/jobs': 'http://api:8000',
      '/ai/classify': 'http://api:8000',
    },
  },
})
