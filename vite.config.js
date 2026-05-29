import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: './',
  plugins: [vue()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        protection: resolve(__dirname, 'protection.html'),
        structure: resolve(__dirname, 'structure.html'),
        materials: resolve(__dirname, 'materials.html'),
        spatial: resolve(__dirname, 'spatial.html'),
        history: resolve(__dirname, 'history.html')
      }
    }
  }
})
