import { convert } from '../src'

describe('Built-in language smoke tests', () => {
  it('de', () => {
    expect(convert(0, { language: 'de' })).toBe('null')
    expect(convert(23, { language: 'de' })).toBe('dreiundzwanzig')
    expect(convert(1000, { language: 'de' })).toBe('eintausend')
  })

  it('tr', () => {
    expect(convert(0, { language: 'tr' })).toBe('Sıfır')
    expect(convert(1000, { language: 'tr' })).toBe('Bin')
  })

  it('id', () => {
    expect(convert('1945', { language: 'id' })).toBe('Seribu Sembilan Ratus Empat Puluh Lima')
    expect(convert('100000', { language: 'id' })).toBe('Seratus Ribu')
  })

  it('fr with decimals', () => {
    expect(convert(23, { language: 'fr' })).toBe('Vingt Trois')
    expect(convert('3,14', { language: 'fr' })).toBe('Trois Virgule Quatorze')
    expect(convert('3.14', { language: 'fr', case: 'upperCase' })).toBe('TROIS VIRGULE QUATORZE')
  })
})
