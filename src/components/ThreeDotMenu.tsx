import { Edit3, MoreHorizontal, Trash2, X } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

interface ThreeDotMenuProps {
  onEdit?: () => void
  onClose?: () => void
  onRemove?: () => void
  asMenu?: boolean
}

export const ThreeDotMenu: React.FC<ThreeDotMenuProps> = ({ onEdit, onClose, onRemove, asMenu = true }) => {
  const [isOpen, setIsOpen] = useState(false)
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
      <div className="flex gap-1 empty:hidden">
        {onEdit && (
          <button
            onClick={onEdit}
            className="text-gray-600 hover:text-gray-800 transition-colors p-1 rounded hover:bg-gray-50"
            title="Edit"
          >
            <Edit3 size={16} />
          </button>
        )}

        {onRemove && (
          <button
            onClick={onRemove}
            className="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-50"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        )}

        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 transition-colors p-1 rounded hover:bg-gray-50"
            title="Close"
          >
            <X size={16} />
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="relative border border-gray-200 rounded-lg flex max-w-fit max-h-fit" ref={wrapperRef}>
      <button
        title="More options"
        className="text-gray-600 hover:text-gray-800 transition-colors p-1 rounded hover:bg-gray-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MoreHorizontal size={16} />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className={`absolute bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px] ${
            menuPosition === 'bottom' ? 'top-full mt-1' : 'bottom-full mb-1'
          } ${menuAlignment === 'right' ? 'right-0' : 'left-0'}`}
        >
          {onEdit && (
            <button
              onClick={() => {
                onEdit()
                setIsOpen(false)
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Edit3 size={14} />
              Edit
            </button>
          )}

          {onRemove && (
            <button
              onClick={() => {
                onRemove()
                setIsOpen(false)
              }}
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
            >
              <Trash2 size={14} />
              Delete
            </button>
          )}

          {onClose && (
            <button
              onClick={() => {
                onClose()
                setIsOpen(false)
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <X size={14} />
              Close
            </button>
          )}
        </div>
      )}
    </div>
  )
}
