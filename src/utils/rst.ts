// Modes that use 3-digit RST (readability, strength, tone)
const CW_DIGITAL_MODES = ['CW', 'RTTY', 'PSK31', 'FT8', 'FT4', 'JT65', 'JT9', 'OLIVIA', 'CONTESTIA']

// Modes that use 2-digit RS (readability, strength)
const PHONE_MODES = ['SSB', 'FM', 'AM', 'DSTAR', 'DMR', 'C4FM', 'USB', 'LSB']

export function getDefaultRst(mode: string): string {
  const upperMode = mode.toUpperCase()
  if (CW_DIGITAL_MODES.includes(upperMode)) {
    return '599'
  }
  if (PHONE_MODES.includes(upperMode)) {
    return '59'
  }
  // Default to phone-style for unknown modes
  return '59'
}

export function isValidRst(rst: string, mode: string): boolean {
  const upperMode = mode.toUpperCase()
  if (CW_DIGITAL_MODES.includes(upperMode)) {
    return /^[1-5][1-9][1-9]$/.test(rst)
  }
  return /^[1-5][1-9]$/.test(rst)
}
