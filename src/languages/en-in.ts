import { LanguageConverter } from '../core/types'

const groups = ['', 'Thousand', 'Lakh', 'Crore']
const ones = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen'
]
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

export const enInConverter: LanguageConverter = {
  code: 'en-in',
  defaultSeparator: ',',
  decimalWord: 'Point',
  negativeWord: 'Minus',
  convertInteger(value, context) {
    if (value === '0') return 'Zero'

    const parts =
      value.match(/.{1,}(?=(..){2}(...)$)|.{1,2}(?=(..){0,1}(...)$)|.{1,3}$/g) ?? [value]
    const output: string[] = []

    for (let i = 0; i < parts.length; i += 1) {
      const chunk = parts[i]
      const groupIndex = parts.length - 1 - i
      const words = chunkToWords(chunk)
      if (!words.length) continue

      output.push(words.join(' '))
      if (groups[groupIndex]) output.push(groups[groupIndex])
    }

    if (context.separator === '') {
      return output.join(' ').replace(/\s+/g, ' ').trim()
    }

    return output
      .join(' ')
      .replace(/\s+(Thousand|Lakh|Crore)\s+/g, ` $1${context.separator} `)
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
    out.push(ones[h], 'Hundred')
  }

  if (t === 1) {
    out.push(ones[t * 10 + u])
    return out
  }

  if (t > 1) out.push(tens[t])
  if (u > 0) out.push(ones[u])
  return out
}
