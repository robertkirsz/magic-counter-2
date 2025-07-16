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
    <div
      className="rounded-lg p-1 border border-gray-200 dark:border-gray-700"
      style={gradientStyle}
      data-testid={testId}
      {...props}
    >
      <div className="flex rounded overflow-clip relative">
        {/* Card Image */}
        {imageUrl && (
          <img
            title={name}
            className="flex-none max-w-25 object-cover object-center"
            src={imageUrl}
            data-testid={`${testIdPrefix}-image`}
          />
        )}

        {/* Card Details Overlay */}
        <div className="flex-1 p-2">
          {/* TODO; What about his background? */}
          {/* <div className="flex-1 bg-black/90 dark:bg-gray-900/90 p-2"> */}
          {colors.length > 0 && <ColorBadges colors={colors} className="flex-none mb-1" />}

          <div data-testid={`${testIdPrefix}-name`} className="font-medium text-sm line-clamp-1">
            {name}
          </div>

          {typeLine && <div className="text-xs line-clamp-1">{typeLine.split('—')[1]}</div>}
        </div>

        {showRemoveButton && onRemove && (
          <div className="absolute top-1 right-1">
            <ThreeDotMenu asMenu={false} onClose={onRemove} testId={testId} />
          </div>
        )}
      </div>
    </div>
  )
}
