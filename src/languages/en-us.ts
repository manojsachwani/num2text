import { LanguageConverter } from '../core/types'
import { convertWesternInteger } from './common'

const thousands = ['', 'Thousand', 'Million', 'Billion', 'Trillion', 'Quadrillion', 'Quintillion']
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

export const enUsConverter: LanguageConverter = {
  code: 'en-us',
  defaultSeparator: ',',
  decimalWord: 'Point',
  negativeWord: 'Minus',
  convertInteger(value, context) {
    return convertWesternInteger(value, context, {
      groups: thousands,
      ones,
      tens,
      zero: 'Zero',
      hundredWord: 'Hundred',
      andWord: 'And'
    })
  }
}
