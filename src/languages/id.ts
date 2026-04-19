import { LanguageConverter } from '../core/types'
import { splitEvery3 } from '../core/utils'

const thousands = ['', 'Ribu', 'Juta', 'Milyar', 'Triliun']
const ones = [
  '',
  'Satu',
  'Dua',
  'Tiga',
  'Empat',
  'Lima',
  'Enam',
  'Tujuh',
  'Delapan',
  'Sembilan',
  'Sepuluh',
  'Sebelas',
  'Dua Belas',
  'Tiga Belas',
  'Empat Belas',
  'Lima Belas',
  'Enam Belas',
  'Tujuh Belas',
  'Delapan Belas',
  'Sembilan Belas'
]
const tens = ['', '', 'Dua Puluh', 'Tiga Puluh', 'Empat Puluh', 'Lima Puluh', 'Enam Puluh', 'Tujuh Puluh', 'Delapan Puluh', 'Sembilan Puluh']

export const idConverter: LanguageConverter = {
  code: 'id',
  defaultSeparator: '',
  decimalWord: 'Koma',
  negativeWord: 'Minus',
  convertInteger(value) {
    if (value === '0') return 'Nol'

    const chunks = splitEvery3(value)
    const output: string[] = []

    for (let i = 0; i < chunks.length; i += 1) {
      const chunk = chunks[i]
      const groupIndex = chunks.length - 1 - i
      const words = chunkToWords(chunk)
      if (!words.length) continue

      output.push(words.join(' '))
      if (thousands[groupIndex]) output.push(thousands[groupIndex])
    }

    return output
      .join(' ')
      .replace(/Satu Ratus/g, 'Seratus')
      .replace(/Satu Ribu/g, 'Seribu')
      .replace(/\s+/g, ' ')
      .trim()
  }
}

function chunkToWords(chunk: string): string[] {
  const padded = chunk.padStart(3, '0')
  const h = Number(padded[0])
  const t = Number(padded[1])
  const u = Number(padded[2])
  const out: string[] = []

  if (h > 0) {
    out.push(ones[h], 'Ratus')
  }

  if (t === 1) {
    out.push(ones[t * 10 + u])
    return out
  }

  if (t > 1) out.push(tens[t])
  if (u > 0) out.push(ones[u])
  return out
}
