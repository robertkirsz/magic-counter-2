import { Edit3, MoreVertical, Trash2, X } from 'lucide-react'
import React, { useState } from 'react'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '../utils/cn'
import { Button } from './Button'
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
  const [showConfirm, setShowConfirm] = useState(false)

  if (!asMenu) {
    return (
      <div className={cn('flex gap-1 empty:hidden', className)} {...props}>
        {onEdit && (
          <Button round small variant="secondary" title="Edit" onClick={onEdit}>
            <Edit3 size={16} />
          </Button>
        )}

        {onRemove && (
          <Button round small variant="danger" title="Delete" onClick={() => setShowConfirm(true)}>
            <Trash2 size={16} />
          </Button>
        )}

        {onClose && (
          <Button round small variant="secondary" title="Close" onClick={onClose}>
            <X size={16} />
          </Button>
        )}

        {/* TODO: duplicated below */}
        {/* Confirmation Dialog */}
        <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)} title="Confirm Delete">
          <div className="flex flex-col gap-4">
            <p className="text-gray-600">Are you sure you want to delete this item? This action cannot be undone.</p>

            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setShowConfirm(false)}>
                Cancel
              </Button>

              <Button
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
    <div className={cn('relative flex max-h-fit max-w-fit', className)} {...props}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" round small title="More options">
            <MoreVertical size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onEdit && (
            <DropdownMenuItem onClick={onEdit}>
              <Edit3 size={14} />
              Edit
            </DropdownMenuItem>
          )}

          {onRemove && (
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setShowConfirm(true)}>
              <Trash2 size={14} />
              Delete
            </DropdownMenuItem>
          )}

          {onClose && (
            <DropdownMenuItem onClick={onClose}>
              <X size={14} />
              Close
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Confirmation Dialog */}
      <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)} title="Confirm Delete">
        <div className="flex flex-col gap-4">
          <p>Are you sure you want to delete this item? This action cannot be undone.</p>

          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>

            <Button
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
