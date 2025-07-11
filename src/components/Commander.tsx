import { Trash2 } from 'lucide-react'
import React from 'react'

import { getGradientFromColors } from '../utils/gradients'
import { ColorBadges } from './ColorBadges'

interface CommanderProps extends React.HTMLAttributes<HTMLDivElement> {
  commander: string | ScryfallCard
  showRemoveButton?: boolean
  onRemove?: () => void
}

export const Commander: React.FC<CommanderProps> = ({ commander, showRemoveButton = false, onRemove, ...props }) => {
  const isScryfallCard = typeof commander === 'object'
  const name = isScryfallCard ? commander.name : commander
  const typeLine = isScryfallCard ? commander.type : ''
  const imageUrl = isScryfallCard ? commander.image : null
  const colors = isScryfallCard ? commander.colors : []

  const gradientStyle = getGradientFromColors(colors)

  return (
    <div className="rounded-lg p-1 border border-gray-200" style={gradientStyle} {...props}>
      <div className="flex gap-1 bg-white rounded overflow-clip">
        <div className="flex">
          {/* Card Image */}
          {imageUrl && (
            <div
              title={name}
              className="flex-none h-full w-23"
              style={{
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
          )}

          {/* Card Details */}
          <div className="flex flex-col p-2">
            {colors.length > 0 && <ColorBadges colors={colors} className="flex-none" />}
            <div className="font-medium text-sm line-clamp-1">{name}</div>
            {typeLine && <div className="text-xs text-gray-500 line-clamp-1">{typeLine}</div>}
          </div>
        </div>

        {showRemoveButton && onRemove && (
          <div className="flex p-1 self-start">
            <button
              title="Remove commander"
              className="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-50"
              onClick={onRemove}
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
