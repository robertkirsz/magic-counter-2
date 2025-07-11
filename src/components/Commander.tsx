import { Trash2 } from 'lucide-react'
import React from 'react'

import { getGradientFromColors } from '../utils/gradients'
import { ColorBadges } from './ColorBadges'

interface CommanderProps {
  commander: string | ScryfallCard
  onRemove?: () => void
  onClick?: () => void
  showRemoveButton?: boolean
  className?: string
}

export const Commander: React.FC<CommanderProps> = ({
  commander,
  onRemove,
  onClick,
  showRemoveButton = false,
  className = ''
}) => {
  const isScryfallCard = typeof commander === 'object'
  const name = isScryfallCard ? commander.name : commander
  const typeLine = isScryfallCard ? commander.type : ''
  const imageUrl = isScryfallCard ? commander.image : null
  const colors = isScryfallCard ? commander.colors : []

  const gradientStyle = getGradientFromColors(colors)

  return (
    <div className={`rounded flex flex-col gap-1 p-2 ${className}`} style={gradientStyle} onClick={onClick}>
      {showRemoveButton && onRemove && (
        <button
          title="Remove commander"
          className="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-50 self-end"
          onClick={onRemove}
        >
          <Trash2 size={16} />
        </button>
      )}

      <div className="flex items-center gap-2">
        {/* Card Image */}
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-10 h-10 rounded-full object-cover border border-gray-300" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-400 border border-gray-300">
            ?
          </div>
        )}

        {/* Card Details */}
        <div className="flex flex-col gap-1">
          {colors.length > 0 && <ColorBadges colors={colors} className="flex-none" />}
          <div className="font-medium text-sm line-clamp-1">{name}</div>
          {typeLine && <div className="text-xs text-gray-500 line-clamp-1">{typeLine}</div>}
        </div>
      </div>
    </div>
  )
}
