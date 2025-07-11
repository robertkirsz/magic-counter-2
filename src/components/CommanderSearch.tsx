import React, { useEffect, useState } from 'react'

import { Commander } from './Commander'

interface ScryfallCard {
  name: string
  type_line: string
  oracle_text?: string
  colors?: string[]
  color_identity?: string[]
  image_uris?: {
    art_crop?: string
    small?: string
  }
}

interface CommanderSearchProps {
  commanders: string[]
  onCommandersChange: (commanders: string[]) => void
}

export const CommanderSearch: React.FC<CommanderSearchProps> = ({ commanders, onCommandersChange }) => {
  const [newCommander, setNewCommander] = useState('')
  const [suggestions, setSuggestions] = useState<ScryfallCard[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

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
      onCommandersChange([...commanders, newCommander.trim()])
      setNewCommander('')
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (card: ScryfallCard) => {
    if (!commanders.includes(card.name)) {
      onCommandersChange([...commanders, card.name])
    }
   
    setNewCommander('')
    setSuggestions([])
    setShowSuggestions(false)
  }

  const handleRemoveCommander = (index: number) => {
    onCommandersChange(commanders.filter((_, i) => i !== index))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddCommander()
    }
  }

  return (
    <div className="mb-6">
      {/* Add Commander Input */}
      <div>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newCommander}
            onChange={e => setNewCommander(e.target.value)}
            onKeyDown={handleKeyPress}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Commander (optional)"
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
          <div className="border border-gray-300 rounded-md max-h-60 overflow-y-auto">
            {isLoading && (
              <div className="p-3 text-center text-gray-500">
                <div className="animate-spin inline-block w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
                <span className="ml-2">Searching...</span>
              </div>
            )}

            {!isLoading &&
              suggestions.map((card, index) => (
                <Commander
                  key={index}
                  commander={card}
                  onClick={() => handleSuggestionClick(card)}
                  className="border-b border-gray-100 last:border-b-0"
                />
              ))}
          </div>
        )}
      </div>

      {/* Commanders List */}
      {commanders.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Current Commanders:</p>

          {commanders.map((commander, index) => (
            <div key={index} className="bg-gray-50 rounded">
              <Commander commander={commander} onRemove={() => handleRemoveCommander(index)} showRemoveButton={true} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
