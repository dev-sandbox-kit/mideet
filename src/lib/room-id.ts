import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('23456789abcdefghjkmnpqrstuvwxyz', 8)

export function generateRoomId(): string {
  return nanoid()
}
