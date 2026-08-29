// Preset category palette: muted, warm tones, each with one clear identity.
// The three named in the design system (orange, sage, plum) lead the cycle;
// the rest extend it in the same family so new categories never clash.
export const CATEGORY_PALETTE = [
  '#E8672E', // orange
  '#6E7F5C', // sage
  '#7A5C6E', // plum
  '#C99A3E', // ochre
  '#4E7C8C', // slate teal
  '#B15E4A', // clay
  '#8C6E9E', // dusty violet
  '#5C8C6E', // moss
]

export function nextCategoryColor(usedColors: string[]): string {
  const unused = CATEGORY_PALETTE.find((c) => !usedColors.includes(c))
  if (unused) return unused
  // every preset is in use — cycle back through, keyed by count so repeats stay predictable
  return CATEGORY_PALETTE[usedColors.length % CATEGORY_PALETTE.length]
}
