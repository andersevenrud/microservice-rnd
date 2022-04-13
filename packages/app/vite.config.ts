import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '',
  server: {
    host: true,
    port: 8080,
    strictPort: true,
    hmr: {
      port: 8080,
    }
  }
})
