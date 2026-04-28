import PinFace from '@/components/pin/PinFace'
import { getPinColor } from '@/components/pin/pin-colors'

interface Props {
  /** 본인 인덱스 (참여자 배열에서) */
  selfIndex: number
  /** 본인 닉네임 (4번 이상일 때 색상 결정에 사용) */
  selfNickname: string
  /** 남은 인원 수 */
  remaining: number
}

export default function WaitingScene({ selfIndex, selfNickname, remaining }: Props) {
  const color = getPinColor(selfIndex, selfNickname)

  return (
    <div className="flex flex-col items-center gap-4 py-10 text-center">
      <PinFace
        color={color}
        size="xl"
        className="animate-pin-pulse"
        aria-label="내 핀이 박혔어요"
      />
      <p className="text-title text-ink">위치 입력 완료!</p>
      <p className="text-body text-ink-mute">
        {remaining > 0
          ? `다른 친구 ${remaining}명을 기다리고 있어요`
          : '모두 입력 완료! 잠시만요...'}
      </p>
    </div>
  )
}
