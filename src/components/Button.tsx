import React from 'react'
import useRipple from 'useripple'

import { useLongPress } from '../hooks/useLongPress'
import { cn } from '../utils/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'default' | 'ghost'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  small?: boolean
  round?: boolean
  loading?: boolean
  vibrationDuration?: number // Optional vibration duration in milliseconds
  onLongPress?: (event: React.MouseEvent | React.TouchEvent) => void
  longPressDelay?: number // Duration in milliseconds to trigger long press (default: 500ms)
  shouldPreventDefaultOnLongPress?: boolean
  shouldStopPropagationOnLongPress?: boolean
}

const variantToClass: Record<ButtonVariant, string> = {
  primary: 'btn primary',
  secondary: 'btn secondary',
  danger: 'btn danger',
  default: 'btn default',
  ghost: 'btn ghost'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'default',
      small = false,
      round = false,
      className = '',
      disabled,
      loading,
      children,
      onClick,
      vibrationDuration = 50, // Default 50ms vibration
      onLongPress,
      longPressDelay = 500,
      shouldPreventDefaultOnLongPress = false,
      shouldStopPropagationOnLongPress = false,
      ...props
    },
    ref
  ) => {
    const [addRipple, ripples] = useRipple()
    const isDisabled = disabled || loading

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      addRipple(e)

      // Add vibration for mobile devices
      if (navigator.vibrate && !disabled && !loading) {
        navigator.vibrate(vibrationDuration)
      }

      onClick?.(e)
    }

    const handleLongPress = (e: React.MouseEvent | React.TouchEvent) => {
      // Add stronger vibration for long press
      if (navigator.vibrate && !disabled && !loading) {
        navigator.vibrate([100, 50, 100]) // Pattern: vibrate-pause-vibrate
      }

      onLongPress?.(e)
    }

    // Wrapper function to handle the type mismatch
    const handlePress = (e: React.MouseEvent | React.TouchEvent) => {
      if ('nativeEvent' in e && e.nativeEvent instanceof MouseEvent) {
        const mouseEvent = e as React.MouseEvent<HTMLButtonElement>
        addRipple(mouseEvent)

        // Add vibration for mobile devices
        if (navigator.vibrate && !disabled && !loading) {
          navigator.vibrate(vibrationDuration)
        }

        onClick?.(mouseEvent)
      }
    }

    const longPressHandlers = useLongPress({
      onLongPress: handleLongPress,
      onPress: handlePress, // Always handle regular clicks
      delay: longPressDelay,
      shouldPreventDefault: shouldPreventDefaultOnLongPress,
      shouldStopPropagation: shouldStopPropagationOnLongPress
    })

    // If onLongPress is provided, use long press handlers, otherwise use regular click
    const eventHandlers = onLongPress ? longPressHandlers : { onClick: handleClick }

    return (
      <button
        ref={ref}
        className={cn(variantToClass[variant], small && 'small', round && 'round', className)}
        disabled={isDisabled}
        {...eventHandlers}
        {...props}
      >
        {ripples}
        {loading && <span className="animate-spin" />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
