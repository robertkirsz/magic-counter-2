import React from 'react'

import { Button } from '../Button'
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
        <Button onClick={onShowDeckSelect} variant="secondary">
          <Deck id={player.deckId} />
        </Button>
        <ThreeDotMenu onClose={onRemoveDeck} asMenu={false} />
      </div>
    )}

    {!player.deckId && (
      <Button onClick={onShowDeckSelect} className="px-4 py-2" variant="primary">
        Deck
      </Button>
    )}
  </>
)

export default PlayerDeckSelector
