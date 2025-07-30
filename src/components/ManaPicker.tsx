import React from 'react'

import { cn } from '../utils/cn'

import { MANA_COLORS } from '../constants/mana'
import type { ManaColor } from '../constants/mana'

interface ManaPickerProps extends React.HTMLAttributes<HTMLDivElement> {
  selectedColors: ManaColor[]
  onColorToggle: (color: ManaColor) => void
}

export const ManaPicker: React.FC<ManaPickerProps> = ({ selectedColors, onColorToggle, ...props }) => {
  return (
    <div className="flex flex-wrap gap-1 justify-center" role="group" aria-label="Mana color selection" {...props}>
      {MANA_COLORS.map(({ value, label, filename }) => {
        const handleKeyDown = (e: React.KeyboardEvent<HTMLLabelElement>) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onColorToggle(value)
          }
        }

        const isSelected = selectedColors.includes(value)

        return (
          <label
            key={value}
            className="flex items-center gap-2 cursor-pointer rounded p-1"
            role="checkbox"
            aria-checked={isSelected}
            aria-label={`${label} mana (${isSelected ? 'selected' : 'not selected'})`}
            onKeyDown={handleKeyDown}
            data-testid={`mana-${value}`}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onColorToggle(value)}
              className="sr-only"
              tabIndex={-1}
            />

            {/* TODO: CHange opacity on hover on desktop only */}
            <img
              src={`/icons/${filename}`}
              alt=""
              className={cn('w-8 h-8 transition-opacity hover:opacity-100', isSelected ? 'opacity-100' : 'opacity-20')}
            />
          </label>
        )
      })}
    </div>
  )
}
