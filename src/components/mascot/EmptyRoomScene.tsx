import PinFace from '@/components/pin/PinFace'
import { PIN_COLORS } from '@/components/pin/pin-colors'

export default function EmptyRoomScene() {
  return (
    <div
      className="flex flex-col items-center gap-3 py-8 text-center"
      aria-label="빈 방 안내"
    >
      <div className="flex items-end gap-3">
        <PinFace color={PIN_COLORS.blue} size="lg" />
        <span
          className="w-9 h-12 rounded-[50%/60%_60%_40%_40%] border-2 border-dashed border-border opacity-60"
          aria-hidden
        />
        <span
          className="w-9 h-12 rounded-[50%/60%_60%_40%_40%] border-2 border-dashed border-border opacity-60"
          aria-hidden
        />
      </div>
      <p className="text-title text-ink mt-2">친구를 초대해 보세요</p>
      <p className="text-body text-ink-mute">
        링크를 보내면 친구들의 출발지가 모이고,<br />
        모두에게 가까운 만날 곳을 찾아드려요.
      </p>
    </div>
  )
}
