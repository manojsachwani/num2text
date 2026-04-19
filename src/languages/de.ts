import { LanguageConverter } from '../core/types'
import { splitEvery3 } from '../core/utils'

const thousands = ['', 'tausend', 'Million', 'Milliarde', 'Billion', 'Billiarde', 'Trillion']
const thousandsPlural = ['', 'tausend', 'Millionen', 'Milliarden', 'Billionen', 'Billiarden', 'Trillionen']
const ones = [
  '',
  'ein',
  'zwei',
  'drei',
  'vier',
  'fünf',
  'sechs',
  'sieben',
  'acht',
  'neun',
  'zehn',
  'elf',
  'zwölf',
  'dreizehn',
  'vierzehn',
  'fünfzehn',
  'sechzehn',
  'siebzehn',
  'achtzehn',
  'neunzehn'
]
const tens = ['', '', 'zwanzig', 'dreißig', 'vierzig', 'fünfzig', 'sechzig', 'siebzig', 'achtzig', 'neunzig']

export const deConverter: LanguageConverter = {
  code: 'de',
  defaultSeparator: '',
  decimalWord: 'Komma',
  negativeWord: 'minus',
  convertInteger(value) {
    if (value === '0') return 'null'

    const chunks = splitEvery3(value)
    const output: string[] = []

    for (let i = 0; i < chunks.length; i += 1) {
      const chunk = chunks[i]
      const groupIndex = chunks.length - 1 - i
      const chunkWord = convertChunk(chunk)
      if (!chunkWord) continue

      if (thousands[groupIndex]) {
        if (groupIndex === 1) {
          output.push((chunkWord === 'eins' ? 'ein' : chunkWord) + thousands[groupIndex])
          continue
        }

        if (chunkWord === 'eins') {
          output.push('eine', thousands[groupIndex])
        } else {
          output.push(chunkWord, thousandsPlural[groupIndex])
        }
        continue
      }

      output.push(chunkWord)
    }

    return output.join(' ').replace(/\s+/g, ' ').trim()
  }
}

function convertChunk(chunk: string): string {
  const padded = chunk.padStart(3, '0')
  const h = Number(padded[0])
  const t = Number(padded[1])
  const u = Number(padded[2])
  let word = ''

  if (h > 0) {
    word += `${ones[h]}hundert`
  }

  if (t === 1) {
    word += ones[t * 10 + u]
    if (word.endsWith('ein')) word += 's'
    return word
  }

  if (u > 0) {
    word += ones[u]
  }

  if (t > 1) {
    if (u > 0) word += 'und'
    word += tens[t]
  }

  if (word.endsWith('ein')) word += 's'
  return word
}
