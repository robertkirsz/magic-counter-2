import { Edit3, MoreVertical, Trash2, X } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

import { Button } from './Button'
import { Modal } from './Modal'

interface ThreeDotMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  testId?: string
  asMenu?: boolean
  onEdit?: () => void
  onClose?: () => void
  onRemove?: () => void
}

export const ThreeDotMenu: React.FC<ThreeDotMenuProps> = ({
  testId = '',
  asMenu = true,
  onEdit,
  onClose,
  onRemove,
  className,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [menuPosition, setMenuPosition] = useState<'bottom' | 'top'>('bottom')
  const [menuAlignment, setMenuAlignment] = useState<'right' | 'left'>('right')
  const wrapperRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const testIdPrefix = testId ? `${testId}-...` : '...'

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) document.addEventListener('mousedown', handleClickOutside)

    if (menuRef.current) {
      const menuRect = menuRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      if (menuRect.bottom > viewportHeight) setMenuPosition('top')
      if (menuRect.left < 0) setMenuAlignment('left')
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  if (!asMenu) {
    return (
      <div className={`flex gap-1 empty:hidden ${className}`} {...props}>
        {onEdit && (
          <Button
            data-testid={`${testIdPrefix}-edit-button`}
            onClick={onEdit}
            className="text-gray-600 hover:text-gray-800 transition-colors p-1 rounded hover:bg-gray-50"
            title="Edit"
          >
            <Edit3 size={16} />
          </Button>
        )}

        {onRemove && (
          <Button
            data-testid={`${testIdPrefix}-delete-button`}
            onClick={() => setShowConfirm(true)}
            className="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-50"
            title="Delete"
          >
            <Trash2 size={16} />
          </Button>
        )}

        {onClose && (
          <Button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 transition-colors p-1 rounded hover:bg-gray-50"
            title="Close"
          >
            <X size={16} />
          </Button>
        )}

        {/* TODO: duplicated below */}
        {/* Confirmation Dialog */}
        {showConfirm && (
          <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)} title="Confirm Delete">
            <div className="flex flex-col gap-4">
              <p className="text-gray-600">Are you sure you want to delete this item? This action cannot be undone.</p>

              <div className="flex gap-2 justify-end">
                <Button
                  data-testid={`${testIdPrefix}-confirm-cancel-button`}
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </Button>

                <Button
                  data-testid={`${testIdPrefix}-confirm-delete-button`}
                  onClick={() => {
                    onRemove?.()
                    setShowConfirm(false)
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Delete
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    )
  }

  return (
    <div ref={wrapperRef} className={`relative flex max-w-fit max-h-fit ${className}`} {...props}>
      <Button
        title="More options"
        className="bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors p-1 rounded-lg dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-gray-100"
        onClick={() => setIsOpen(!isOpen)}
        data-testid={testIdPrefix}
      >
        <MoreVertical size={16} />
      </Button>

      {isOpen && (
        <div
          ref={menuRef}
          className={`absolute bg-gray-800/95 dark:bg-gray-900 border border-gray-700 dark:border-gray-600 rounded-lg shadow-lg z-10 min-w-[120px] empty:hidden ${
            menuPosition === 'bottom' ? 'top-full mt-1' : 'bottom-full mb-1'
          } ${menuAlignment === 'right' ? 'right-0' : 'left-0'}`}
        >
          {onEdit && (
            <Button
              data-testid={`${testIdPrefix}-edit`}
              onClick={() => {
                onEdit()
                setIsOpen(false)
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Edit3 size={14} />
              Edit
            </Button>
          )}

          {onRemove && (
            <Button
              data-testid={`${testIdPrefix}-delete`}
              onClick={() => {
                setShowConfirm(true)
                setIsOpen(false)
              }}
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
            >
              <Trash2 size={14} />
              Delete
            </Button>
          )}

          {onClose && (
            <Button
              onClick={() => {
                onClose()
                setIsOpen(false)
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <X size={14} />
              Close
            </Button>
          )}
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirm && (
        <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)} title="Confirm Delete">
          <div className="flex flex-col gap-4">
            <p className="text-gray-600">Are you sure you want to delete this item? This action cannot be undone.</p>

            <div className="flex gap-2 justify-end">
              <Button
                data-testid={`${testIdPrefix}-confirm-cancel-button`}
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </Button>

              <Button
                data-testid={`${testIdPrefix}-confirm-delete-button`}
                onClick={() => {
                  onRemove?.()
                  setShowConfirm(false)
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
