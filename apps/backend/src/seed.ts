import { passwordSchema } from '@repo/validations/sign-in-validation'
import { assertSeedAllowed, generateSeedPassword } from './seed-utils'

const USER_COUNT = 100
// argon2id is deliberately CPU-heavy; hash a few at a time instead of 100 at once.
const BATCH_SIZE = 10

type SeedUser = { name: string; email: string }

const users: SeedUser[] = [
  { name: 'Admin 1', email: 'admin@example.com' },
  ...Array.from({ length: USER_COUNT }, (_, i) => ({
    name: `User ${i}`,
    email: `user-${i}@example.com`
  }))
]

let disconnect: (() => Promise<void>) | undefined

const main = async () => {
  const host = assertSeedAllowed(
    process.env.DATABASE_URL,
    process.env.ALLOW_SEED
  )

  const generated = !process.env.SEED_PASSWORD
  const password = process.env.SEED_PASSWORD ?? generateSeedPassword()
  const check = passwordSchema.safeParse(password)
  if (!check.success)
    throw new Error(
      `SEED_PASSWORD is too weak: ${check.error.issues[0]?.message}`
    )

  // Imported only after the guard passed, so nothing connects to a database
  // we are not allowed to seed.
  const { db } = await import('@repo/db')
  const { auth } = await import('@repo/api/auth')
  disconnect = () => db.$disconnect()

  console.log(`Seeding ${users.length} users into ${host}…`)

  let created = 0
  let skipped = 0

  for (let i = 0; i < users.length; i += BATCH_SIZE) {
    await Promise.all(
      users.slice(i, i + BATCH_SIZE).map(async (user) => {
        const existing = await db.user.findUnique({
          where: { email: user.email },
          select: { id: true }
        })
        if (existing) {
          skipped++
          return
        }

        await auth.api.signUpEmail({ body: { ...user, password } })
        created++
      })
    )
  }

  console.log(
    `Seed done: ${created} created, ${skipped} skipped (already exist).`
  )

  if (generated && created > 0)
    console.log(
      `Generated password for the new seed users (shown once, not stored): ${password}`
    )
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e)
    // exitCode instead of exit() so the finally below can still disconnect.
    process.exitCode = 1
  })
  .finally(() => disconnect?.())
