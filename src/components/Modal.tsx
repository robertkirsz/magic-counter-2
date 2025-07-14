import { X } from 'lucide-react'
import React, { useEffect, useRef } from 'react'

interface ModalProps {
  testId?: string
  isOpen: boolean
  title?: string
  children: React.ReactNode
  onClose?: () => void
}

export const Modal: React.FC<ModalProps> = ({ testId = '', isOpen, title, children, onClose }) => {
  const dialogRef = useRef<HTMLDialogElement>(null)

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

    const handleClose = () => {
      onClose?.()
    }

    // TODO: buggy
    // const handleBackdropClick = (event: MouseEvent) => {
    //   // Check if the click was on the backdrop (not on the dialog content)
    //   const rect = dialog.getBoundingClientRect()
    //   const isInDialog =
    //     event.clientX >= rect.left &&
    //     event.clientX <= rect.right &&
    //     event.clientY >= rect.top &&
    //     event.clientY <= rect.bottom

    //   if (!isInDialog) {
    //     onClose()
    //   }
    // }

    dialog.addEventListener('close', handleClose)
    // dialog.addEventListener('click', handleBackdropClick)

    return () => {
      dialog.removeEventListener('close', handleClose)
      // dialog.removeEventListener('click', handleBackdropClick)
    }
  }, [onClose])

  const testIdPrefix = testId ? `${testId}-modal` : 'modal'

  return (
    <dialog
      ref={dialogRef}
      data-testid={testIdPrefix}
      className="flex flex-col rounded-lg p-0 m-2 border-0 shadow-lg max-h-[90vh] overflow-visible"
    >
      <div className="flex flex-none justify-between items-center pl-4 pt-2 pr-2" onClick={e => e.stopPropagation()}>
        {title && <h3 className="text-xl font-semibold">{title}</h3>}

        {onClose && (
          <button
            type="button"
            data-testid={`${testIdPrefix}-close`}
            aria-label="Close modal"
            className="text-gray-600 hover:text-gray-800 transition-colors p-1 rounded hover:bg-gray-50"
            onClick={onClose}
          >
            <X size={24} />
          </button>
        )}
      </div>

      <div className="px-4 pt-2 pb-4 flex-1" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </dialog>
  )
}
