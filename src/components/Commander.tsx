import React from 'react'

import { getGradientFromColors } from '../utils/gradients'
import { ColorBadges } from './ColorBadges'
import { ThreeDotMenu } from './ThreeDotMenu'

interface CommanderProps extends React.HTMLAttributes<HTMLDivElement> {
  testIdIndex?: number
  commander: ScryfallCard
  showRemoveButton?: boolean
  onRemove?: () => void
}

export const Commander: React.FC<CommanderProps> = ({
  testIdIndex = 0,
  commander,
  showRemoveButton = false,
  onRemove,
  ...props
}) => {
  const isScryfallCard = typeof commander === 'object'
  const name = isScryfallCard ? commander.name : commander
  const typeLine = isScryfallCard ? commander.type : ''
  const imageUrl = isScryfallCard ? commander.image : null
  const colors = isScryfallCard ? commander.colors : []

  const gradientStyle = getGradientFromColors(colors)

  const testId = `commander-${testIdIndex}`
  const testIdPrefix = testId ? `${testId}-...` : '...'

  return (
    <div className="rounded-lg p-1 border border-gray-200" style={gradientStyle} data-testid={testId} {...props}>
      <div className="importance-4 flex gap-1 bg-white rounded overflow-clip">
        {/* Card Image */}
        {imageUrl && (
          <img
            title={name}
            className="flex-none max-w-25 object-cover object-center"
            src={imageUrl}
            data-testid={`${testIdPrefix}-image`}
          />
        )}

        {/* Card Details */}
        <div className="flex flex-col p-2">
          {colors.length > 0 && <ColorBadges colors={colors} className="importance-3 flex-none" />}

          <div className="font-medium text-sm line-clamp-1" data-testid={`${testIdPrefix}-name`}>
            {name}
          </div>

          {typeLine && (
            <div className="importance-1 text-xs text-gray-500 line-clamp-1" data-testid={`${testIdPrefix}-type-line`}>
              {typeLine}
            </div>
          )}
        </div>

        {showRemoveButton && onRemove && <ThreeDotMenu asMenu={false} onClose={onRemove} testId={testId} />}
      </div>
    </div>
  )
}
