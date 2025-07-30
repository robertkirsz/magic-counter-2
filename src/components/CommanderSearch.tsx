import React, { useEffect, useState } from 'react'

import { fetchCommanderSuggestions } from '../utils/scryfall'
import { Commander } from './Commander'
import { FadeMask } from './FadeMask'

interface CommanderSearchProps {
  onChange: (commander: ScryfallCard) => void
}

export const CommanderSearch: React.FC<CommanderSearchProps> = ({ onChange }) => {
  const [newCommander, setNewCommander] = useState('')
  const [suggestions, setSuggestions] = useState<ScryfallCard[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleFetchSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([])
      return
    }

    setIsLoading(true)

    try {
      const results = await fetchCommanderSuggestions(query)
      setSuggestions(results)
    } catch (error) {
      console.error('Error fetching commander suggestions:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (newCommander.trim()) handleFetchSuggestions(newCommander)
      else setSuggestions([])
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [newCommander])

  const handleSuggestionClick = (card: ScryfallCard) => {
    onChange(card)
    setNewCommander('')
    setSuggestions([])
    setShowSuggestions(false)
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Search Commander Input */}
      <input
        data-testid="commander-search-input"
        value={newCommander}
        onChange={e => setNewCommander(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
        placeholder="Search for commanders..."
        className="form-input"
      />

      {/* Suggestions Dropdown */}
      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <FadeMask showMask={suggestions.length > 2}>
          <div className="flex flex-col gap-1 max-h-58">
            {isLoading && (
                      <div className="flex items-center justify-center gap-2 p-3 text-center text-slate-400">
          <div className="animate-spin inline-block w-4 h-4 border-2 border-slate-600 border-t-blue-600 rounded-full"></div>
                Searching...
              </div>
            )}

            {!isLoading && suggestions.length === 0 && newCommander.trim().length >= 2 && (
              <div className="p-3 text-center text-slate-400">No commanders found. Try a different search term.</div>
            )}

            {!isLoading &&
              suggestions.map((card, index) => (
                <Commander
                  key={index}
                  testIdIndex={index}
                  commander={card}
                  onClick={() => handleSuggestionClick(card)}
                  className="cursor-pointer"
                />
              ))}
          </div>
        </FadeMask>
      )}
    </div>
  )
}
