import React from 'react'

import { useImportance } from '../hooks/useImportance'

export const ImportanceSlider: React.FC = () => {
  const { importance, setImportance } = useImportance()

  return (
    <div className="flex flex-col items-center space-y-2 fixed bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700 z-50">
      <input
        id="importance-slider"
        type="range"
        min="1"
        max="5"
        value={importance}
        onChange={e => setImportance(Number(e.target.value))}
        className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
      />

      <div className="flex justify-between w-full text-xs text-gray-500 dark:text-gray-400">
        <span>1</span>
        <span>2</span>
        <span>3</span>
        <span>4</span>
        <span>5</span>
      </div>
    </div>
  )
}
