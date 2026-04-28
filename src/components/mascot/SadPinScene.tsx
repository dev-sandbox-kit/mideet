import PinFace from '@/components/pin/PinFace'
import { PIN_COLORS } from '@/components/pin/pin-colors'

interface Props {
  message: string
  onRetry?: () => void
  retryLabel?: string
}

export default function SadPinScene({ message, onRetry, retryLabel = '다시 시도' }: Props) {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <PinFace
        color={PIN_COLORS.orange}
        size="xl"
        mood="sad"
        aria-label="미안한 표정의 핀"
      />
      <p className="text-body text-ink-mute max-w-xs">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 bg-primary text-white rounded-lg px-5 py-2.5 text-body font-bold shadow-cta hover:bg-primary-hover transition-colors"
        >
          {retryLabel}
        </button>
      )}
    </div>
  )
}
