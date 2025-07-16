import { X } from 'lucide-react'
import React, { useEffect, useRef } from 'react'

interface ModalProps {
  testId?: string
  isOpen: boolean
  title?: string
  fullSize?: boolean
  hideCloseButton?: boolean
  children: React.ReactNode
  onClose?: () => void
}

export const Modal: React.FC<ModalProps> = ({
  testId = '',
  isOpen,
  title,
  children,
  onClose,
  fullSize = false,
  hideCloseButton = false
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const childrenRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current

    if (!dialog) return

    if (isOpen) {
      if (!dialog.open) dialog.showModal()
    } else {
      if (dialog.open) dialog.close()
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
      className={`flex flex-col rounded-lg shadow-lg overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 ${fullSize ? 'w-full h-full' : ''}`}
    >
      <div ref={childrenRef} className="flex flex-col gap-2 px-4 pt-2 pb-4">
        <div className="flex justify-between items-center">
          {title && <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h3>}

          {onClose && !hideCloseButton && (
            <button
              type="button"
              data-testid={`${testIdPrefix}-close`}
              aria-label="Close modal"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-800 ml-auto"
              onClick={onClose}
            >
              <X size={24} />
            </button>
          )}
        </div>

        <div className="text-gray-900 dark:text-gray-100">{children}</div>
      </div>
    </dialog>
  )
}
