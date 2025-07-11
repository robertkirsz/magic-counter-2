import { X } from 'lucide-react'
import React, { useEffect, useRef } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  showCloseButton?: boolean
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, showCloseButton = true }) => {
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
    <dialog ref={dialogRef} className="rounded-lg p-0 m-2 border-0 shadow-lg overflow-y-auto">
      <div className="flex justify-between items-center pl-4 pt-2 pr-2">
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

      <div className="px-4 pt-2 pb-4">{children}</div>

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
