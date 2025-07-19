import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    } else {
      console.log('User dismissed the install prompt')
    }

    // Clear the deferredPrompt so it can't be called again
    setDeferredPrompt(null)
    setShowInstallPrompt(false)
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
  }

  if (!showInstallPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 rounded-lg bg-blue-600 p-4 text-white shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-semibold">Install Magic Counter</h3>
          <p className="text-sm opacity-90">Add to home screen for the best experience</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleDismiss} className="rounded px-3 py-1 text-sm opacity-75 hover:opacity-100">
            Later
          </button>
          <button
            onClick={handleInstallClick}
            className="rounded bg-white px-3 py-1 text-sm font-semibold text-blue-600 hover:bg-gray-100"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  )
}
