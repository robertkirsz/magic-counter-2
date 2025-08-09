import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    basicSsl({
      name: 'magic-counter-2',
      domains: ['localhost', '127.0.0.1']
    }),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.scryfall\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'scryfall-api',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              }
            }
          }
        ]
      },
      manifest: {
        name: 'Magic Counter 2',
        short_name: 'Magic Counter 2',
        description: 'A Magic: The Gathering life counter and game tracker',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'fullscreen',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/web-app-manifest-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/web-app-manifest-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split heavy charting libs
          charting: ['chart.js', 'react-chartjs-2'],
          // React and runtime
          react: ['react', 'react-dom'],
          // date lib
          luxon: ['luxon'],
          // dnd kit
          dnd: ['@dnd-kit/core', '@dnd-kit/sortable'],
          // icons
          lucide: ['lucide-react']
        }
      }
    }
  },
  server: {
    host: true
  }
})
