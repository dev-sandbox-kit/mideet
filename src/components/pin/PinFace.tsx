type Mood = 'smile' | 'sad'
type Size = 'lg' | 'xl'

const SIZE_CLASS: Record<Size, string> = {
  lg: 'w-9 h-12 text-[10px]',
  xl: 'w-14 h-[72px] text-[14px]',
}

interface Props {
  color: string
  mood?: Mood
  size?: Size
  className?: string
  style?: React.CSSProperties
  'aria-label'?: string
}

export default function PinFace({
  color,
  mood = 'smile',
  size = 'lg',
  className = '',
  style,
  ...rest
}: Props) {
  return (
    <span
      role="img"
      aria-label={rest['aria-label'] ?? (mood === 'smile' ? '웃는 핀' : '슬픈 핀')}
      className={`relative inline-flex items-center justify-center flex-shrink-0 shadow-[0_4px_8px_rgba(0,0,0,0.15)] ${SIZE_CLASS[size]} ${className}`}
      style={{
        backgroundColor: color,
        borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
        ...style,
      }}
    >
      <span className="text-black/55 leading-none -translate-y-[10%] select-none" aria-hidden>
        {mood === 'smile' ? '^^' : 'ㅠㅠ'}
      </span>
      <span
        className="absolute left-1/2 -translate-x-1/2 -bottom-[5px] w-0 h-0"
        style={{
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: `6px solid ${color}`,
        }}
      />
    </span>
  )
}
