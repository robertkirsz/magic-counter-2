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

    // Reset timer on user activity (mouse move, keyboard). Only registered while open.
    const handleActivity = () => {
      resetInactivityTimer()
    }

    const addActivityListeners = () => {
      document.addEventListener('mousemove', handleActivity)
      document.addEventListener('keydown', handleActivity)
    }

    const removeActivityListeners = () => {
      document.removeEventListener('mousemove', handleActivity)
      document.removeEventListener('keydown', handleActivity)
    }

    // Listen for toggle: run open/close logic and register activity listeners only when open
    const handleToggleWithListeners: EventListener = () => {
      handleToggle()
      if (details.open) {
        addActivityListeners()
      } else {
        removeActivityListeners()
      }
    }
    details.addEventListener('toggle', handleToggleWithListeners)

    // Handle clicks (both inside and outside) - closes on outside, resets timer on inside
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      details.removeEventListener('toggle', handleToggleWithListeners)
      document.removeEventListener('mousedown', handleClickOutside)
      removeActivityListeners()
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
