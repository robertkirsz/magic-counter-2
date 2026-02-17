import { Edit3, MoreVertical, Trash2, X } from 'lucide-react'
import React, { useState } from 'react'

import { cn } from '../utils/cn'
import { Button } from './Button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from './ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './ui/dropdown-menu'

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

        <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this item? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => onRemove?.()}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    )
  }

  return (
    <div className={cn('relative flex max-w-fit max-h-fit', className)} {...props}>
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
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setShowConfirm(true)}
            >
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

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => onRemove?.()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
