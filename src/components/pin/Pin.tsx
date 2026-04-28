type Size = 'sm' | 'md' | 'lg'

const SIZE_CLASS: Record<Size, string> = {
  sm: 'w-3 h-4',
  md: 'w-[18px] h-[22px]',
  lg: 'w-7 h-9',
}

interface Props {
  color: string
  size?: Size
  className?: string
  'aria-label'?: string
}

export default function Pin({ color, size = 'md', className = '', ...rest }: Props) {
  return (
    <span
      role={rest['aria-label'] ? 'img' : undefined}
      aria-label={rest['aria-label']}
      className={`relative inline-block flex-shrink-0 shadow-[0_2px_4px_rgba(0,0,0,0.15)] ${SIZE_CLASS[size]} ${className}`}
      style={{
        backgroundColor: color,
        borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
      }}
    >
      <span
        className="absolute left-1/2 -translate-x-1/2 -bottom-[3px] w-0 h-0"
        style={{
          borderLeft: '4px solid transparent',
          borderRight: '4px solid transparent',
          borderTop: `4px solid ${color}`,
        }}
      />
    </span>
  )
}
