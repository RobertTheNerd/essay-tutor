import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        configure: () => {
          // For development, we'll create a simple Express server to handle API routes
          console.log('API proxy configured - run backend server on port 3000')
        }
      }
    }
  }
})
