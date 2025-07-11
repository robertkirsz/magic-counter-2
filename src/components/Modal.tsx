import { X } from 'lucide-react'
import React, { useEffect, useRef } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  showCloseButton?: boolean
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl'
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
  showCloseButton = true
}) => {
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
      onClose()
    }
    dialog.addEventListener('close', handleClose)
    return () => {
      dialog.removeEventListener('close', handleClose)
    }
  }, [onClose])

  return (
    <dialog
      ref={dialogRef}
      className={`rounded-lg p-0 border-0 shadow-lg ${maxWidthClasses[maxWidth]} max-h-[90vh] overflow-y-auto`}
      style={{ padding: 0 }}
    >
      <div className="flex justify-between items-center mb-4 p-6 pb-0">
        <h3 className="text-xl font-semibold">{title}</h3>

        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 transition-colors p-1 rounded hover:bg-gray-50"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        )}
      </div>

      <div className="px-6 pb-6">{children}</div>

      <style>{`
        dialog[open] {
          animation: modal-fade-in 0.15s;
          margin: auto;
        }
        
        dialog::backdrop {
          background: rgba(0,0,0,0.5);
        }
        
        @keyframes modal-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </dialog>
  )
}
