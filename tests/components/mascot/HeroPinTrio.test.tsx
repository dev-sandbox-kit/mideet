import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import HeroPinTrio from '@/components/mascot/HeroPinTrio'

describe('<HeroPinTrio />', () => {
  it('PinFace 3개를 렌더한다', () => {
    const { getAllByRole } = render(<HeroPinTrio />)
    const pins = getAllByRole('img')
    expect(pins).toHaveLength(3)
  })
})
