import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: process.env.GHPAGES === 'gosim' ? '/' : process.env.GHPAGES ? '/paris2026/' : '/',
  plugins: [vue(), tailwindcss()],
})
