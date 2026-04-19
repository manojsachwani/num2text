import { ConversionError } from './errors'
import { LanguageConverter } from './types'

const registry = new Map<string, LanguageConverter>()

export function registerLanguage(code: string, converter: LanguageConverter): void {
  const normalizedCode = code.toLowerCase()

  if (registry.has(normalizedCode)) {
    throw new ConversionError(`language "${normalizedCode}" is already registered`)
  }

  registry.set(normalizedCode, converter)
}

export function hasLanguage(code: string): boolean {
  return registry.has(code.toLowerCase())
}

export function getLanguage(code: string): LanguageConverter {
  const normalizedCode = code.toLowerCase()
  const converter = registry.get(normalizedCode)

  if (!converter) {
    throw new ConversionError(`converter for language "${normalizedCode}" not found`)
  }

  return converter
}

export function getSupportedLanguages(): string[] {
  return [...registry.keys()].sort()
}

export function clearRegistryForTests(): void {
  registry.clear()
}
