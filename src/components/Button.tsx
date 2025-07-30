import React from 'react'
import useRipple from 'useripple'

import { cn } from '../utils/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'default' | 'ghost'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  small?: boolean
  round?: boolean
  loading?: boolean
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
      ...props
    },
    ref
  ) => {
    const [addRipple, ripples] = useRipple()
    const isDisabled = disabled || loading

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      addRipple(e)
      onClick?.(e)
    }

    return (
      <button
        ref={ref}
        className={cn(
          variantToClass[variant],
          small && 'small',
          round && 'round',
          className
        )}
        disabled={isDisabled}
        onClick={handleClick}
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
