export type ManaColor = 'W' | 'U' | 'B' | 'R' | 'G' | 'C'

export const MANA_COLORS: { value: ManaColor; label: string; filename: string }[] = [
  { value: 'W', label: 'White', filename: 'w.svg' },
  { value: 'U', label: 'Blue', filename: 'u.svg' },
  { value: 'B', label: 'Black', filename: 'b.svg' },
  { value: 'R', label: 'Red', filename: 'r.svg' },
  { value: 'G', label: 'Green', filename: 'g.svg' },
  { value: 'C', label: 'Colorless', filename: 'c.svg' }
]
