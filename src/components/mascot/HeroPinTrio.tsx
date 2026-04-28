import PinFace from '@/components/pin/PinFace'
import { PIN_COLORS } from '@/components/pin/pin-colors'

export default function HeroPinTrio() {
  return (
    <div className="flex justify-center gap-5 py-2" aria-label="mideet 마스코트 핀 3개">
      <PinFace
        color={PIN_COLORS.blue}
        size="xl"
        className="animate-pin-float"
        style={{ animationDelay: '0ms' }}
      />
      <PinFace
        color={PIN_COLORS.orange}
        size="xl"
        className="animate-pin-float"
        style={{ animationDelay: '400ms' }}
      />
      <PinFace
        color={PIN_COLORS.green}
        size="xl"
        className="animate-pin-float"
        style={{ animationDelay: '800ms' }}
      />
    </div>
  )
}
