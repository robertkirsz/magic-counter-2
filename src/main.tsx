// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { registerSW } from 'virtual:pwa-register'

import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'

// PWA: register service worker (offline support + update notifications)
registerSW({
  immediate: true,
  onOfflineReady() {
    console.info('[PWA] App is ready to work offline')
  },
  onNeedRefresh() {
    console.info('[PWA] Update available (refresh to load)')
  },
  onRegisterError(error) {
    console.warn('[PWA] Service worker registration error', error)
  }
})

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
  // </StrictMode>
)
