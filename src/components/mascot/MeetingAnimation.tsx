import PinFace from '@/components/pin/PinFace'
import { PIN_COLORS } from '@/components/pin/pin-colors'

export default function MeetingAnimation() {
  return (
    <div
      className="relative h-40 flex items-center justify-center"
      aria-label="중간지점에서 만나는 중"
    >
      <PinFace
        color={PIN_COLORS.blue}
        size="lg"
        className="absolute animate-pin-meet"
        style={{ '--meet-from-x': '-80px', '--meet-from-y': '-30px' } as React.CSSProperties}
      />
      <PinFace
        color={PIN_COLORS.orange}
        size="lg"
        className="absolute animate-pin-meet"
        style={{ '--meet-from-x': '0', '--meet-from-y': '-60px' } as React.CSSProperties}
      />
      <PinFace
        color={PIN_COLORS.green}
        size="lg"
        className="absolute animate-pin-meet"
        style={{ '--meet-from-x': '80px', '--meet-from-y': '-30px' } as React.CSSProperties}
      />
      <span
        className="absolute w-16 h-16 rounded-full bg-yellow-300/30 blur-xl"
        aria-hidden
      />
    </div>
  )
}
