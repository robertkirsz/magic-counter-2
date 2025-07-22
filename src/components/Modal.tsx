import { X } from 'lucide-react'
import React, { useEffect, useRef } from 'react'

import { Button } from './Button'

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
  title,
  fullSize = false,
  hideCloseButton = false,
  children,
  className,
  onClose
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const childrenRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current

    if (!dialog) return

    if (isOpen) {
      if (!dialog.open) dialog.showModal()
      // Disable body scrolling when modal is open
      document.body.style.overflow = 'hidden'
    } else {
      if (dialog.open) dialog.close()
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
      className={`overflow-hidden flex flex-col rounded-lg shadow-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 ${fullSize ? 'w-full h-full' : ''} ${onClose ? 'clickable' : ''} ${className}`}
    >
      <div ref={childrenRef} className="flex-1 flex flex-col gap-2 p-3 overflow-y-auto">
        <div className="flex-none flex justify-between items-center empty:hidden">
          {title && <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h3>}

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

        {isOpen && children}
      </div>
    </dialog>
  )
}
