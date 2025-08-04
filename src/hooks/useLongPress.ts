import { useCallback, useRef } from 'react'

interface UseLongPressOptions {
  onLongPress: (event: React.MouseEvent | React.TouchEvent) => void
  onPress?: (event: React.MouseEvent | React.TouchEvent) => void
  delay?: number // Duration in milliseconds to trigger long press (default: 500ms)
  shouldPreventDefault?: boolean
  shouldStopPropagation?: boolean
}

interface UseLongPressReturn {
  onMouseDown: (event: React.MouseEvent) => void
  onMouseUp: (event: React.MouseEvent) => void
  onMouseLeave: (event: React.MouseEvent) => void
  onTouchStart: (event: React.TouchEvent) => void
  onTouchEnd: (event: React.TouchEvent) => void
}

export const useLongPress = ({
  onLongPress,
  onPress,
  delay = 500,
  shouldPreventDefault = true,
  shouldStopPropagation = true
}: UseLongPressOptions): UseLongPressReturn => {
  const timeout = useRef<NodeJS.Timeout>()
  const isLongPress = useRef(false)
  const target = useRef<EventTarget | null>(null)

  const start = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      if (shouldPreventDefault) {
        event.preventDefault()
      }
      if (shouldStopPropagation) {
        event.stopPropagation()
      }

      target.current = event.target
      isLongPress.current = false
      
      timeout.current = setTimeout(() => {
        isLongPress.current = true
        onLongPress(event)
      }, delay)
    },
    [onLongPress, delay, shouldPreventDefault, shouldStopPropagation]
  )

  const clear = useCallback(
    (event: React.MouseEvent | React.TouchEvent, shouldTriggerClick = true) => {
      if (timeout.current) {
        clearTimeout(timeout.current)
      }
      
      if (shouldTriggerClick && !isLongPress.current && onPress) {
        onPress(event)
      }
      
      isLongPress.current = false
      target.current = null
    },
    [onPress]
  )

  return {
    onMouseDown: (event: React.MouseEvent) => start(event),
    onTouchStart: (event: React.TouchEvent) => start(event),
    onMouseUp: (event: React.MouseEvent) => clear(event),
    onMouseLeave: (event: React.MouseEvent) => clear(event, false),
    onTouchEnd: (event: React.TouchEvent) => clear(event)
  }
}