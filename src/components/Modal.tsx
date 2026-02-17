import React, { useEffect } from 'react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { cn } from '../utils/cn'

interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  title?: string
  fullSize?: boolean
  hideCloseButton?: boolean
  onClose?: () => void
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
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => void (document.body.style.overflow = '')
  }, [isOpen])

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) onClose?.()
      }}
    >
      <DialogContent
        showCloseButton={!hideCloseButton && !!onClose}
        onInteractOutside={event => {
          if (hideCloseButton || !onClose) event.preventDefault()
        }}
        onEscapeKeyDown={event => {
          if (hideCloseButton || !onClose) event.preventDefault()
        }}
        className={cn(
          'gap-3 border-border bg-card p-4 text-card-foreground sm:p-6',
          fullSize && 'h-[calc(100dvh-20px)] w-[calc(100%-20px)] max-w-[1024px]',
          className
        )}
      >
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
        )}
        {children}
      </DialogContent>
    </Dialog>
  )
}
