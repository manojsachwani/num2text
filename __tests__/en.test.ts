import { convert } from '../src'

describe('English converters', () => {
  it('converts en-us integers with separator and casing', () => {
    expect(convert(123456)).toBe('One Hundred And Twenty Three Thousand, Four Hundred And Fifty Six')
    expect(convert(123456, { case: 'lowerCase' })).toBe('one hundred and twenty three thousand, four hundred and fifty six')
    expect(convert(123456, { case: 'upperCase', separator: '' })).toBe('ONE HUNDRED AND TWENTY THREE THOUSAND FOUR HUNDRED AND FIFTY SIX')
  })

  it('converts en-in grouping', () => {
    expect(convert(1000000, { language: 'en-in' })).toBe('Ten Lakh')
    expect(convert(1000000000, { language: 'en-in' })).toBe('One Hundred Crore')
  })
})
