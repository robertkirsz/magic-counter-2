import React from 'react'

import { useImportance } from '../hooks/useImportance'

export const ImportanceSlider: React.FC = () => {
  const { importance, setImportance } = useImportance()

  return (
    <div className="flex flex-col items-center space-y-2 fixed bottom-2 left-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 border border-gray-200 dark:border-gray-700">
      <input
        id="importance-slider"
        type="range"
        min={1}
        max={5}
        value={importance}
        onChange={e => setImportance(Number(e.target.value))}
        className="form-input-range w-32"
      />
    </div>
  )
}
