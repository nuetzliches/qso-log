interface BandDefinition {
  name: string
  lower: number
  upper: number
}

// IARU Region 1 amateur radio band plan (frequencies in MHz)
const BANDS: BandDefinition[] = [
  { name: '160m', lower: 1.810, upper: 2.000 },
  { name: '80m', lower: 3.500, upper: 3.800 },
  { name: '60m', lower: 5.3515, upper: 5.3665 },
  { name: '40m', lower: 7.000, upper: 7.200 },
  { name: '30m', lower: 10.100, upper: 10.150 },
  { name: '20m', lower: 14.000, upper: 14.350 },
  { name: '17m', lower: 18.068, upper: 18.168 },
  { name: '15m', lower: 21.000, upper: 21.450 },
  { name: '12m', lower: 24.890, upper: 24.990 },
  { name: '10m', lower: 28.000, upper: 29.700 },
  { name: '6m', lower: 50.000, upper: 52.000 },
  { name: '2m', lower: 144.000, upper: 146.000 },
  { name: '70cm', lower: 430.000, upper: 440.000 },
  { name: '23cm', lower: 1240.000, upper: 1300.000 },
]

export function frequencyToBand(frequencyMHz: number): string {
  for (const band of BANDS) {
    if (frequencyMHz >= band.lower && frequencyMHz <= band.upper) {
      return band.name
    }
  }
  return ''
}

export function parseFrequency(input: string): number | null {
  const cleaned = input.replace(/[^0-9.,]/g, '').replace(',', '.')
  const freq = parseFloat(cleaned)
  return isNaN(freq) ? null : freq
}

export function getBandNames(): string[] {
  return BANDS.map((b) => b.name)
}

export function getBandFrequencyRange(bandName: string): { lower: number; upper: number } | null {
  const band = BANDS.find((b) => b.name === bandName)
  return band ? { lower: band.lower, upper: band.upper } : null
}

// Common frequencies for quick selection (in MHz)
export const COMMON_FREQUENCIES: { label: string; value: string; band: string }[] = [
  { label: '1.840 MHz (160m)', value: '1.840', band: '160m' },
  { label: '3.573 MHz (80m FT8)', value: '3.573', band: '80m' },
  { label: '3.600 MHz (80m SSB)', value: '3.600', band: '80m' },
  { label: '7.074 MHz (40m FT8)', value: '7.074', band: '40m' },
  { label: '7.100 MHz (40m SSB)', value: '7.100', band: '40m' },
  { label: '10.136 MHz (30m FT8)', value: '10.136', band: '30m' },
  { label: '14.074 MHz (20m FT8)', value: '14.074', band: '20m' },
  { label: '14.200 MHz (20m SSB)', value: '14.200', band: '20m' },
  { label: '18.100 MHz (17m FT8)', value: '18.100', band: '17m' },
  { label: '21.074 MHz (15m FT8)', value: '21.074', band: '15m' },
  { label: '21.200 MHz (15m SSB)', value: '21.200', band: '15m' },
  { label: '24.915 MHz (12m FT8)', value: '24.915', band: '12m' },
  { label: '28.074 MHz (10m FT8)', value: '28.074', band: '10m' },
  { label: '28.500 MHz (10m SSB)', value: '28.500', band: '10m' },
  { label: '50.313 MHz (6m FT8)', value: '50.313', band: '6m' },
  { label: '144.300 MHz (2m SSB)', value: '144.300', band: '2m' },
  { label: '145.500 MHz (2m FM)', value: '145.500', band: '2m' },
  { label: '433.500 MHz (70cm FM)', value: '433.500', band: '70cm' },
]
