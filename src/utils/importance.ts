/**
 * Utility function to get the CSS class for a given importance level
 * @param importance - The importance level (1-5)
 * @returns The CSS class string for the importance level
 */
export const getImportanceClass = (importance: number): string => {
  if (importance < 1 || importance > 5) {
    console.warn(`Invalid importance level: ${importance}. Must be between 1 and 5.`)
    return 'importance-1'
  }
  return `importance-${importance}`
}

/**
 * Utility function to apply importance class to an element
 * @param element - The DOM element to apply the class to
 * @param importance - The importance level (1-5)
 */
export const applyImportanceToElement = (element: HTMLElement, importance: number): void => {
  // Remove any existing importance classes
  element.classList.remove('importance-1', 'importance-2', 'importance-3', 'importance-4', 'importance-5')
  // Add the new importance class
  element.classList.add(getImportanceClass(importance))
}
