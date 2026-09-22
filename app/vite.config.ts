import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // events.json must stay a real, hashed file: its url is the version the Events page caches by.
    assetsInlineLimit: (file) => (file.endsWith('.json') ? false : undefined),
  },
})
