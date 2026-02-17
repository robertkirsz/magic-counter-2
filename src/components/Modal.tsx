import React from 'react'

import { cn } from '../utils/cn'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'

interface ModalProps {
  isOpen: boolean
  title?: string
  fullSize?: boolean
  hideCloseButton?: boolean
  onClose?: () => void
  children?: React.ReactNode
  className?: string
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  title = '',
  fullSize = false,
  hideCloseButton = false,
  children,
  className = '',
  onClose
}) => {
  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose?.()}>
      <DialogContent
        className={cn(
          'max-h-[100dvh] overflow-y-auto',
          fullSize && 'w-[calc(100%-20px)] h-[calc(100%-20px)] max-w-[1024px]',
          hideCloseButton && '[&>button]:hidden',
          className
        )}
        onInteractOutside={hideCloseButton ? e => e.preventDefault() : undefined}
        onEscapeKeyDown={hideCloseButton ? e => e.preventDefault() : undefined}
      >
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription className="sr-only">{title}</DialogDescription>
          </DialogHeader>
        )}
        {!title && (
          <>
            <DialogTitle className="sr-only">Dialog</DialogTitle>
            <DialogDescription className="sr-only">Dialog content</DialogDescription>
          </>
        )}
        {children}
      </DialogContent>
    </Dialog>
  )
}
