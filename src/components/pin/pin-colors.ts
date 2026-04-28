export const PIN_COLORS = {
  blue: '#5fa3c4',
  orange: '#e88654',
  green: '#7bc581',
  purple: '#9b6ec7',
  teal: '#4fb8a8',
  brown: '#a37b5c',
  pink: '#e89bb6',
} as const

export type PinColor = (typeof PIN_COLORS)[keyof typeof PIN_COLORS]

const PRIMARY = [PIN_COLORS.blue, PIN_COLORS.orange, PIN_COLORS.green] as const
const EXTRA = [PIN_COLORS.purple, PIN_COLORS.teal, PIN_COLORS.brown, PIN_COLORS.pink] as const

function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

export function getPinColor(index: number, nickname: string): PinColor {
  if (index < PRIMARY.length) return PRIMARY[index]
  const offset = hashString(nickname || `_${index}`) % EXTRA.length
  return EXTRA[offset]
}
