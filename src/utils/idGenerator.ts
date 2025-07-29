/**
 * Generates a random 8-character alphanumeric ID (case-sensitive)
 * Characters include: A-Z, a-z, 0-9 (62 possible characters)
 * This provides 62^8 = ~218 trillion possible combinations
 */
export const generateId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length)
    result += chars[randomIndex]
  }
  
  return result
}