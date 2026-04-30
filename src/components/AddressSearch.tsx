'use client'
import { useState, useRef, useEffect } from 'react'
import type { KakaoPlace } from '@/types'

interface Props {
  onSelect: (place: KakaoPlace) => void
  placeholder?: string
}

export default function AddressSearch({ onSelect, placeholder = '주소를 검색하세요' }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<KakaoPlace[]>([])
  const [open, setOpen] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const isSelectingRef = useRef(false)

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    if (isSelectingRef.current) { isSelectingRef.current = false; return }
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      const res = await fetch(`/api/address-search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data.results ?? [])
      setOpen(true)
    }, 300)
    return () => clearTimeout(timerRef.current)
  }, [query])

  function handleSelect(place: KakaoPlace) {
    isSelectingRef.current = true
    setQuery(place.place_name || place.address_name)
    setOpen(false)
    onSelect(place)
  }

  return (
    <div className="relative">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full border rounded-lg px-3 py-2 text-sm"
      />
      {open && results.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto">
          {results.map((place) => (
            <li
              key={place.id}
              onClick={() => handleSelect(place)}
              className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
            >
              <div className="font-medium">{place.place_name}</div>
              <div className="text-gray-400 text-xs">{place.road_address_name || place.address_name}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
