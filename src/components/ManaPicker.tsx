import React from 'react'

import { MANA_COLORS } from '../constants/mana'
import type { ManaColor } from '../constants/mana'
import { cn } from '../utils/cn'
import { Button } from './Button'

interface ManaPickerProps extends React.HTMLAttributes<HTMLDivElement> {
  selectedColors: ManaColor[]
  onColorToggle: (color: ManaColor) => void
}

export const ManaPicker: React.FC<ManaPickerProps> = ({ selectedColors, onColorToggle, ...props }) => {
  return (
    <div className="flex flex-wrap gap-1 justify-center" role="group" aria-label="Mana color selection" {...props}>
      {MANA_COLORS.map(({ value, label, filename }) => {
        const isSelected = selectedColors.includes(value)

        return (
          <Button
            key={value}
            type="button"
            variant={isSelected ? 'primary' : 'ghost'}
            round
            small
            role="checkbox"
            aria-checked={isSelected}
            aria-label={`${label} mana (${isSelected ? 'selected' : 'not selected'})`}
            onClick={() => onColorToggle(value)}
          >
            <img
              src={`/icons/${filename}`}
              alt={label}
              className={cn('h-6 w-6 transition-opacity hover:opacity-100', isSelected ? 'opacity-100' : 'opacity-35')}
            />
          </Button>
        )
      })}
    </div>
  )
}
