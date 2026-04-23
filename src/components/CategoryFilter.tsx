import type { PlaceCategory } from '@/types'

const CATEGORIES: PlaceCategory[] = ['카페', '식당', '술집', '문화시설', '쇼핑']

interface Props {
  active: PlaceCategory
  onChange: (cat: PlaceCategory) => void
}

export default function CategoryFilter({ active, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap border transition-colors ${
            active === cat ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
