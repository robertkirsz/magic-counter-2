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
      <form method="dialog" className="w-full">
        <div className="flex justify-between items-center mb-4 p-6 pb-0">
          <h3 className="text-xl font-semibold">{title}</h3>
          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <div className="px-6 pb-6">{children}</div>
      </form>
     
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
