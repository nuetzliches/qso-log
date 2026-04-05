interface DxccEntry {
  prefix: string
  country: string
  iso2?: string
}

// DXCC prefix table – longest match wins.
// The lookup algorithm tries progressively shorter prefixes, so a 3-char entry
// like 'SV5' is always matched before the 2-char 'SV' for the same callsign.
// Source: ITU call sign allocations and ARRL DXCC list (simplified).
const DXCC_PREFIXES: DxccEntry[] = [
  // ── 3-character prefixes ─────────────────────────────────────────────────
  { prefix: 'HB0', country: 'Liechtenstein', iso2: 'LI' },
  { prefix: 'OH0', country: 'Åland Islands', iso2: 'AX' },
  { prefix: 'OJ0', country: 'Market Reef' },
  { prefix: 'SV5', country: 'Dodecanese', iso2: 'GR' },
  { prefix: 'SV9', country: 'Crete', iso2: 'GR' },
  { prefix: 'IG9', country: 'African Italy', iso2: 'IT' },
  { prefix: 'IS0', country: 'Sardinia', iso2: 'IT' },
  { prefix: 'UA2', country: 'Kaliningrad', iso2: 'RU' },
  { prefix: 'UA9', country: 'Asiatic Russia', iso2: 'RU' },
  { prefix: 'UA0', country: 'Asiatic Russia', iso2: 'RU' },
  { prefix: 'RA9', country: 'Asiatic Russia', iso2: 'RU' },
  { prefix: 'RA0', country: 'Asiatic Russia', iso2: 'RU' },

  // ── 2-character prefixes ─────────────────────────────────────────────────

  // Germany (DA–DR)
  { prefix: 'DA', country: 'Germany', iso2: 'DE' },
  { prefix: 'DB', country: 'Germany', iso2: 'DE' },
  { prefix: 'DC', country: 'Germany', iso2: 'DE' },
  { prefix: 'DD', country: 'Germany', iso2: 'DE' },
  { prefix: 'DE', country: 'Germany', iso2: 'DE' },
  { prefix: 'DF', country: 'Germany', iso2: 'DE' },
  { prefix: 'DG', country: 'Germany', iso2: 'DE' },
  { prefix: 'DH', country: 'Germany', iso2: 'DE' },
  { prefix: 'DJ', country: 'Germany', iso2: 'DE' },
  { prefix: 'DK', country: 'Germany', iso2: 'DE' },
  { prefix: 'DL', country: 'Germany', iso2: 'DE' },
  { prefix: 'DM', country: 'Germany', iso2: 'DE' },
  { prefix: 'DN', country: 'Germany', iso2: 'DE' },
  { prefix: 'DO', country: 'Germany', iso2: 'DE' },
  { prefix: 'DP', country: 'Germany', iso2: 'DE' },
  { prefix: 'DQ', country: 'Germany', iso2: 'DE' },
  { prefix: 'DR', country: 'Germany', iso2: 'DE' },

  // South Korea (DS–DT, D7–D9)
  { prefix: 'DS', country: 'South Korea', iso2: 'KR' },
  { prefix: 'DT', country: 'South Korea', iso2: 'KR' },
  { prefix: 'D7', country: 'South Korea', iso2: 'KR' },
  { prefix: 'D8', country: 'South Korea', iso2: 'KR' },
  { prefix: 'D9', country: 'South Korea', iso2: 'KR' },

  // Philippines (DU–DZ)
  { prefix: 'DU', country: 'Philippines', iso2: 'PH' },
  { prefix: 'DV', country: 'Philippines', iso2: 'PH' },
  { prefix: 'DW', country: 'Philippines', iso2: 'PH' },
  { prefix: 'DX', country: 'Philippines', iso2: 'PH' },
  { prefix: 'DY', country: 'Philippines', iso2: 'PH' },
  { prefix: 'DZ', country: 'Philippines', iso2: 'PH' },

  // Austria
  { prefix: 'OE', country: 'Austria', iso2: 'AT' },

  // Switzerland (HB, HE – HB0 handled above)
  { prefix: 'HB', country: 'Switzerland', iso2: 'CH' },
  { prefix: 'HE', country: 'Switzerland', iso2: 'CH' },

  // Luxembourg
  { prefix: 'LX', country: 'Luxembourg', iso2: 'LU' },

  // France special prefixes (F handled as 1-char below)
  { prefix: 'FG', country: 'Guadeloupe', iso2: 'GP' },
  { prefix: 'FH', country: 'Mayotte', iso2: 'YT' },
  { prefix: 'FK', country: 'New Caledonia', iso2: 'NC' },
  { prefix: 'FM', country: 'Martinique', iso2: 'MQ' },
  { prefix: 'FO', country: 'French Polynesia', iso2: 'PF' },
  { prefix: 'FP', country: 'Saint Pierre & Miquelon', iso2: 'PM' },
  { prefix: 'FR', country: 'Réunion', iso2: 'RE' },
  { prefix: 'FW', country: 'Wallis & Futuna', iso2: 'WF' },
  { prefix: 'FY', country: 'French Guiana', iso2: 'GF' },
  { prefix: 'TK', country: 'Corsica', iso2: 'FR' },
  { prefix: 'TH', country: 'France', iso2: 'FR' },
  { prefix: 'TM', country: 'France', iso2: 'FR' },
  { prefix: 'TO', country: 'France', iso2: 'FR' },
  { prefix: 'TP', country: 'France', iso2: 'FR' },
  { prefix: 'TQ', country: 'France', iso2: 'FR' },

  // United Kingdom – devolved nations and Crown Dependencies
  { prefix: 'GM', country: 'Scotland', iso2: 'GB' },
  { prefix: 'MM', country: 'Scotland', iso2: 'GB' },
  { prefix: 'GW', country: 'Wales', iso2: 'GB' },
  { prefix: 'MW', country: 'Wales', iso2: 'GB' },
  { prefix: 'GI', country: 'Northern Ireland', iso2: 'GB' },
  { prefix: 'MI', country: 'Northern Ireland', iso2: 'GB' },
  { prefix: 'GD', country: 'Isle of Man', iso2: 'IM' },
  { prefix: 'MD', country: 'Isle of Man', iso2: 'IM' },
  { prefix: 'GU', country: 'Guernsey', iso2: 'GG' },
  { prefix: 'MU', country: 'Guernsey', iso2: 'GG' },
  { prefix: 'GJ', country: 'Jersey', iso2: 'JE' },
  { prefix: 'MJ', country: 'Jersey', iso2: 'JE' },
  { prefix: 'ZB', country: 'Gibraltar', iso2: 'GI' },

  // Netherlands (PA–PI)
  { prefix: 'PA', country: 'Netherlands', iso2: 'NL' },
  { prefix: 'PB', country: 'Netherlands', iso2: 'NL' },
  { prefix: 'PC', country: 'Netherlands', iso2: 'NL' },
  { prefix: 'PD', country: 'Netherlands', iso2: 'NL' },
  { prefix: 'PE', country: 'Netherlands', iso2: 'NL' },
  { prefix: 'PF', country: 'Netherlands', iso2: 'NL' },
  { prefix: 'PG', country: 'Netherlands', iso2: 'NL' },
  { prefix: 'PH', country: 'Netherlands', iso2: 'NL' },
  { prefix: 'PI', country: 'Netherlands', iso2: 'NL' },

  // Belgium (ON–OT)
  { prefix: 'ON', country: 'Belgium', iso2: 'BE' },
  { prefix: 'OO', country: 'Belgium', iso2: 'BE' },
  { prefix: 'OP', country: 'Belgium', iso2: 'BE' },
  { prefix: 'OQ', country: 'Belgium', iso2: 'BE' },
  { prefix: 'OR', country: 'Belgium', iso2: 'BE' },
  { prefix: 'OS', country: 'Belgium', iso2: 'BE' },
  { prefix: 'OT', country: 'Belgium', iso2: 'BE' },

  // Poland (SP–SR, 3Z)
  { prefix: 'SP', country: 'Poland', iso2: 'PL' },
  { prefix: 'SQ', country: 'Poland', iso2: 'PL' },
  { prefix: 'SR', country: 'Poland', iso2: 'PL' },
  { prefix: '3Z', country: 'Poland', iso2: 'PL' },

  // Czech Republic
  { prefix: 'OK', country: 'Czech Republic', iso2: 'CZ' },
  { prefix: 'OL', country: 'Czech Republic', iso2: 'CZ' },

  // Slovakia
  { prefix: 'OM', country: 'Slovakia', iso2: 'SK' },

  // Hungary
  { prefix: 'HA', country: 'Hungary', iso2: 'HU' },
  { prefix: 'HG', country: 'Hungary', iso2: 'HU' },

  // Romania (YO–YR)
  { prefix: 'YO', country: 'Romania', iso2: 'RO' },
  { prefix: 'YP', country: 'Romania', iso2: 'RO' },
  { prefix: 'YQ', country: 'Romania', iso2: 'RO' },
  { prefix: 'YR', country: 'Romania', iso2: 'RO' },

  // Bulgaria
  { prefix: 'LZ', country: 'Bulgaria', iso2: 'BG' },

  // Croatia
  { prefix: '9A', country: 'Croatia', iso2: 'HR' },

  // Slovenia
  { prefix: 'S5', country: 'Slovenia', iso2: 'SI' },

  // Serbia (YT, YU, YZ)
  { prefix: 'YT', country: 'Serbia', iso2: 'RS' },
  { prefix: 'YU', country: 'Serbia', iso2: 'RS' },
  { prefix: 'YZ', country: 'Serbia', iso2: 'RS' },

  // Bosnia-Herzegovina
  { prefix: 'T9', country: 'Bosnia-Herzegovina', iso2: 'BA' },
  { prefix: 'E7', country: 'Bosnia-Herzegovina', iso2: 'BA' },

  // Montenegro
  { prefix: '4O', country: 'Montenegro', iso2: 'ME' },

  // North Macedonia
  { prefix: 'Z3', country: 'North Macedonia', iso2: 'MK' },

  // Kosovo
  { prefix: 'Z6', country: 'Kosovo', iso2: 'XK' },

  // Albania
  { prefix: 'ZA', country: 'Albania', iso2: 'AL' },

  // Greece (SV–SZ; SV5, SV9 handled above)
  { prefix: 'SV', country: 'Greece', iso2: 'GR' },
  { prefix: 'SX', country: 'Greece', iso2: 'GR' },
  { prefix: 'SY', country: 'Greece', iso2: 'GR' },
  { prefix: 'SZ', country: 'Greece', iso2: 'GR' },

  // Malta
  { prefix: '9H', country: 'Malta', iso2: 'MT' },

  // Cyprus
  { prefix: '5B', country: 'Cyprus', iso2: 'CY' },
  { prefix: 'C4', country: 'Cyprus', iso2: 'CY' },
  { prefix: 'H2', country: 'Cyprus', iso2: 'CY' },
  { prefix: 'P3', country: 'Cyprus', iso2: 'CY' },

  // Turkey (TA–TC, YM)
  { prefix: 'TA', country: 'Turkey', iso2: 'TR' },
  { prefix: 'TB', country: 'Turkey', iso2: 'TR' },
  { prefix: 'TC', country: 'Turkey', iso2: 'TR' },
  { prefix: 'YM', country: 'Turkey', iso2: 'TR' },

  // Andorra
  { prefix: 'C3', country: 'Andorra', iso2: 'AD' },

  // San Marino
  { prefix: 'T7', country: 'San Marino', iso2: 'SM' },

  // Vatican City
  { prefix: 'HV', country: 'Vatican City', iso2: 'VA' },

  // Monaco
  { prefix: '3A', country: 'Monaco', iso2: 'MC' },

  // Finland (OH, OF, OG; OH0, OJ0 handled above)
  { prefix: 'OH', country: 'Finland', iso2: 'FI' },
  { prefix: 'OF', country: 'Finland', iso2: 'FI' },
  { prefix: 'OG', country: 'Finland', iso2: 'FI' },

  // Sweden (SA–SL, SM)
  { prefix: 'SA', country: 'Sweden', iso2: 'SE' },
  { prefix: 'SB', country: 'Sweden', iso2: 'SE' },
  { prefix: 'SC', country: 'Sweden', iso2: 'SE' },
  { prefix: 'SD', country: 'Sweden', iso2: 'SE' },
  { prefix: 'SE', country: 'Sweden', iso2: 'SE' },
  { prefix: 'SF', country: 'Sweden', iso2: 'SE' },
  { prefix: 'SG', country: 'Sweden', iso2: 'SE' },
  { prefix: 'SH', country: 'Sweden', iso2: 'SE' },
  { prefix: 'SI', country: 'Sweden', iso2: 'SE' },
  { prefix: 'SJ', country: 'Sweden', iso2: 'SE' },
  { prefix: 'SK', country: 'Sweden', iso2: 'SE' },
  { prefix: 'SL', country: 'Sweden', iso2: 'SE' },
  { prefix: 'SM', country: 'Sweden', iso2: 'SE' },

  // Norway (LA–LN)
  { prefix: 'LA', country: 'Norway', iso2: 'NO' },
  { prefix: 'LB', country: 'Norway', iso2: 'NO' },
  { prefix: 'LC', country: 'Norway', iso2: 'NO' },
  { prefix: 'LD', country: 'Norway', iso2: 'NO' },
  { prefix: 'LE', country: 'Norway', iso2: 'NO' },
  { prefix: 'LF', country: 'Norway', iso2: 'NO' },
  { prefix: 'LG', country: 'Norway', iso2: 'NO' },
  { prefix: 'LH', country: 'Norway', iso2: 'NO' },
  { prefix: 'LJ', country: 'Norway', iso2: 'NO' },
  { prefix: 'LK', country: 'Norway', iso2: 'NO' },
  { prefix: 'LL', country: 'Norway', iso2: 'NO' },
  { prefix: 'LM', country: 'Norway', iso2: 'NO' },
  { prefix: 'LN', country: 'Norway', iso2: 'NO' },

  // Svalbard
  { prefix: 'JW', country: 'Svalbard', iso2: 'SJ' },

  // Jan Mayen
  { prefix: 'JX', country: 'Jan Mayen', iso2: 'SJ' },

  // Denmark (OU–OW, OZ)
  { prefix: 'OU', country: 'Denmark', iso2: 'DK' },
  { prefix: 'OV', country: 'Denmark', iso2: 'DK' },
  { prefix: 'OW', country: 'Denmark', iso2: 'DK' },
  { prefix: 'OZ', country: 'Denmark', iso2: 'DK' },

  // Faroe Islands
  { prefix: 'OY', country: 'Faroe Islands', iso2: 'FO' },

  // Greenland
  { prefix: 'OX', country: 'Greenland', iso2: 'GL' },

  // Iceland
  { prefix: 'TF', country: 'Iceland', iso2: 'IS' },

  // Estonia
  { prefix: 'ES', country: 'Estonia', iso2: 'EE' },

  // Latvia
  { prefix: 'YL', country: 'Latvia', iso2: 'LV' },

  // Lithuania
  { prefix: 'LY', country: 'Lithuania', iso2: 'LT' },

  // Belarus
  { prefix: 'EU', country: 'Belarus', iso2: 'BY' },
  { prefix: 'EV', country: 'Belarus', iso2: 'BY' },
  { prefix: 'EW', country: 'Belarus', iso2: 'BY' },

  // Ukraine
  { prefix: 'EM', country: 'Ukraine', iso2: 'UA' },
  { prefix: 'EN', country: 'Ukraine', iso2: 'UA' },
  { prefix: 'EO', country: 'Ukraine', iso2: 'UA' },
  { prefix: 'UR', country: 'Ukraine', iso2: 'UA' },
  { prefix: 'US', country: 'Ukraine', iso2: 'UA' },
  { prefix: 'UT', country: 'Ukraine', iso2: 'UA' },
  { prefix: 'UV', country: 'Ukraine', iso2: 'UA' },
  { prefix: 'UW', country: 'Ukraine', iso2: 'UA' },
  { prefix: 'UX', country: 'Ukraine', iso2: 'UA' },
  { prefix: 'UY', country: 'Ukraine', iso2: 'UA' },
  { prefix: 'UZ', country: 'Ukraine', iso2: 'UA' },

  // Moldova
  { prefix: 'ER', country: 'Moldova', iso2: 'MD' },

  // Russia (European – UA1–UA7, RA–RZ; UA2/UA9/UA0 handled above)
  { prefix: 'UA', country: 'Russia', iso2: 'RU' },
  { prefix: 'RA', country: 'Russia', iso2: 'RU' },
  { prefix: 'RB', country: 'Russia', iso2: 'RU' },
  { prefix: 'RC', country: 'Russia', iso2: 'RU' },
  { prefix: 'RD', country: 'Russia', iso2: 'RU' },
  { prefix: 'RE', country: 'Russia', iso2: 'RU' },
  { prefix: 'RF', country: 'Russia', iso2: 'RU' },
  { prefix: 'RG', country: 'Russia', iso2: 'RU' },
  { prefix: 'RH', country: 'Russia', iso2: 'RU' },
  { prefix: 'RI', country: 'Russia', iso2: 'RU' },
  { prefix: 'RJ', country: 'Russia', iso2: 'RU' },
  { prefix: 'RK', country: 'Russia', iso2: 'RU' },
  { prefix: 'RL', country: 'Russia', iso2: 'RU' },
  { prefix: 'RM', country: 'Russia', iso2: 'RU' },
  { prefix: 'RN', country: 'Russia', iso2: 'RU' },
  { prefix: 'RO', country: 'Russia', iso2: 'RU' },
  { prefix: 'RP', country: 'Russia', iso2: 'RU' },
  { prefix: 'RQ', country: 'Russia', iso2: 'RU' },
  { prefix: 'RR', country: 'Russia', iso2: 'RU' },
  { prefix: 'RS', country: 'Russia', iso2: 'RU' },
  { prefix: 'RT', country: 'Russia', iso2: 'RU' },
  { prefix: 'RU', country: 'Russia', iso2: 'RU' },
  { prefix: 'RV', country: 'Russia', iso2: 'RU' },
  { prefix: 'RW', country: 'Russia', iso2: 'RU' },
  { prefix: 'RX', country: 'Russia', iso2: 'RU' },
  { prefix: 'RY', country: 'Russia', iso2: 'RU' },
  { prefix: 'RZ', country: 'Russia', iso2: 'RU' },

  // Armenia
  { prefix: 'EK', country: 'Armenia', iso2: 'AM' },

  // Azerbaijan
  { prefix: '4J', country: 'Azerbaijan', iso2: 'AZ' },
  { prefix: '4K', country: 'Azerbaijan', iso2: 'AZ' },

  // Georgia
  { prefix: '4L', country: 'Georgia', iso2: 'GE' },

  // Kazakhstan
  { prefix: 'UN', country: 'Kazakhstan', iso2: 'KZ' },
  { prefix: 'UO', country: 'Kazakhstan', iso2: 'KZ' },
  { prefix: 'UP', country: 'Kazakhstan', iso2: 'KZ' },
  { prefix: 'UQ', country: 'Kazakhstan', iso2: 'KZ' },

  // Tajikistan
  { prefix: 'EY', country: 'Tajikistan', iso2: 'TJ' },

  // Turkmenistan
  { prefix: 'EZ', country: 'Turkmenistan', iso2: 'TM' },

  // Spain (EA–EH, AM–AO)
  { prefix: 'AM', country: 'Spain', iso2: 'ES' },
  { prefix: 'AN', country: 'Spain', iso2: 'ES' },
  { prefix: 'AO', country: 'Spain', iso2: 'ES' },
  { prefix: 'EA', country: 'Spain', iso2: 'ES' },
  { prefix: 'EB', country: 'Spain', iso2: 'ES' },
  { prefix: 'EC', country: 'Spain', iso2: 'ES' },
  { prefix: 'ED', country: 'Spain', iso2: 'ES' },
  { prefix: 'EE', country: 'Spain', iso2: 'ES' },
  { prefix: 'EF', country: 'Spain', iso2: 'ES' },
  { prefix: 'EG', country: 'Spain', iso2: 'ES' },
  { prefix: 'EH', country: 'Spain', iso2: 'ES' },

  // Portugal (CQ–CS, CT)
  { prefix: 'CQ', country: 'Portugal', iso2: 'PT' },
  { prefix: 'CR', country: 'Portugal', iso2: 'PT' },
  { prefix: 'CS', country: 'Portugal', iso2: 'PT' },
  { prefix: 'CT', country: 'Portugal', iso2: 'PT' },

  // Ireland (EI, EJ)
  { prefix: 'EI', country: 'Ireland', iso2: 'IE' },
  { prefix: 'EJ', country: 'Ireland', iso2: 'IE' },

  // USA (AA–AL; W, K, N handled as 1-char below)
  { prefix: 'AA', country: 'United States', iso2: 'US' },
  { prefix: 'AB', country: 'United States', iso2: 'US' },
  { prefix: 'AC', country: 'United States', iso2: 'US' },
  { prefix: 'AD', country: 'United States', iso2: 'US' },
  { prefix: 'AE', country: 'United States', iso2: 'US' },
  { prefix: 'AF', country: 'United States', iso2: 'US' },
  { prefix: 'AG', country: 'United States', iso2: 'US' },
  { prefix: 'AH', country: 'United States', iso2: 'US' },
  { prefix: 'AI', country: 'United States', iso2: 'US' },
  { prefix: 'AJ', country: 'United States', iso2: 'US' },
  { prefix: 'AK', country: 'United States', iso2: 'US' },
  { prefix: 'AL', country: 'United States', iso2: 'US' },

  // India (AT–AW, VU, VT)
  { prefix: 'AT', country: 'India', iso2: 'IN' },
  { prefix: 'AU', country: 'India', iso2: 'IN' },
  { prefix: 'AV', country: 'India', iso2: 'IN' },
  { prefix: 'AW', country: 'India', iso2: 'IN' },
  { prefix: 'VT', country: 'India', iso2: 'IN' },
  { prefix: 'VU', country: 'India', iso2: 'IN' },

  // Pakistan (AP–AS)
  { prefix: 'AP', country: 'Pakistan', iso2: 'PK' },
  { prefix: 'AQ', country: 'Pakistan', iso2: 'PK' },
  { prefix: 'AR', country: 'Pakistan', iso2: 'PK' },
  { prefix: 'AS', country: 'Pakistan', iso2: 'PK' },

  // Canada (VA–VG, VE, VO, VY)
  { prefix: 'VA', country: 'Canada', iso2: 'CA' },
  { prefix: 'VB', country: 'Canada', iso2: 'CA' },
  { prefix: 'VC', country: 'Canada', iso2: 'CA' },
  { prefix: 'VD', country: 'Canada', iso2: 'CA' },
  { prefix: 'VE', country: 'Canada', iso2: 'CA' },
  { prefix: 'VF', country: 'Canada', iso2: 'CA' },
  { prefix: 'VG', country: 'Canada', iso2: 'CA' },
  { prefix: 'VO', country: 'Canada', iso2: 'CA' },
  { prefix: 'VY', country: 'Canada', iso2: 'CA' },

  // Mexico (XE–XI)
  { prefix: 'XE', country: 'Mexico', iso2: 'MX' },
  { prefix: 'XF', country: 'Mexico', iso2: 'MX' },
  { prefix: 'XG', country: 'Mexico', iso2: 'MX' },
  { prefix: 'XH', country: 'Mexico', iso2: 'MX' },
  { prefix: 'XI', country: 'Mexico', iso2: 'MX' },

  // Japan (JA–JS, 7J–7N)
  { prefix: 'JA', country: 'Japan', iso2: 'JP' },
  { prefix: 'JB', country: 'Japan', iso2: 'JP' },
  { prefix: 'JC', country: 'Japan', iso2: 'JP' },
  { prefix: 'JD', country: 'Japan', iso2: 'JP' },
  { prefix: 'JE', country: 'Japan', iso2: 'JP' },
  { prefix: 'JF', country: 'Japan', iso2: 'JP' },
  { prefix: 'JG', country: 'Japan', iso2: 'JP' },
  { prefix: 'JH', country: 'Japan', iso2: 'JP' },
  { prefix: 'JI', country: 'Japan', iso2: 'JP' },
  { prefix: 'JJ', country: 'Japan', iso2: 'JP' },
  { prefix: 'JK', country: 'Japan', iso2: 'JP' },
  { prefix: 'JL', country: 'Japan', iso2: 'JP' },
  { prefix: 'JM', country: 'Japan', iso2: 'JP' },
  { prefix: 'JN', country: 'Japan', iso2: 'JP' },
  { prefix: 'JO', country: 'Japan', iso2: 'JP' },
  { prefix: 'JP', country: 'Japan', iso2: 'JP' },
  { prefix: 'JQ', country: 'Japan', iso2: 'JP' },
  { prefix: 'JR', country: 'Japan', iso2: 'JP' },
  { prefix: 'JS', country: 'Japan', iso2: 'JP' },
  { prefix: '7J', country: 'Japan', iso2: 'JP' },
  { prefix: '7K', country: 'Japan', iso2: 'JP' },
  { prefix: '7L', country: 'Japan', iso2: 'JP' },
  { prefix: '7M', country: 'Japan', iso2: 'JP' },
  { prefix: '7N', country: 'Japan', iso2: 'JP' },

  // South Korea (HL, 6K–6N; DS–DT, D7–D9 handled above)
  { prefix: 'HL', country: 'South Korea', iso2: 'KR' },
  { prefix: '6K', country: 'South Korea', iso2: 'KR' },
  { prefix: '6L', country: 'South Korea', iso2: 'KR' },
  { prefix: '6M', country: 'South Korea', iso2: 'KR' },
  { prefix: '6N', country: 'South Korea', iso2: 'KR' },

  // China (BA, BD, BG–BN, BT, BY; BU, BV, BX = Taiwan)
  { prefix: 'BA', country: 'China', iso2: 'CN' },
  { prefix: 'BD', country: 'China', iso2: 'CN' },
  { prefix: 'BG', country: 'China', iso2: 'CN' },
  { prefix: 'BH', country: 'China', iso2: 'CN' },
  { prefix: 'BI', country: 'China', iso2: 'CN' },
  { prefix: 'BJ', country: 'China', iso2: 'CN' },
  { prefix: 'BK', country: 'China', iso2: 'CN' },
  { prefix: 'BL', country: 'China', iso2: 'CN' },
  { prefix: 'BM', country: 'China', iso2: 'CN' },
  { prefix: 'BN', country: 'China', iso2: 'CN' },
  { prefix: 'BT', country: 'China', iso2: 'CN' },
  { prefix: 'BY', country: 'China', iso2: 'CN' },

  // Taiwan
  { prefix: 'BU', country: 'Taiwan', iso2: 'TW' },
  { prefix: 'BV', country: 'Taiwan', iso2: 'TW' },
  { prefix: 'BX', country: 'Taiwan', iso2: 'TW' },

  // Australia
  { prefix: 'VK', country: 'Australia', iso2: 'AU' },

  // New Zealand (ZL, ZM)
  { prefix: 'ZL', country: 'New Zealand', iso2: 'NZ' },
  { prefix: 'ZM', country: 'New Zealand', iso2: 'NZ' },

  // Brazil (PP–PX, PY, ZV–ZZ)
  { prefix: 'PP', country: 'Brazil', iso2: 'BR' },
  { prefix: 'PQ', country: 'Brazil', iso2: 'BR' },
  { prefix: 'PR', country: 'Brazil', iso2: 'BR' },
  { prefix: 'PS', country: 'Brazil', iso2: 'BR' },
  { prefix: 'PT', country: 'Brazil', iso2: 'BR' },
  { prefix: 'PU', country: 'Brazil', iso2: 'BR' },
  { prefix: 'PV', country: 'Brazil', iso2: 'BR' },
  { prefix: 'PW', country: 'Brazil', iso2: 'BR' },
  { prefix: 'PX', country: 'Brazil', iso2: 'BR' },
  { prefix: 'PY', country: 'Brazil', iso2: 'BR' },
  { prefix: 'ZV', country: 'Brazil', iso2: 'BR' },
  { prefix: 'ZW', country: 'Brazil', iso2: 'BR' },
  { prefix: 'ZX', country: 'Brazil', iso2: 'BR' },
  { prefix: 'ZY', country: 'Brazil', iso2: 'BR' },
  { prefix: 'ZZ', country: 'Brazil', iso2: 'BR' },

  // Argentina (AY, AZ, LU, LW)
  { prefix: 'AY', country: 'Argentina', iso2: 'AR' },
  { prefix: 'AZ', country: 'Argentina', iso2: 'AR' },
  { prefix: 'LU', country: 'Argentina', iso2: 'AR' },
  { prefix: 'LW', country: 'Argentina', iso2: 'AR' },

  // Chile (CA–CE, XQ–XR)
  { prefix: 'CA', country: 'Chile', iso2: 'CL' },
  { prefix: 'CB', country: 'Chile', iso2: 'CL' },
  { prefix: 'CC', country: 'Chile', iso2: 'CL' },
  { prefix: 'CD', country: 'Chile', iso2: 'CL' },
  { prefix: 'CE', country: 'Chile', iso2: 'CL' },
  { prefix: 'XQ', country: 'Chile', iso2: 'CL' },
  { prefix: 'XR', country: 'Chile', iso2: 'CL' },

  // Colombia (HJ, HK, 5J, 5K)
  { prefix: 'HJ', country: 'Colombia', iso2: 'CO' },
  { prefix: 'HK', country: 'Colombia', iso2: 'CO' },
  { prefix: '5J', country: 'Colombia', iso2: 'CO' },
  { prefix: '5K', country: 'Colombia', iso2: 'CO' },

  // Venezuela (YV–YY, 4M)
  { prefix: 'YV', country: 'Venezuela', iso2: 'VE' },
  { prefix: 'YW', country: 'Venezuela', iso2: 'VE' },
  { prefix: 'YX', country: 'Venezuela', iso2: 'VE' },
  { prefix: 'YY', country: 'Venezuela', iso2: 'VE' },
  { prefix: '4M', country: 'Venezuela', iso2: 'VE' },

  // Peru (OA–OC)
  { prefix: 'OA', country: 'Peru', iso2: 'PE' },
  { prefix: 'OB', country: 'Peru', iso2: 'PE' },
  { prefix: 'OC', country: 'Peru', iso2: 'PE' },

  // Ecuador (HC, HD)
  { prefix: 'HC', country: 'Ecuador', iso2: 'EC' },
  { prefix: 'HD', country: 'Ecuador', iso2: 'EC' },

  // Indonesia (YB–YH, 7A–7I)
  { prefix: 'YB', country: 'Indonesia', iso2: 'ID' },
  { prefix: 'YC', country: 'Indonesia', iso2: 'ID' },
  { prefix: 'YD', country: 'Indonesia', iso2: 'ID' },
  { prefix: 'YE', country: 'Indonesia', iso2: 'ID' },
  { prefix: 'YF', country: 'Indonesia', iso2: 'ID' },
  { prefix: 'YG', country: 'Indonesia', iso2: 'ID' },
  { prefix: 'YH', country: 'Indonesia', iso2: 'ID' },
  { prefix: '7A', country: 'Indonesia', iso2: 'ID' },
  { prefix: '7B', country: 'Indonesia', iso2: 'ID' },
  { prefix: '7C', country: 'Indonesia', iso2: 'ID' },
  { prefix: '7D', country: 'Indonesia', iso2: 'ID' },
  { prefix: '7E', country: 'Indonesia', iso2: 'ID' },
  { prefix: '7F', country: 'Indonesia', iso2: 'ID' },
  { prefix: '7G', country: 'Indonesia', iso2: 'ID' },
  { prefix: '7H', country: 'Indonesia', iso2: 'ID' },
  { prefix: '7I', country: 'Indonesia', iso2: 'ID' },

  // Thailand (HS, E2)
  { prefix: 'HS', country: 'Thailand', iso2: 'TH' },
  { prefix: 'E2', country: 'Thailand', iso2: 'TH' },

  // Vietnam (3W, XV)
  { prefix: '3W', country: 'Vietnam', iso2: 'VN' },
  { prefix: 'XV', country: 'Vietnam', iso2: 'VN' },

  // Malaysia (9M)
  { prefix: '9M', country: 'Malaysia', iso2: 'MY' },

  // Singapore (9V)
  { prefix: '9V', country: 'Singapore', iso2: 'SG' },

  // Israel (4X, 4Z)
  { prefix: '4X', country: 'Israel', iso2: 'IL' },
  { prefix: '4Z', country: 'Israel', iso2: 'IL' },

  // Saudi Arabia (HZ, 7Z, 8Z)
  { prefix: 'HZ', country: 'Saudi Arabia', iso2: 'SA' },
  { prefix: '7Z', country: 'Saudi Arabia', iso2: 'SA' },
  { prefix: '8Z', country: 'Saudi Arabia', iso2: 'SA' },

  // United Arab Emirates
  { prefix: 'A6', country: 'United Arab Emirates', iso2: 'AE' },

  // Jordan
  { prefix: 'JY', country: 'Jordan', iso2: 'JO' },

  // South Africa (ZR–ZU)
  { prefix: 'ZR', country: 'South Africa', iso2: 'ZA' },
  { prefix: 'ZS', country: 'South Africa', iso2: 'ZA' },
  { prefix: 'ZT', country: 'South Africa', iso2: 'ZA' },
  { prefix: 'ZU', country: 'South Africa', iso2: 'ZA' },

  // Egypt
  { prefix: 'SU', country: 'Egypt', iso2: 'EG' },

  // Morocco
  { prefix: 'CN', country: 'Morocco', iso2: 'MA' },

  // Tunisia (3V, TS)
  { prefix: '3V', country: 'Tunisia', iso2: 'TN' },
  { prefix: 'TS', country: 'Tunisia', iso2: 'TN' },

  // ── 1-character prefixes (least specific – fallback) ─────────────────────
  { prefix: 'B', country: 'China', iso2: 'CN' },
  { prefix: 'F', country: 'France', iso2: 'FR' },
  { prefix: 'G', country: 'England', iso2: 'GB' },
  { prefix: 'I', country: 'Italy', iso2: 'IT' },
  { prefix: 'K', country: 'United States', iso2: 'US' },
  { prefix: 'M', country: 'England', iso2: 'GB' },
  { prefix: 'N', country: 'United States', iso2: 'US' },
  { prefix: 'R', country: 'Russia', iso2: 'RU' },
  { prefix: 'W', country: 'United States', iso2: 'US' },
]

export interface DxccResult {
  country: string
  iso2?: string
}

/**
 * Derive the DXCC country from a callsign using ITU prefix allocation.
 * Strips portable suffixes (/P, /MM, /QRP, etc.) before matching.
 * Returns undefined for unrecognised prefixes.
 */
export function lookupDxcc(callsign: string): DxccResult | undefined {
  if (!callsign) return undefined
  const base = callsign.split('/')[0].toUpperCase()
  for (let len = Math.min(base.length, 4); len >= 1; len--) {
    const prefix = base.slice(0, len)
    const entry = DXCC_PREFIXES.find((e) => e.prefix === prefix)
    if (entry) return { country: entry.country, iso2: entry.iso2 }
  }
  return undefined
}

/**
 * Convert an ISO 3166-1 alpha-2 country code to the corresponding flag emoji.
 * E.g. 'DE' → '🇩🇪'
 */
export function toFlagEmoji(iso2: string): string {
  return [...iso2.toUpperCase()]
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join('')
}
