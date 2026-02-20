import { Edit3, MoreVertical, Trash2, X } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

import { cn } from '../utils/cn'
import { Modal } from './Modal'

interface ThreeDotMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  asMenu?: boolean
  onEdit?: () => void
  onClose?: () => void
  onRemove?: () => void
}

export const ThreeDotMenu: React.FC<ThreeDotMenuProps> = ({
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
      <div className={cn('flex gap-1 empty:hidden', className)} {...props}>
        {onEdit && (
          <button className="btn btn-circle btn-sm" title="Edit" onClick={onEdit}>
            <Edit3 size={16} />
          </button>
        )}

        {onRemove && (
          <button className="btn btn-error btn-circle btn-sm" title="Delete" onClick={() => setShowConfirm(true)}>
            <Trash2 size={16} />
          </button>
        )}

        {onClose && (
          <button className="btn btn-circle btn-sm" title="Close" onClick={onClose}>
            <X size={16} />
          </button>
        )}

        {/* TODO: duplicated below */}
        {/* Confirmation Dialog */}
        <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)} title="Confirm Delete">
          <div className="flex flex-col gap-4">
            <p className="text-gray-600">Are you sure you want to delete this item? This action cannot be undone.</p>

            <div className="flex gap-2 justify-end">
              <button className="btn" onClick={() => setShowConfirm(false)}>
                Cancel
              </button>

              <button
                className="btn btn-error"
                onClick={() => {
                  onRemove?.()
                  setShowConfirm(false)
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      </div>
    )
  }

  return (
    <div ref={wrapperRef} className={cn('relative flex max-w-fit max-h-fit', className)} {...props}>
      <button className="btn btn-circle btn-sm" title="More options" onClick={() => setIsOpen(!isOpen)}>
        <MoreVertical size={16} />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className={cn(
            'flex flex-col absolute rounded-lg shadow-lg z-20 min-w-[120px] overflow-clip empty:hidden',
            menuPosition === 'bottom' ? 'top-full mt-1' : 'bottom-full mb-1',
            menuAlignment === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {onEdit && (
            <button
              className="btn rounded-none"
              onClick={() => {
                onEdit()
                setIsOpen(false)
              }}
            >
              <Edit3 size={14} />
              Edit
            </button>
          )}

          {onRemove && (
            <button
              className="btn btn-error rounded-none"
              onClick={() => {
                setShowConfirm(true)
                setIsOpen(false)
              }}
            >
              <Trash2 size={14} />
              Delete
            </button>
          )}

          {onClose && (
            <button
              className="btn"
              onClick={() => {
                onClose()
                setIsOpen(false)
              }}
            >
              <X size={14} />
              Close
            </button>
          )}
        </div>
      )}

      {/* Confirmation Dialog */}
      <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)} title="Confirm Delete">
        <div className="flex flex-col gap-4">
          <p>Are you sure you want to delete this item? This action cannot be undone.</p>

          <div className="flex gap-2 justify-end">
            <button className="btn" onClick={() => setShowConfirm(false)}>
              Cancel
            </button>

            <button
              className="btn btn-error"
              onClick={() => {
                onRemove?.()
                setShowConfirm(false)
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
