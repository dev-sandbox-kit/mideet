'use client'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
    setMounted(true)
  }, [])

  function toggle() {
    const next = !isDark
    document.documentElement.classList.toggle('dark', next)
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light')
    } catch {}
    setIsDark(next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? '낮모드로 전환' : '밤모드로 전환'}
      className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full bg-surface-card shadow-sm border border-border flex items-center justify-center text-base hover:bg-primary-100 transition-colors"
    >
      <span aria-hidden>{mounted ? (isDark ? '☀️' : '🌙') : '🌙'}</span>
    </button>
  )
}
