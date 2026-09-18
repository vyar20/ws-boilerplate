import { auth } from '../../api/src/lib/auth'

const createUserAuth = async () => {
  console.log('Start seeding user auth')

  const admin = {
    name: 'Admin 1',
    email: 'admin@example.com',
    password: 'Password1234!'
  }
  await auth.api.signUpEmail({
    body: admin
  })

  await Promise.all(
    Array.from({ length: 1000 }).map(async (_, i) => {
      await auth.api.signUpEmail({
        body: {
          name: `User ${i}`,
          email: `user-${i}@example.com`,
          password: 'Password1234!'
        }
      })
    })
  )

  console.log('Seeding user auth completed')
}

createUserAuth()
