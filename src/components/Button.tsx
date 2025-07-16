import React from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'default'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  loading?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  default: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', className = '', disabled, loading, children, ...props }, ref) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center gap-1 px-4 py-2 rounded transition font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60 disabled:cursor-not-allowed ${
          variantClasses[variant]
        } ${className}`}
        disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <span className="inline-block animate-spin mr-2 w-4 h-4 border-2 border-t-transparent border-current rounded-full align-middle" />
        ) : null}

        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
