import type { Participant } from '@/types'
import Pin from './pin/Pin'
import { getPinColor } from './pin/pin-colors'

interface Props {
  participants: Participant[]
  maxParticipants: number
}

export default function ParticipantList({ participants, maxParticipants }: Props) {
  const ratio = maxParticipants > 0 ? participants.length / maxParticipants : 0

  return (
    <div className="bg-surface-card rounded-lg shadow-md p-4">
      <div className="flex items-baseline justify-between mb-3">
        <span className="text-number text-primary">
          {participants.length}
          <span className="text-base text-ink-mute font-semibold ml-1">
            / {maxParticipants}명
          </span>
        </span>
        <span className="text-caption text-ink-mute">
          {participants.length}명 입력 완료
        </span>
      </div>

      <div className="w-full h-1.5 bg-border rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-primary rounded-full transition-[width] duration-300 ease-out"
          style={{ width: `${ratio * 100}%` }}
        />
      </div>

      <ul className="flex flex-col gap-2">
        {participants.map((p, i) => (
          <li key={p.id} className="flex items-center gap-2.5 text-body">
            <Pin color={getPinColor(i, p.nickname)} size="md" aria-label={`${p.nickname} 핀`} />
            <span className="font-bold text-ink">{p.nickname || `참여자${i + 1}`}</span>
            <span className="text-ink-mute text-caption">· {p.address_name}</span>
          </li>
        ))}
        {Array.from({ length: maxParticipants - participants.length }).map((_, i) => (
          <li key={`empty-${i}`} className="flex items-center gap-2.5 text-body opacity-50">
            <Pin color="#d0d6d3" size="md" />
            <span className="text-ink-mute">대기 중...</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
