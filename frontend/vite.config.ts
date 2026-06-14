import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/__tests__/setup.ts',
    include: ['src/__tests__/**/*.test.{ts,tsx}'],
    exclude: ['e2e/**', 'node_modules/**'],
  },
})
