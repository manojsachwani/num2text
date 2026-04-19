import { LanguageConverter } from '../core/types'
import { splitEvery3 } from '../core/utils'

const scale = ['', 'Mille', 'Million', 'Milliard', 'Billion', 'Billiard', 'Trillion']
const units = [
  '',
  'Un',
  'Deux',
  'Trois',
  'Quatre',
  'Cinq',
  'Six',
  'Sept',
  'Huit',
  'Neuf',
  'Dix',
  'Onze',
  'Douze',
  'Treize',
  'Quatorze',
  'Quinze',
  'Seize',
  'Dix Sept',
  'Dix Huit',
  'Dix Neuf'
]
const tens = ['', '', 'Vingt', 'Trente', 'Quarante', 'Cinquante', 'Soixante', 'Soixante Dix', 'Quatre Vingt', 'Quatre Vingt Dix']

export const frConverter: LanguageConverter = {
  code: 'fr',
  defaultSeparator: '',
  decimalWord: 'Virgule',
  negativeWord: 'Moins',
  convertInteger(value, context) {
    if (value === '0') return 'Zéro'

    const chunks = splitEvery3(value)
    const words: string[] = []

    for (let i = 0; i < chunks.length; i += 1) {
      const chunk = chunks[i]
      const groupIndex = chunks.length - 1 - i
      const chunkText = chunkToWords(chunk)
      if (!chunkText) continue

      const label = scale[groupIndex]

      if (label === 'Mille' && chunkText === 'Un') {
        words.push('Mille')
      } else if (label === 'Billion' && chunkText === 'Un') {
        words.push('Mille Milliards')
      } else if (label) {
        const plural = chunkText !== 'Un' && label !== 'Mille' ? 's' : ''
        words.push(`${chunkText} ${label}${plural}`)
      } else {
        words.push(chunkText)
      }
    }

    const result = words.join(context.separator ? `${context.separator} ` : ' ')
    return result.replace(/\s+/g, ' ').trim()
  }
}

function chunkToWords(chunk: string): string {
  const [h, t, u] = chunk.padStart(3, '0').split('').map(Number)
  const out: string[] = []
  const lastTwo = t * 10 + u

  if (h > 0) {
    if (h > 1) out.push(units[h])
    out.push('Cent')
  }

  if (lastTwo < 20) {
    if (units[lastTwo]) out.push(units[lastTwo])
    return out.join(' ')
  }

  if (t === 7 || t === 9) {
    out.push(tens[t - 1])
    if (units[10 + u]) out.push(units[10 + u])
    return out.join(' ')
  }

  if (tens[t]) out.push(tens[t])
  if (u === 1 && t !== 8) out.push('Un')
  else if (units[u]) out.push(units[u])

  return out.join(' ')
}
