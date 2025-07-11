import { Trash2 } from 'lucide-react'
import React from 'react'

import { ColorBadges } from './ColorBadges'

interface ScryfallCard {
  name: string
  type_line: string
  oracle_text?: string
  colors?: string[]
  color_identity?: string[]
  image_uris?: {
    art_crop?: string
    small?: string
  }
}

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

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()

    if (onRemove) onRemove()
  }

  return (
    <div
      className={`flex items-center gap-3 p-3 ${onClick ? 'cursor-pointer hover:bg-gray-100' : ''} ${className}`}
      onClick={handleClick}
    >
      {/* Card Image */}
      {imageUrl ? (
        <img src={imageUrl} alt={name} className="w-10 h-10 rounded-full object-cover border border-gray-300" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-400 border border-gray-300">
          ?
        </div>
      )}

      {/* Card Details */}
      <div className="flex-1">
        <div className="font-medium text-sm">{name}</div>
        {typeLine && <div className="text-xs text-gray-500">{typeLine}</div>}
        {colors.length > 0 && <ColorBadges colors={colors} />}
      </div>

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
  )
}
