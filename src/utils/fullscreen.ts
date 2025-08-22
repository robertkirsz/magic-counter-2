/**
 * Fullscreen utility functions for the Magic Counter app
 */

// Browser-specific fullscreen interfaces
interface WebkitDocumentElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void>
  msRequestFullscreen?: () => Promise<void>
}

interface WebkitDocument extends Document {
  webkitExitFullscreen?: () => Promise<void>
  msExitFullscreen?: () => Promise<void>
}

/**
 * Enters fullscreen mode for the document element
 */
export const enterFullscreen = async (): Promise<void> => {
  try {
    if (document.fullscreenElement) {
      // Already in fullscreen
      return
    }

    await document.documentElement.requestFullscreen()
  } catch (error) {
    console.error('Failed to enter fullscreen:', error)
    // Fallback for older browsers
    const docEl = document.documentElement as WebkitDocumentElement
    if (docEl.webkitRequestFullscreen) {
      docEl.webkitRequestFullscreen()
    } else if (docEl.msRequestFullscreen) {
      docEl.msRequestFullscreen()
    }
  }
}

/**
 * Exits fullscreen mode
 */
export const exitFullscreen = async (): Promise<void> => {
  try {
    if (!document.fullscreenElement) {
      // Not in fullscreen
      return
    }

    await document.exitFullscreen()
  } catch (error) {
    console.error('Failed to exit fullscreen:', error)
    // Fallback for older browsers
    const doc = document as WebkitDocument
    if (doc.webkitExitFullscreen) {
      doc.webkitExitFullscreen()
    } else if (doc.msExitFullscreen) {
      doc.msExitFullscreen()
    }
  }
}

/**
 * Toggles fullscreen mode
 */
export const toggleFullscreen = async (): Promise<void> => {
  if (document.fullscreenElement) {
    await exitFullscreen()
  } else {
    await enterFullscreen()
  }
}

/**
 * Checks if the document is currently in fullscreen mode
 */
export const isFullscreen = (): boolean => {
  return !!document.fullscreenElement
}

/**
 * Gets the fullscreen element (if any)
 */
export const getFullscreenElement = (): Element | null => {
  return document.fullscreenElement
}
