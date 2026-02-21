import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility function to merge class names with Tailwind CSS class deduplication
 * Combines clsx for conditional classes and tailwind-merge for deduplication
 *
 * @param inputs - Class values to merge (strings, objects, arrays, etc.)
 * @returns Merged and deduplicated class string
 *
 * @example
 * cn('px-2 py-1', 'px-3') // Returns 'py-1 px-3'
 * cn('text-error', isActive && 'text-info') // Conditional classes
 * cn('base-class', className) // Merge with prop className
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
