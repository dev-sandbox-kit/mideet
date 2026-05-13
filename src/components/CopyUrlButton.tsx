'use client'
import { useState } from 'react'
import posthog from 'posthog-js'

export default function CopyUrlButton() {
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  async function handleCopy() {
    setError('')
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      posthog.capture('result_url_copied')
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'URL 복사에 실패했습니다.')
    }
  }

  return (
    <div>
      <button
        onClick={handleCopy}
        className="w-full border border-gray-300 rounded-lg py-2.5 text-sm font-medium"
      >
        {copied ? '복사됨!' : '결과 URL 복사하기'}
      </button>
      {error && <p className="text-red-500 text-xs mt-1 text-center">{error}</p>}
    </div>
  )
}
