import React, { useEffect, useState } from 'react'

type ManaColor = 'W' | 'U' | 'B' | 'R' | 'G' | 'C'

interface DeckFormProps {
  mode: 'create' | 'edit'
  deck?: Deck
  onSave: (data: { name: string; colors: ManaColor[]; commanders?: string[] }) => void
  onCancel: () => void
}

interface ScryfallCard {
  name: string
  type_line: string
  oracle_text?: string
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
  const [newCommander, setNewCommander] = useState('')
  const [suggestions, setSuggestions] = useState<ScryfallCard[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleColorToggle = (color: ManaColor) => {
    setSelectedColors(prev => (prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]))
  }

  const fetchCommanderSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    
    try {
      // Search for legendary creatures that could be commanders
      const response = await fetch(
        `https://api.scryfall.com/cards/search?q=${encodeURIComponent(`${query} is:commander`)}&unique=cards`
      )

      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.data || [])
      } else {
        setSuggestions([])
      }
    } catch (error) {
      console.error('Error fetching commander suggestions:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (newCommander.trim()) fetchCommanderSuggestions(newCommander)
      else setSuggestions([])
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [newCommander])

  const handleAddCommander = () => {
    if (newCommander.trim() && !commanders.includes(newCommander.trim())) {
      setCommanders(prev => [...prev, newCommander.trim()])
      setNewCommander('')
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (card: ScryfallCard) => {
    if (!commanders.includes(card.name)) setCommanders(prev => [...prev, card.name])
    setNewCommander('')
    setSuggestions([])
    setShowSuggestions(false)
  }

  const handleRemoveCommander = (index: number) => {
    setCommanders(prev => prev.filter((_, i) => i !== index))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddCommander()
    }
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

          {/* Add Commander Input */}
          <div className="relative">
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newCommander}
                onChange={e => setNewCommander(e.target.value)}
                onKeyDown={handleKeyPress}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Enter commander name"
                className="flex-1 p-2 border border-gray-300 rounded"
              />
         
              <button
                onClick={handleAddCommander}
                disabled={!newCommander.trim() || commanders.includes(newCommander.trim())}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && (suggestions.length > 0 || isLoading) && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {isLoading && (
                  <div className="p-3 text-center text-gray-500">
                    <div className="animate-spin inline-block w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
                    <span className="ml-2">Searching...</span>
                  </div>
                )}
              
                {!isLoading &&
                  suggestions.map((card, index) => (
                    <div
                      key={index}
                      onClick={() => handleSuggestionClick(card)}
                      className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-sm">{card.name}</div>
                      <div className="text-xs text-gray-500">{card.type_line}</div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Commanders List */}
          {commanders.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Current Commanders:</p>
            
              {commanders.map((commander, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{commander}</span>
                  <button
                    onClick={() => handleRemoveCommander(index)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
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
