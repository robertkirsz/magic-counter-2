import { X } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

import { cn } from '../utils/cn'
import { Button } from './Button'
import './Modal.css'

interface ModalProps extends React.HTMLAttributes<HTMLDialogElement> {
  testId?: string
  isOpen: boolean
  title?: string
  fullSize?: boolean
  hideCloseButton?: boolean
  onClose?: () => void
}

export const Modal: React.FC<ModalProps> = ({
  testId = '',
  isOpen,
  title = '',
  fullSize = false,
  hideCloseButton = false,
  children,
  className = '',
  onClose
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const childrenRef = useRef<HTMLDivElement>(null)
  const [isClosing, setIsClosing] = useState(false)
  const [isOpenClass, setIsOpenClass] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current

    if (!dialog) return

    if (isOpen) {
      setIsClosing(false)
      if (!dialog.open) dialog.showModal()
      // next frame to ensure transition applies
      requestAnimationFrame(() => setIsOpenClass(true))
      // Disable body scrolling when modal is open
      document.body.style.overflow = 'hidden'
    } else if (dialog.open) {
      // start closing animation (CSS animation handles fade-out)
      setIsOpenClass(false)
      setIsClosing(true)

      const handleAnimationEnd = (event: AnimationEvent) => {
        // Only handle animation end for the dialog itself (ignore bubbled child animations)
        if (event.target !== dialog) return

        dialog.close()
        setIsClosing(false)
        // Re-enable body scrolling after close animation completes
        document.body.style.overflow = ''
        dialog.removeEventListener('animationend', handleAnimationEnd)
      }

      dialog.addEventListener('animationend', handleAnimationEnd)

      // Fallback in case animationend doesn't fire
      const timeout = setTimeout(() => handleAnimationEnd({ target: dialog } as unknown as AnimationEvent), 250)
      dialog.addEventListener('close', () => clearTimeout(timeout), { once: true })
    } else {
      // Re-enable body scrolling when modal closes
      document.body.style.overflow = ''
    }

    // Cleanup function to ensure body scrolling is re-enabled
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    const dialog = dialogRef.current

    if (!dialog) return

    const handleClose = () => onClose?.()

    const handleBackdropClick = (event: MouseEvent) => {
      if (!childrenRef.current?.contains(event.target as Node)) onClose?.()
    }

    dialog.addEventListener('close', handleClose)
    dialog.addEventListener('click', handleBackdropClick)

    return () => {
      dialog.removeEventListener('close', handleClose)
      dialog.removeEventListener('click', handleBackdropClick)
    }
  }, [onClose])

  const testIdPrefix = testId ? `${testId}-modal` : 'modal'

  return (
    <dialog
      ref={dialogRef}
      data-testid={testIdPrefix}
      className={cn(
        'Modal flex flex-col gap-2 p-3 rounded-lg shadow-lg bg-slate-900 border border-slate-700',
        fullSize && 'fullSize',
        isOpenClass && 'is-open',
        isClosing && 'is-closing',
        className
      )}
    >
      <div ref={childrenRef} className="contents">
        <div className="flex-none flex justify-between items-center empty:hidden text-slate-100">
          {title && <h3 className="text-xl font-semibold text-slate-100">{title}</h3>}

          {onClose && !hideCloseButton && (
            <Button
              data-testid={`${testIdPrefix}-close`}
              type="button"
              aria-label="Close modal"
              round
              small
              variant="secondary"
              className="ml-auto"
              onClick={onClose}
            >
              <X size={20} />
            </Button>
          )}
        </div>

        {(isOpen || isClosing) && children}
      </div>
    </dialog>
  )
}
