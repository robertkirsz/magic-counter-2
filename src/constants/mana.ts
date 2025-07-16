export type ManaColor = 'W' | 'U' | 'B' | 'R' | 'G' | 'C'

export const MANA_COLORS: { value: ManaColor; label: string; filename: string; gradientColor: string }[] = [
  { value: 'W', label: 'White', filename: 'w.svg', gradientColor: '#fffbd5' },
  { value: 'U', label: 'Blue', filename: 'u.svg', gradientColor: '#aae0fa' },
  { value: 'B', label: 'Black', filename: 'b.svg', gradientColor: '#cbc2bf' },
  { value: 'R', label: 'Red', filename: 'r.svg', gradientColor: '#f9aa8f' },
  { value: 'G', label: 'Green', filename: 'g.svg', gradientColor: '#9bd3ae' },
  { value: 'C', label: 'Colorless', filename: 'c.svg', gradientColor: '#ccc2c0' }
]
