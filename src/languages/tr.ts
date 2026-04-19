import { LanguageConverter } from '../core/types'
import { splitEvery3 } from '../core/utils'

const thousands = ['', 'Bin', 'Milyon', 'Milyar', 'Trilyon', 'Katrilyon', 'Kentilyon']
const ones = [
  '',
  'Bir',
  'İki',
  'Üç',
  'Dört',
  'Beş',
  'Altı',
  'Yedi',
  'Sekiz',
  'Dokuz',
  'On',
  'On Bir',
  'On İki',
  'On Üç',
  'On Dört',
  'On Beş',
  'On Altı',
  'On Yedi',
  'On Sekiz',
  'On Dokuz'
]
const tens = ['', '', 'Yirmi', 'Otuz', 'Kırk', 'Elli', 'Altmış', 'Yetmiş', 'Seksen', 'Doksan']

export const trConverter: LanguageConverter = {
  code: 'tr',
  defaultSeparator: ',',
  decimalWord: 'Virgül',
  negativeWord: 'Eksi',
  caseLocale: 'tr',
  convertInteger(value, context) {
    if (value === '0') return 'Sıfır'

    const chunks = splitEvery3(value)
    const result: string[] = []

    for (let i = 0; i < chunks.length; i += 1) {
      const chunk = chunks[i]
      const groupIndex = chunks.length - 1 - i
      const words = chunkToWords(chunk, groupIndex)
      if (!words.length && groupIndex !== 1) continue

      if (words.length) {
        result.push(words.join(' '))
      }
      if (thousands[groupIndex]) result.push(thousands[groupIndex])
    }

    if (context.separator === '') {
      return result.join(' ').replace(/\s+/g, ' ').trim()
    }

    return result
      .join(' ')
      .replace(/\s+(Bin|Milyon|Milyar|Trilyon|Katrilyon|Kentilyon)\s+/g, ` $1${context.separator} `)
      .replace(/\s+/g, ' ')
      .trim()
  }
}

function chunkToWords(chunk: string, groupIndex: number): string[] {
  const padded = chunk.padStart(3, '0')
  const h = Number(padded[0])
  const t = Number(padded[1])
  const u = Number(padded[2])
  const out: string[] = []

  if (h > 0) {
    if (h > 1) out.push(ones[h])
    out.push('Yüz')
  }

  if (t === 1) {
    out.push(ones[t * 10 + u])
    return out
  }

  if (t > 1) out.push(tens[t])

  if (u > 0) {
    if (!(groupIndex === 1 && u === 1 && h === 0 && t === 0)) {
      out.push(ones[u])
    }
  }

  return out
}
