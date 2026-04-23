import { describe, it, expect } from 'vitest'
import { generateRoomId } from '@/lib/room-id'

describe('generateRoomId', () => {
  it('8자리 문자열을 반환한다', () => {
    expect(generateRoomId()).toHaveLength(8)
  })

  it('소문자와 숫자만 포함한다 (혼동하기 쉬운 문자 제외)', () => {
    const id = generateRoomId()
    expect(id).toMatch(/^[23456789abcdefghjkmnpqrstuvwxyz]+$/)
  })

  it('호출마다 다른 값을 반환한다', () => {
    const ids = new Set(Array.from({ length: 100 }, generateRoomId))
    expect(ids.size).toBe(100)
  })
})
