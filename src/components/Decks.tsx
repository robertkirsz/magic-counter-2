import { Plus } from 'lucide-react'
import React, { useState } from 'react'

import { useDecks } from '../contexts/DecksContext'
import { DeckForm } from './DeckForm'
import { DeckList } from './DeckList'

export const Decks: React.FC = () => {
  const { decks, addDeck, removeDeck, updateDeck } = useDecks()
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleAddDeck = (data: { name: string; colors: ManaColor[]; commanders?: ScryfallCard[] }) => {
    addDeck({
      name: data.name,
      colors: data.colors,
      commanders: data.commanders
    })
    setIsAdding(false)
  }

  const handleEditDeck = (deckId: string) => {
    setEditingId(deckId)
  }

  const handleSaveEdit = (data: { name: string; colors: ManaColor[]; commanders?: ScryfallCard[] }) => {
    if (editingId) {
      updateDeck(editingId, {
        name: data.name,
        colors: data.colors,
        commanders: data.commanders
      })
      setEditingId(null)
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
  }

  return (
    <>
      <div className="flex flex-col gap-4 items-start">
        <h1 className="text-3xl font-bold text-gray-800">Decks</h1>

        {/* Add Deck Section */}
        <button
          onClick={() => setIsAdding(true)}
          className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
        >
          <Plus size={20} />
          Add New Deck
        </button>

        {/* Decks List */}
        <DeckList decks={decks} onEditDeck={handleEditDeck} onRemoveDeck={removeDeck} />

        {/* Create Deck Modal */}
        {isAdding && <DeckForm mode="create" onSave={handleAddDeck} onCancel={() => setIsAdding(false)} />}

        {/* Edit Deck Modal */}
        {editingId !== null && (
          <DeckForm
            mode="edit"
            deck={decks.find(d => d.id === editingId)}
            onSave={handleSaveEdit}
            onCancel={handleCancelEdit}
          />
        )}
      </div>
    </>
  )
}
