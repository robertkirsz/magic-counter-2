import React, { useState } from 'react'
import { Button } from '../src/components/Button'

export const LongPressExample: React.FC = () => {
  const [message, setMessage] = useState<string>('No action yet')
  const [counter, setCounter] = useState<number>(0)

  const handleClick = () => {
    setMessage('Button clicked!')
    setCounter(prev => prev + 1)
  }

  const handleLongPress = () => {
    setMessage('Button long pressed!')
    setCounter(0) // Reset counter on long press
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Long Press Button Example</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <p><strong>Status:</strong> {message}</p>
        <p><strong>Click Counter:</strong> {counter}</p>
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {/* Basic long press button */}
        <Button
          variant="primary"
          onClick={handleClick}
          onLongPress={handleLongPress}
        >
          Click or Hold Me
        </Button>

        {/* Custom delay long press */}
        <Button
          variant="secondary"
          longPressDelay={1000}
          onClick={() => setMessage('Quick action performed')}
          onLongPress={() => setMessage('Long press after 1 second!')}
        >
          Hold for 1s
        </Button>

        {/* Long press only (no regular click) */}
        <Button
          variant="danger"
          onLongPress={() => setMessage('Danger action confirmed via long press')}
        >
          Long Press Only
        </Button>
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>• <strong>Regular clicks</strong> increment the counter</p>
        <p>• <strong>Long press</strong> resets the counter to 0</p>
        <p>• Try holding buttons for different durations</p>
        <p>• Notice the different vibration patterns (on mobile)</p>
      </div>
    </div>
  )
}