import React from 'react'

import { Deck } from '../Deck'
import { ThreeDotMenu } from '../ThreeDotMenu'

const PlayerDeckSelector: React.FC<{
  player: Player
  onShowDeckSelect: () => void
  onRemoveDeck: () => void
}> = ({ player, onShowDeckSelect, onRemoveDeck }) => (
  <>
    {player.deckId && (
      <div className="flex items-center gap-1">
        <button onClick={onShowDeckSelect}>
          <Deck id={player.deckId} />
        </button>
        <ThreeDotMenu onClose={onRemoveDeck} asMenu={false} />
      </div>
    )}

    {!player.deckId && (
      <button onClick={onShowDeckSelect} className="bg-green-500 text-white rounded-lg px-4 py-2">
        Deck
      </button>
    )}
  </>
)

export default PlayerDeckSelector
