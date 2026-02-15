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
      // We manually register the SW in src/main.tsx (virtual:pwa-register)
      // so we can later surface a toast/UI for updates.
      injectRegister: null,
      registerType: 'autoUpdate',
      manifestFilename: 'site.webmanifest',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,webmanifest}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            // Cache Scryfall API responses (card data)
            urlPattern: /^https:\/\/api\.scryfall\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'scryfall-api',
              cacheableResponse: {
                statuses: [0, 200]
              },
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              }
            }
          },
          {
            // Optional: cache Scryfall-hosted images for offline browsing.
            // Keep this bounded so it doesn't grow forever.
            urlPattern: /^https:\/\/(cards\.scryfall\.io|c1\.scryfall\.com|c2\.scryfall\.com|c3\.scryfall\.com)\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'scryfall-images',
              cacheableResponse: {
                statuses: [0, 200]
              },
              expiration: {
                maxEntries: 150,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
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
