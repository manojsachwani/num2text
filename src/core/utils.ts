import { ConversionError } from './errors'
import { TextCase } from './types'

const NUMERIC_INPUT_RE = /^-?\d+(?:[.,]\d+)?$/

export interface NormalizedInput {
  isNegative: boolean
  integerPart: string
  fractionalPart?: string
  isZero: boolean
}

export function normalizeInput(value: string | number): NormalizedInput {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new ConversionError('input must be a finite number')
    }
    value = value.toString()
  }

  const trimmed = value.trim()
  if (!NUMERIC_INPUT_RE.test(trimmed)) {
    throw new ConversionError('input must be a numeric string or number')
  }

  const isNegative = trimmed.startsWith('-')
  const unsigned = isNegative ? trimmed.slice(1) : trimmed
  const [rawIntegerPart, rawFractionalPart] = unsigned.split(/[.,]/)

  const integerPart = stripLeadingZeros(rawIntegerPart) || '0'
  const fractionalPart = rawFractionalPart
    ? rawFractionalPart.replace(/^0+/, '') || '0'
    : undefined

  const isZero = integerPart === '0' && (!fractionalPart || /^0+$/.test(fractionalPart))

  return {
    isNegative,
    integerPart,
    fractionalPart,
    isZero
  }
}

export function splitEvery3(value: string): string[] {
  return value.match(/\d{1,3}(?=(\d{3})*$)/g) ?? ['0']
}

export function splitIndian(value: string): string[] {
  if (value.length <= 3) return [value]

  const tail = value.slice(-3)
  let head = value.slice(0, -3)
  const groups: string[] = []

  while (head.length > 2) {
    groups.unshift(head.slice(-2))
    head = head.slice(0, -2)
  }

  if (head.length > 0) {
    groups.unshift(head)
  }

  groups.push(tail)
  return groups
}

export function applyTextCase(value: string, textCase: TextCase = 'titleCase', locale?: string): string {
  if (textCase === 'lowerCase') {
    return locale ? value.toLocaleLowerCase(locale) : value.toLowerCase()
  }

  if (textCase === 'upperCase') {
    return locale ? value.toLocaleUpperCase(locale) : value.toUpperCase()
  }

  return value
}

function stripLeadingZeros(value: string): string {
  return value.replace(/^0+/, '')
}
