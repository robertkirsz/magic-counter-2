import { Edit3, Trash2, X } from 'lucide-react'
import React from 'react'

interface ThreeDotMenuProps {
  onEdit?: () => void
  onClose?: () => void
  onRemove?: () => void
}

export const ThreeDotMenu: React.FC<ThreeDotMenuProps> = ({ onEdit, onClose, onRemove }) => {
  return (
    <div className="flex gap-1 empty:hidden">
      {onEdit && (
        <button
          onClick={onEdit}
          className="text-gray-600 hover:text-gray-800 transition-colors p-1 rounded hover:bg-gray-50"
          title="Edit deck"
        >
          <Edit3 size={16} />
        </button>
      )}

      {onRemove && (
        <button
          onClick={onRemove}
          className="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-50"
          title="Delete deck"
        >
          <Trash2 size={16} />
        </button>
      )}

      {onClose && (
        <button
          onClick={onClose}
          className="text-gray-600 hover:text-gray-800 transition-colors p-1 rounded hover:bg-gray-50"
          title="Close deck"
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}
