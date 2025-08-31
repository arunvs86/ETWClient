// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import tailwind from '@tailwindcss/vite'
// import { fileURLToPath, URL } from 'node:url';

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react(), tailwind()],
//   resolve: {
//     alias: {
//       '@': fileURLToPath(new URL('./src', import.meta.url)),
//     },
//   },
// })


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import tailwind from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwind()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})

