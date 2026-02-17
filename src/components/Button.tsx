import React from 'react'
import useRipple from 'useripple'

import { useLongPress } from '../hooks/useLongPress'
import { cn } from '../utils/cn'
import { buttonVariants } from './ui/button'

import type { VariantProps } from 'class-variance-authority'

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'default' | 'ghost'

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  className?: string
  variant?: ButtonVariant
  small?: boolean
  round?: boolean
  loading?: boolean
  vibrationDuration?: number
  onLongPress?: (event: React.MouseEvent | React.TouchEvent) => void
  longPressDelay?: number
  shouldPreventDefaultOnLongPress?: boolean
  shouldStopPropagationOnLongPress?: boolean
}

const variantMap: Record<ButtonVariant, VariantProps<typeof buttonVariants>['variant']> = {
  primary: 'default',
  secondary: 'secondary',
  danger: 'destructive',
  default: 'outline',
  ghost: 'ghost'
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
      vibrationDuration = 50,
      onLongPress,
      longPressDelay = 500,
      shouldPreventDefaultOnLongPress = true,
      shouldStopPropagationOnLongPress = false,
      ...props
    },
    ref
  ) => {
    const [addRipple, ripples] = useRipple()
    const isDisabled = disabled || loading

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      addRipple(e)

      if (navigator.vibrate && !disabled && !loading) {
        navigator.vibrate(vibrationDuration)
      }

      onClick?.(e)
    }

    const handleLongPress = (e: React.MouseEvent | React.TouchEvent) => {
      if (navigator.vibrate && !disabled && !loading) {
        navigator.vibrate([100, 50, 100])
      }

      onLongPress?.(e)
    }

    const handlePress = (e: React.MouseEvent | React.TouchEvent) => {
      if ('nativeEvent' in e && e.nativeEvent instanceof MouseEvent) {
        const mouseEvent = e as React.MouseEvent<HTMLButtonElement>
        addRipple(mouseEvent)

        if (navigator.vibrate && !disabled && !loading) {
          navigator.vibrate(vibrationDuration)
        }

        onClick?.(mouseEvent)
      }
    }

    const longPressHandlers = useLongPress({
      onLongPress: handleLongPress,
      onPress: handlePress,
      delay: longPressDelay,
      shouldPreventDefault: shouldPreventDefaultOnLongPress,
      shouldStopPropagation: shouldStopPropagationOnLongPress
    })

    const eventHandlers = onLongPress ? longPressHandlers : { onClick: handleClick }

    const mappedVariant = variantMap[variant]
    const sizeValue = round ? 'icon' : small ? 'sm' : 'default'

    return (
      <button
        ref={ref}
        className={cn(
          buttonVariants({ variant: mappedVariant, size: sizeValue }),
          'cursor-pointer relative overflow-clip',
          round && 'rounded-full aspect-square',
          round && small && 'h-7 w-7',
          className
        )}
        disabled={isDisabled}
        {...eventHandlers}
        {...props}
      >
        {ripples}
        {loading && (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent align-middle" />
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
