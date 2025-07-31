import React from 'react'

import { Button } from '../Button'
import { Deck } from '../Deck'
import { ThreeDotMenu } from '../ThreeDotMenu'

const PlayerDeckSelector: React.FC<{
  player: Player
  onShowDeckSelect: () => void
  onRemoveDeck: () => void
}> = ({ player, onShowDeckSelect, onRemoveDeck }) => {
  if (!player.deckId)
    return (
      <Button variant="primary" onClick={onShowDeckSelect}>
        Deck
      </Button>
    )

  return (
    <div className="flex items-center gap-1">
      <Deck
        id={player.deckId}
        role="button"
        className="cursor-pointer"
        showCreator={false}
        showStats={false}
        onClick={onShowDeckSelect}
      />

      <ThreeDotMenu onClose={onRemoveDeck} asMenu={false} />
    </div>
  )
}

export default PlayerDeckSelector
