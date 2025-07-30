/**
 * Generates a cryptographically secure random 8-character alphanumeric ID (case-sensitive)
 * Characters include: A-Z, a-z, 0-9 (62 possible characters)
 * This provides 62^8 = ~218 trillion possible combinations
 * Uses crypto.getRandomValues() for secure random number generation
 */
export const generateId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const maxValidValue = 256 - (256 % chars.length) // Largest multiple of chars.length that fits in a byte
  
  let result = ''
  while (result.length < 8) {
    const randomValues = new Uint8Array(8 - result.length)
    crypto.getRandomValues(randomValues)
    
    for (let i = 0; i < randomValues.length && result.length < 8; i++) {
      // Reject values that would introduce bias
      if (randomValues[i] < maxValidValue) {
        const randomIndex = randomValues[i] % chars.length
        result += chars[randomIndex]
      }
    }
  }
  
  return result
}