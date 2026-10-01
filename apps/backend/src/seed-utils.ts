import { randomInt } from 'node:crypto'

// WHATWG URL keeps the brackets on IPv6 hostnames, so accept both spellings.
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]'])

/**
 * Returns the database host when seeding is allowed, otherwise throws.
 * Only the host is ever put in the message, never the credentials in the URL.
 */
export const assertSeedAllowed = (
  databaseUrl: string | undefined,
  allowSeed: string | undefined
): string => {
  let host: string
  try {
    host = new URL(databaseUrl ?? '').hostname
  } catch {
    throw new Error(
      'Refusing to seed: DATABASE_URL is missing or is not a valid URL.'
    )
  }

  if (!host) throw new Error('Refusing to seed: DATABASE_URL has no host.')

  if (LOCAL_HOSTS.has(host) || allowSeed === 'true') return host

  throw new Error(
    `Refusing to seed: DATABASE_URL points to "${host}", which is not localhost. ` +
      'Set ALLOW_SEED=true to seed it anyway. Never seed a production database.'
  )
}

const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
const LOWER = 'abcdefghijkmnopqrstuvwxyz'
const DIGITS = '23456789'
const SYMBOLS = '!@#$%^&*()-_=+[]{}?'
const ALL = UPPER + LOWER + DIGITS + SYMBOLS

const pick = (chars: string) => chars[randomInt(chars.length)]!

/** Random password that always satisfies passwordSchema (one of each class). */
export const generateSeedPassword = (length = 20): string => {
  const chars = [pick(UPPER), pick(LOWER), pick(DIGITS), pick(SYMBOLS)]
  while (chars.length < length) chars.push(pick(ALL))

  // Fisher-Yates with a CSPRNG so the guaranteed classes are not always first.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1)
    ;[chars[i], chars[j]] = [chars[j]!, chars[i]!]
  }

  return chars.join('')
}
