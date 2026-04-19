import { convert, getSupportedLanguages, registerLanguage, type LanguageConverter } from '../src'

describe('public API', () => {
  it('lists built-in languages', () => {
    expect(getSupportedLanguages()).toEqual(['de', 'en-in', 'en-us', 'fr', 'id', 'tr'])
  })

  it('throws for unknown language', () => {
    expect(() => convert(10, { language: 'xx' })).toThrow('converter for language "xx" not found')
  })

  it('supports negatives and decimals', () => {
    expect(convert('-12.50')).toBe('Minus Twelve Point Fifty')
    expect(convert('12.5', { case: 'upperCase' })).toBe('TWELVE POINT FIVE')
  })

  it('registers custom language converters', () => {
    const pirate: LanguageConverter = {
      code: 'pirate',
      defaultSeparator: '',
      decimalWord: 'point',
      negativeWord: 'minus',
      convertInteger(value) {
        if (value === '0') return 'zero'
        return `num-${value}`
      }
    }

    registerLanguage('pirate', pirate)
    expect(convert('42', { language: 'pirate' })).toBe('num-42')
    expect(() => registerLanguage('pirate', pirate)).toThrow('already registered')
  })
})
