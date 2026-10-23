import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Las rutas de la API llevan el prefijo /api: se reenvían al backend (Spring Boot)
    proxy: { '/api': 'http://localhost:8080' },
  },
})