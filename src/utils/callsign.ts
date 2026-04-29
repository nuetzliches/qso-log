/**
 * ITU amateur radio callsign validation.
 *
 * Structure: PREFIX + DISTRICT_DIGIT + SUFFIX [/ PORTABLE]
 *
 * Supported prefix types:
 *   - 1–2 letters:          W1AW, DL1ABC, F5XYZ
 *   - digit + 1–2 letters:  9A1ABC, 3DA0XYZ
 *   - letter + digit:       E73ABC, S55OO
 */
const CALLSIGN_RE =
  /^([A-Z]{1,2}|[0-9][A-Z]{1,2}|[A-Z][0-9])[0-9][A-Z]{1,4}(\/[A-Z0-9]{1,4})?$/

export function isValidCallsign(callsign: string): boolean {
  return CALLSIGN_RE.test(callsign.toUpperCase())
}

/**
 * Given an invalid callsign attempt, return a structurally similar valid
 * example string, or null if no reasonable suggestion can be built.
 */
export function suggestCallsign(input: string): string | null {
  const upper = input.toUpperCase().replace(/[^A-Z0-9/]/g, '')
  if (!upper) return null

  // Strip any portable suffix first
  const base = upper.split('/')[0]

  // Extract prefix letters (before first digit)
  const prefixLetters = base.match(/^[A-Z]+/)?.[0] ?? ''
  const prefixDigit = base.match(/^[0-9]/)?.[0] ?? ''

  let prefix: string
  if (prefixLetters.length >= 1) {
    prefix = prefixLetters.slice(0, Math.min(2, prefixLetters.length))
  } else if (prefixDigit) {
    const afterFirst = base.slice(1)
    const letters = afterFirst.match(/^[A-Z]{1,2}/)?.[0] ?? 'A'
    prefix = prefixDigit + letters
  } else {
    return null
  }

  // District digit: first digit found in the base, or '1'
  const districtDigit = base.match(/[0-9]/)?.[0] ?? '1'

  // Suffix: letters that appear after the first digit
  const afterDistrict = base.slice(base.search(/[0-9]/) + 1)
  const suffixLetters = afterDistrict.replace(/[^A-Z]/g, '').slice(0, 3)
  const suffix = suffixLetters.length >= 1 ? suffixLetters : 'ABC'

  return `${prefix}${districtDigit}${suffix}`
}
