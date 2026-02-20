import React, { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

const DROPDOWN_INACTIVITY_TIMEOUT_MS = 3000

interface DropdownProps {
  trigger: ReactNode
  children: ReactNode
  className?: string
  triggerClassName?: string
  placement?: 'dropdown-start' | 'dropdown-end' | 'dropdown-top' | 'dropdown-bottom'
  inactivityTimeoutMs?: number
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  children,
  className = '',
  triggerClassName = '',
  placement = 'dropdown-end',
  inactivityTimeoutMs = DROPDOWN_INACTIVITY_TIMEOUT_MS
}) => {
  const detailsRef = useRef<HTMLDetailsElement>(null)
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Handle dropdown open/close and inactivity timer
  useEffect(() => {
    const details = detailsRef.current

    if (!details) return

    const resetInactivityTimer = () => {
      // Clear existing timer
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
      }

      // Set new timer to close after inactivity timeout
      inactivityTimerRef.current = setTimeout(() => {
        if (detailsRef.current) {
          detailsRef.current.open = false
        }
      }, inactivityTimeoutMs)
    }

    const clearInactivityTimer = () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
        inactivityTimerRef.current = null
      }
    }

    const handleToggle = () => {
      if (details.open) {
        // Dropdown opened - start inactivity timer
        resetInactivityTimer()
      } else {
        // Dropdown closed - clear timer
        clearInactivityTimer()
      }
    }

    // Handle click outside to close dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (details.open && !details.contains(event.target as Node)) {
        details.open = false
        // Don't reset timer when closing via outside click
        return
      }

      // If clicking inside and dropdown is open, reset inactivity timer
      if (details.open) {
        resetInactivityTimer()
      }
    }

    // Reset timer on user activity (mouse move, keyboard)
    const handleActivity = () => {
      if (details.open) {
        resetInactivityTimer()
      }
    }

    // Listen for toggle events
    details.addEventListener('toggle', handleToggle)

    // Handle clicks (both inside and outside) - closes on outside, resets timer on inside
    document.addEventListener('mousedown', handleClickOutside)

    // Track other user interactions to reset inactivity timer
    document.addEventListener('mousemove', handleActivity)
    document.addEventListener('keydown', handleActivity)

    return () => {
      details.removeEventListener('toggle', handleToggle)
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('mousemove', handleActivity)
      document.removeEventListener('keydown', handleActivity)
      clearInactivityTimer()
    }
  }, [inactivityTimeoutMs])

  return (
    <details ref={detailsRef} className={`dropdown ${placement} ${className}`.trim()}>
      <summary className={triggerClassName || undefined}>{trigger}</summary>
      {children}
    </details>
  )
}
