import { Trash2 } from 'lucide-react'
import React from 'react'

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
  const typeLine = isScryfallCard ? commander.type_line : ''
  const imageUrl = isScryfallCard ? commander.image_uris?.art_crop || commander.image_uris?.small : null
  const colors = isScryfallCard ? commander.color_identity || commander.colors || [] : []

  const handleClick = () => {
    if (onClick) onClick()
  }

  const handleRemove = () => {
    if (onRemove) onRemove()
  }

  return (
    <div
      className={`rounded flex flex-col gap-1 p-2 ${className}`}
      onClick={handleClick}
    >
      <div className="flex justify-between items-center w-full">
        <span className="text-xs text-gray-500">Commander</span>
         
         {/* Remove Button */}
         {showRemoveButton && onRemove && (
          <button
            onClick={handleRemove}
            className="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-50"
            title="Remove commander"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Card Image */}
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-10 h-10 rounded-full object-cover border border-gray-300" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-400 border border-gray-300">
            ?
          </div>
        )}

        {/* Card Details */}
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex gap-1 items-center">
            <div className="flex-1 font-medium text-sm line-clamp-1">{name}</div>
            {colors.length > 0 && <ColorBadges colors={colors} />}
          </div>

          {typeLine && <div className="text-xs text-gray-500">{typeLine}</div>}
        </div>
      </div>
    </div>
  )
}
