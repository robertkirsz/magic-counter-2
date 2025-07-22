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
          <Button data-testid={`${testIdPrefix}-edit`} round small variant="secondary" title="Edit" onClick={onEdit}>
            <Edit3 size={16} />
          </Button>
        )}

        {onRemove && (
          <Button
            data-testid={`${testIdPrefix}-delete`}
            round
            small
            variant="danger"
            title="Delete"
            onClick={() => setShowConfirm(true)}
          >
            <Trash2 size={16} />
          </Button>
        )}

        {onClose && (
          <Button data-testid={`${testIdPrefix}-close`} round small variant="secondary" title="Close" onClick={onClose}>
            <X size={16} />
          </Button>
        )}

        {/* TODO: duplicated below */}
        {/* Confirmation Dialog */}
        <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)} title="Confirm Delete">
          <div className="flex flex-col gap-4">
            <p className="text-gray-600">Are you sure you want to delete this item? This action cannot be undone.</p>

            <div className="flex gap-2 justify-end">
              <Button
                data-testid={`${testIdPrefix}-confirm-cancel`}
                variant="secondary"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </Button>

              <Button
                data-testid={`${testIdPrefix}-confirm-delete`}
                variant="danger"
                onClick={() => {
                  onRemove?.()
                  setShowConfirm(false)
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    )
  }

  return (
    <div ref={wrapperRef} className={`relative flex max-w-fit max-h-fit ${className}`} {...props}>
      <Button
        data-testid={testIdPrefix}
        variant="secondary"
        round
        small
        title="More options"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MoreVertical size={16} />
      </Button>

      {isOpen && (
        <div
          ref={menuRef}
          className={`flex flex-col absolute rounded-lg shadow-lg z-20 min-w-[120px] overflow-clip empty:hidden ${
            menuPosition === 'bottom' ? 'top-full mt-1' : 'bottom-full mb-1'
          } ${menuAlignment === 'right' ? 'right-0' : 'left-0'}`}
        >
          {onEdit && (
            <Button
              data-testid={`${testIdPrefix}-edit`}
              variant="secondary"
              className="rounded-none"
              onClick={() => {
                onEdit()
                setIsOpen(false)
              }}
            >
              <Edit3 size={14} />
              Edit
            </Button>
          )}

          {onRemove && (
            <Button
              data-testid={`${testIdPrefix}-delete`}
              variant="danger"
              className="rounded-none"
              onClick={() => {
                setShowConfirm(true)
                setIsOpen(false)
              }}
            >
              <Trash2 size={14} />
              Delete
            </Button>
          )}

          {onClose && (
            <Button
              variant="secondary"
              onClick={() => {
                onClose()
                setIsOpen(false)
              }}
            >
              <X size={14} />
              Close
            </Button>
          )}
        </div>
      )}

      {/* Confirmation Dialog */}
      <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)} title="Confirm Delete">
        <div className="flex flex-col gap-4">
          <p>Are you sure you want to delete this item? This action cannot be undone.</p>

          <div className="flex gap-2 justify-end">
            <Button
              data-testid={`${testIdPrefix}-confirm-cancel-button`}
              variant="secondary"
              onClick={() => setShowConfirm(false)}
            >
              Cancel
            </Button>

            <Button
              data-testid={`${testIdPrefix}-confirm-delete-button`}
              variant="danger"
              onClick={() => {
                onRemove?.()
                setShowConfirm(false)
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
