import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import Pin from '@/components/pin/Pin'

describe('<Pin />', () => {
  it('color prop을 inline style의 background로 적용한다', () => {
    const { container } = render(<Pin color="#ff0000" />)
    const el = container.firstChild as HTMLElement
    expect(el).toHaveStyle({ backgroundColor: 'rgb(255, 0, 0)' })
  })

  it('size="md"가 기본값이고 width/height 클래스를 적용한다', () => {
    const { container } = render(<Pin color="#000" />)
    expect((container.firstChild as HTMLElement).className).toContain('w-')
  })

  it('size="lg"는 더 큰 사이즈를 적용한다', () => {
    const { container: sm } = render(<Pin color="#000" size="sm" />)
    const { container: lg } = render(<Pin color="#000" size="lg" />)
    expect(sm.firstChild).not.toEqual(lg.firstChild)
  })

  it('aria-label을 받으면 접근성 속성을 노출한다', () => {
    const { getByLabelText } = render(<Pin color="#000" aria-label="지영 핀" />)
    expect(getByLabelText('지영 핀')).toBeInTheDocument()
  })
})
