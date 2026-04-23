import type { Participant } from '@/types'

interface Props {
  participants: Participant[]
  maxParticipants: number
}

export default function ParticipantList({ participants, maxParticipants }: Props) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">참여 현황</span>
        <span className="text-sm text-blue-600 font-bold">
          {participants.length} / {maxParticipants}명 입력 완료
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all"
          style={{ width: `${(participants.length / maxParticipants) * 100}%` }}
        />
      </div>
      <ul className="space-y-1">
        {participants.map((p) => (
          <li key={p.id} className="text-sm flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-bold">
              {p.nickname.slice(0, 1)}
            </span>
            <span className="font-medium">{p.nickname}</span>
            <span className="text-gray-400 text-xs">{p.address_name}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
