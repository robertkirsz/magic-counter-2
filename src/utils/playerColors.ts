export const PLAYER_COLORS = [
  '#3B82F6', // blue
  '#EF4444', // red
  '#10B981', // emerald
  '#F59E0B', // amber
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#84CC16'  // lime
]

export const getPlayerColor = (index: number): string => {
  return PLAYER_COLORS[index % PLAYER_COLORS.length]
}
