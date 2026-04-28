import { describe, it, expect } from 'vitest'
import { getPinColor, PIN_COLORS } from '@/components/pin/pin-colors'

describe('getPinColor', () => {
  it('1-3번 참여자는 고정 색을 반환한다 (blue, orange, green)', () => {
    expect(getPinColor(0, 'anything')).toBe(PIN_COLORS.blue)
    expect(getPinColor(1, 'anything')).toBe(PIN_COLORS.orange)
    expect(getPinColor(2, 'anything')).toBe(PIN_COLORS.green)
  })

  it('4번 이상은 닉네임 hash 기반으로 결정된다 (deterministic)', () => {
    const c1 = getPinColor(3, '지영')
    const c2 = getPinColor(3, '지영')
    expect(c1).toBe(c2)
  })

  it('4번 이상의 색은 보색 풀 안에서 선택된다', () => {
    const extraPool = [PIN_COLORS.purple, PIN_COLORS.teal, PIN_COLORS.brown, PIN_COLORS.pink]
    const result = getPinColor(5, '민준')
    expect(extraPool).toContain(result)
  })

  it('빈 닉네임도 안정적으로 처리한다', () => {
    expect(() => getPinColor(4, '')).not.toThrow()
  })
})
