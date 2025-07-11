import React, { useEffect, useState } from 'react'

import { Commander } from './Commander'

interface CommanderSearchProps {
  commanders: ScryfallCard[]
  onCommandersChange: (commanders: ScryfallCard[]) => void
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

        // Only keep properties that exist in ScryfallCard type
        const scryfallCards: ScryfallCard[] = (data.data || []).map((card: any) => ({
          name: card.name,
          type: card.type_line,
          colors: card.color_identity || card.colors,
          image: card.card_faces?.[0]?.image_uris?.art_crop || card.image_uris?.art_crop
        }))

        setSuggestions(scryfallCards)
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

  const handleSuggestionClick = (card: ScryfallCard) => {
    if (!commanders.some(commander => commander.name === card.name)) {
      onCommandersChange([...commanders, card])
    }

    setNewCommander('')
    setSuggestions([])
    setShowSuggestions(false)
  }

  const handleRemoveCommander = (index: number) => {
    onCommandersChange(commanders.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Commanders List */}
      {commanders.length > 0 && (
        <div className="space-y-2">
          {commanders.map((commander, index) => (
            <div key={index} className="bg-gray-50 rounded">
              <Commander commander={commander} onRemove={() => handleRemoveCommander(index)} showRemoveButton={true} />
            </div>
          ))}
        </div>
      )}

      {/* Search Commander Input */}
      <div>
        <input
          type="text"
          value={newCommander}
          onChange={e => setNewCommander(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search for commanders..."
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <div className="flex flex-col border border-gray-300 rounded-md max-h-60 overflow-y-auto">
          {isLoading && (
            <div className="p-3 text-center text-gray-500">
              <div className="animate-spin inline-block w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
              <span className="ml-2">Searching...</span>
            </div>
          )}

          {!isLoading && suggestions.length === 0 && newCommander.trim().length >= 2 && (
            <div className="p-3 text-center text-gray-500">No commanders found. Try a different search term.</div>
          )}

          {!isLoading &&
            suggestions.map((card, index) => (
              <Commander
                key={index}
                commander={card}
                onClick={() => handleSuggestionClick(card)}
                className="border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50"
              />
            ))}
        </div>
      )}
    </div>
  )
}
