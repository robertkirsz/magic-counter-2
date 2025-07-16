import React from 'react'

import { getGradientFromColors } from '../utils/gradients'
import { ColorBadges } from './ColorBadges'

interface CommanderProps extends React.HTMLAttributes<HTMLDivElement> {
  testIdIndex?: number
  commander: ScryfallCard
}

export const Commander: React.FC<CommanderProps> = ({ testIdIndex = 0, commander, className, ...props }) => {
  const isScryfallCard = typeof commander === 'object'
  const name = isScryfallCard ? commander.name : commander
  const typeLine = isScryfallCard ? commander.type : ''
  const imageUrl = isScryfallCard ? commander.image : null
  const colors = isScryfallCard ? commander.colors : []

  const gradientStyle = getGradientFromColors(colors)

  const testId = `commander-${testIdIndex}`
  const testIdPrefix = testId ? `${testId}-...` : '...'

  return (
    <div
      className={`commander-container rounded-md p-1 ${className}`}
      style={gradientStyle}
      data-testid={testId}
      {...props}
    >
      <div className="commander-inner flex rounded-sm overflow-clip relative bg-black">
        {/* Card Image */}
        {imageUrl && (
          <img
            title={name}
            className="commander-image flex-none object-cover object-center"
            src={imageUrl}
            data-testid={`${testIdPrefix}-image`}
          />
        )}

        {/* Card Details Overlay */}
        <div className="flex-1 p-2 text-white">
          {colors.length > 0 && <ColorBadges colors={colors} className="flex-none mb-1" />}

          <div data-testid={`${testIdPrefix}-name`} className="font-medium text-sm/tight line-clamp-2">
            {name}
          </div>

          {typeLine && <div className="text-xs line-clamp-1">{typeLine.split('—')[1]}</div>}
        </div>
      </div>
    </div>
  )
}
