import React from 'react'

type ManaColor = 'W' | 'U' | 'B' | 'R' | 'G' | 'C'

interface ManaPickerProps {
  selectedColors: ManaColor[]
  onColorToggle: (color: ManaColor) => void
  className?: string
}

const MANA_COLORS: { value: ManaColor; label: string; filename: string }[] = [
  { value: 'W', label: 'White', filename: 'w.svg' },
  { value: 'U', label: 'Blue', filename: 'u.svg' },
  { value: 'B', label: 'Black', filename: 'b.svg' },
  { value: 'R', label: 'Red', filename: 'r.svg' },
  { value: 'G', label: 'Green', filename: 'g.svg' },
  { value: 'C', label: 'Colorless', filename: 'c.svg' }
]

export const ManaPicker: React.FC<ManaPickerProps> = ({ selectedColors, onColorToggle, className = '' }) => {
  return (
    <div className={`grid grid-cols-3 ${className}`}>
      {MANA_COLORS.map(({ value, label, filename }) => {
        const isSelected = selectedColors.includes(value)

        return (
          <label key={value} className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-gray-50">
            <input type="checkbox" checked={isSelected} onChange={() => onColorToggle(value)} />

            <img
              src={`/mana/${filename}`}
              alt={label}
              title={label}
              className={`w-8 h-8 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-50'}`}
            />
          </label>
        )
      })}
    </div>
  )
}
