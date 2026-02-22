import React from 'react'

import { cn } from '../utils/cn'
import { getGradientFromColors } from '../utils/gradients'
import { ColorBadges } from './ColorBadges'
import './Commander.css'

interface CommanderProps extends React.HTMLAttributes<HTMLDivElement> {
  commander: ScryfallCard
  showTypeLine?: boolean
}

export const Commander: React.FC<CommanderProps> = ({ commander, showTypeLine = true, className = '', ...props }) => {
  const isScryfallCard = typeof commander === 'object'
  const name = isScryfallCard ? commander.name : commander
  const typeLine = isScryfallCard ? commander.type : ''
  const imageUrl = isScryfallCard ? commander.image : null
  const colors = isScryfallCard ? commander.colors : []

  const gradientStyle = getGradientFromColors(colors)

  return (
    <div className={cn('CommanderContainer', className)} style={gradientStyle} {...props}>
      <div className="Commander">
        {imageUrl && <img className="CommanderImage" src={imageUrl} />}

        <div className="CommanderDetails">
          {colors.length > 0 && <ColorBadges colors={colors} className="flex-none mb-1" />}

          <span className="text-sm/tight line-clamp-2">{name}</span>

          {showTypeLine && typeLine && (
            <span className="text-xs font-light line-clamp-1">{typeLine.split('—')[1]}</span>
          )}
        </div>
      </div>
    </div>
  )
}
