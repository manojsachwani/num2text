import { ConvertContext } from '../core/types'
import { splitEvery3 } from '../core/utils'

export function convertWesternInteger(
  value: string,
  context: ConvertContext,
  config: {
    groups: string[]
    ones: string[]
    tens: string[]
    zero: string
    hundredWord: string
    andWord?: string
    skipOneBeforeGroupIndex?: number
    oneForSpecialHundred?: { match: string; replacement: string }[]
  }
): string {
  if (value === '0') return config.zero

  const chunks = splitEvery3(value)
  const words: string[] = []

  for (let i = 0; i < chunks.length; i += 1) {
    const chunk = chunks[i]
    const groupIndex = chunks.length - 1 - i
    const chunkWords = convertChunk(chunk, config.ones, config.tens, config.hundredWord, config.andWord)

    if (!chunkWords.length) continue

    if (
      config.skipOneBeforeGroupIndex === groupIndex &&
      chunkWords.length === 1 &&
      chunkWords[0] === config.ones[1]
    ) {
      words.push(config.groups[groupIndex])
      continue
    }

    words.push(chunkWords.join(' '))
    if (config.groups[groupIndex]) {
      words.push(config.groups[groupIndex])
    }
  }

  let output = words.join(' ')

  if (config.oneForSpecialHundred) {
    for (const rule of config.oneForSpecialHundred) {
      output = output.replace(new RegExp(rule.match, 'g'), rule.replacement)
    }
  }

  return normalizeSeparator(output, context.separator)
}

function convertChunk(
  value: string,
  ones: string[],
  tens: string[],
  hundredWord: string,
  andWord?: string
): string[] {
  const padded = value.padStart(3, '0')
  const h = Number(padded[0])
  const t = Number(padded[1])
  const u = Number(padded[2])
  const result: string[] = []

  if (h > 0) {
    if (ones[h]) result.push(ones[h])
    result.push(hundredWord)
    if (andWord && (t > 0 || u > 0)) {
      result.push(andWord)
    }
  }

  if (t === 1) {
    result.push(ones[t * 10 + u])
    return result
  }

  if (t > 1 && tens[t]) {
    result.push(tens[t])
  }

  if (u > 0 && ones[u]) {
    result.push(ones[u])
  }

  return result
}

function normalizeSeparator(input: string, separator: string): string {
  if (separator === '') {
    return input.replace(/,/g, '').replace(/\s+/g, ' ').trim()
  }

  // Place separators between magnitude phrases.
  return input
    .replace(/\s+(Thousand|Million|Billion|Trillion|Quadrillion|Quintillion|Lakh|Crore)$/g, ' $1')
    .replace(/\s+(Thousand|Million|Billion|Trillion|Quadrillion|Quintillion|Lakh|Crore)\s+/g, ` $1${separator} `)
    .replace(/\s+/g, ' ')
    .trim()
}
