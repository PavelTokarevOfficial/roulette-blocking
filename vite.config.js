import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import pkg from './package.json' assert { type: 'json' }

export default defineConfig({
  plugins: [vue()],
  base: '/roulette-blocking/',
  server: {
    allowedHosts: true,
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
})