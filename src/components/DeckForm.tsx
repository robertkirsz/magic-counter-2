import React, { useState } from 'react'

type ManaColor = 'W' | 'U' | 'B' | 'R' | 'G' | 'C'

interface DeckFormProps {
  mode: 'create' | 'edit'
  deck?: Decks
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
  const [commanders, setCommanders] = useState(deck?.commanders?.join(', ') || '')

  const handleColorToggle = (color: ManaColor) => {
    setSelectedColors(prev => (prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]))
  }

  const handleSave = () => {
    if (name.trim() && selectedColors.length > 0) {
      const commandersList = commanders.trim()
        ? commanders
            .split(',')
            .map(c => c.trim())
            .filter(c => c)
        : undefined

      onSave({
        name: name.trim(),
        colors: selectedColors,
        commanders: commandersList
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="mb-4 text-xl font-semibold">{mode === 'create' ? 'Add New Deck' : 'Edit Deck'}</h3>

        {/* Name Input */}
        <div className="mb-4">
          <label className="block mb-2 font-medium">Deck Name:</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter deck name"
            className="w-full p-2 border border-gray-300 rounded"
            autoFocus
          />
        </div>

        {/* Mana Colors */}
        <div className="mb-4">
          <label className="block mb-2 font-medium">
            Mana Colors: <span className="text-red-500">*</span>
          </label>
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

        {/* Commanders */}
        <div className="mb-6">
          <label className="block mb-2 font-medium">Commanders (optional):</label>
          <input
            type="text"
            value={commanders}
            onChange={e => setCommanders(e.target.value)}
            placeholder="Commander names separated by commas"
            className="w-full p-2 border border-gray-300 rounded"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter commander names separated by commas (e.g., "Atraxa, Praetors' Voice")
          </p>
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
    </div>
  )
}
