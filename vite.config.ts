// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Konfigurasi Vite untuk React + Tailwind v3 (tanpa @tailwindcss/vite)
export default defineConfig({
  plugins: [react()],
})
