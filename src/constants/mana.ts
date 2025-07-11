export type ManaColor = 'W' | 'U' | 'B' | 'R' | 'G' | 'C'

export const MANA_COLORS: { value: ManaColor; label: string; filename: string; gradientColor: string }[] = [
  { value: 'W', label: 'White', filename: 'w.svg', gradientColor: '#fefce8' },
  { value: 'U', label: 'Blue', filename: 'u.svg', gradientColor: '#eff6ff' },
  { value: 'B', label: 'Black', filename: 'b.svg', gradientColor: '#1f2937' },
  { value: 'R', label: 'Red', filename: 'r.svg', gradientColor: '#fef2f2' },
  { value: 'G', label: 'Green', filename: 'g.svg', gradientColor: '#f0fdf4' },
  { value: 'C', label: 'Colorless', filename: 'c.svg', gradientColor: '#f9fafb' }
]
