import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    basicSsl({
      name: 'magic-counter-2',
      domains: ['localhost', '127.0.0.1']
    })
  ],
  server: {
    host: true
  }
})
