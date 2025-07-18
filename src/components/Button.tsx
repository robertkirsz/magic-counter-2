import React from 'react'
import useRipple from 'useripple'

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'default'

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
  default: 'btn'
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
        className={`${variantToClass[variant]} ${small ? 'small' : ''} ${round ? 'round' : ''} ${className}`.trim()}
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
