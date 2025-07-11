import React, { useState } from 'react'

import { CommanderSearch } from './CommanderSearch'
import { Modal } from './Modal'

type ManaColor = 'W' | 'U' | 'B' | 'R' | 'G' | 'C'

interface DeckFormProps {
  mode: 'create' | 'edit'
  deck?: Deck
  onSave: (data: { name: string; colors: ManaColor[]; commanders?: string[] }) => void
  onCancel: () => void
}

const MANA_COLORS: { value: ManaColor; label: string; color: string }[] = [
  { value: 'W', label: 'White', color: 'bg-white text-black' },
  { value: 'U', label: 'Blue', color: 'bg-blue-500 text-white' },
  { value: 'B', label: 'Black', color: 'bg-gray-800 text-white' },
  { value: 'R', label: 'Red', color: 'bg-red-500 text-white' },
  { value: 'G', label: 'Green', color: 'bg-green-500 text-white' },
  { value: 'C', label: 'Colorless', color: 'bg-gray-400 text-white' }
]

export const DeckForm: React.FC<DeckFormProps> = ({ mode, deck, onSave, onCancel }) => {
  const [name, setName] = useState(deck?.name || '')
  const [selectedColors, setSelectedColors] = useState<ManaColor[]>(deck?.colors || [])
  const [commanders, setCommanders] = useState<string[]>(deck?.commanders || [])

  const handleColorToggle = (color: ManaColor) => {
    setSelectedColors(prev => (prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]))
  }

  const handleSave = () => {
    if (name.trim() && selectedColors.length > 0) {
      onSave({
        name: name.trim(),
        colors: selectedColors,
        commanders: commanders.length > 0 ? commanders : undefined
      })
    }
  }

  return (
    <Modal isOpen={true} onClose={onCancel} title={mode === 'create' ? 'Add New Deck' : 'Edit Deck'}>
      <div className="flex flex-col gap-4">
      {/* Name Input */}
      <div>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Deck name"
          className="w-full p-2 border border-gray-300 rounded"
          autoFocus
        />
      </div>

      {/* Commanders */}
      <CommanderSearch commanders={commanders} onCommandersChange={setCommanders} />

      {/* Mana Colors */}
      <div>
        <div className="grid grid-cols-3 gap-2">
          {MANA_COLORS.map(({ value, label, color }) => (
            <label key={value} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedColors.includes(value)}
                onChange={() => handleColorToggle(value)}
                className="rounded"
              />
              <span className={`px-2 py-1 rounded text-xs font-medium ${color}`}>{label}</span>
            </label>
          ))}
        </div>

        {selectedColors.length === 0 && <p className="text-red-500 text-sm mt-1">Please select at least one color</p>}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={!name.trim() || selectedColors.length === 0}
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {mode === 'create' ? 'Save Deck' : 'Save Changes'}
        </button>

        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Cancel
        </button>
      </div>
      </div>
    </Modal>
  )
}
