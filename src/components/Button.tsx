import React from 'react'
import { Loader2 } from 'lucide-react'

import { Button as ShadcnButton } from '@/components/ui/button'
import { useLongPress } from '../hooks/useLongPress'
import { cn } from '../utils/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'default' | 'ghost'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  small?: boolean
  round?: boolean
  loading?: boolean
  asChild?: boolean
  vibrationDuration?: number // Optional vibration duration in milliseconds
  onLongPress?: (event: React.MouseEvent | React.TouchEvent) => void
  longPressDelay?: number // Duration in milliseconds to trigger long press (default: 500ms)
  shouldPreventDefaultOnLongPress?: boolean
  shouldStopPropagationOnLongPress?: boolean
}

const variantToClass = {
  primary: 'default',
  secondary: 'secondary',
  danger: 'destructive',
  default: 'outline',
  ghost: 'ghost'
} as const

type ShadcnVariant = (typeof variantToClass)[ButtonVariant]

const getSize = (small: boolean, round: boolean): 'default' | 'sm' | 'icon' => {
  if (round) return 'icon'
  if (small) return 'sm'
  return 'default'
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
      asChild = false,
      children,
      onClick,
      vibrationDuration = 50, // Default 50ms vibration
      onLongPress,
      longPressDelay = 500,
      shouldPreventDefaultOnLongPress = true,
      shouldStopPropagationOnLongPress = false,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading
    const buttonVariant: ShadcnVariant = variantToClass[variant]

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
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
      <ShadcnButton
        ref={ref}
        asChild={asChild}
        variant={buttonVariant}
        size={getSize(small, round)}
        className={cn(round && 'rounded-full', round && small && 'h-8 w-8 p-0', className)}
        disabled={isDisabled}
        {...eventHandlers}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </ShadcnButton>
    )
  }
)

Button.displayName = 'Button'
