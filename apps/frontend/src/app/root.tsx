import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Field, FieldGroup } from '@/components/ui/field'
import { Form } from '@/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSignIn } from '@repo/react-query/auth/use-sign-in'
import { useSignUp } from '@repo/react-query/auth/use-sign-up'
import {
  signInValidation,
  type SignInValidation
} from '@repo/validations/sign-in-validation'
import {
  signUpValidation,
  type SignUpValidation
} from '@repo/validations/sign-up-validation'
import { Loader } from 'lucide-react'
import { useForm } from 'react-hook-form'

export const Root = () => {
  return (
    <div className='flex h-screen w-full flex-col items-center justify-center gap-4'>
      <div className='text-center'>
        <h1 className='font-bold'>
          Welcome to Bun + Workspace + Hono + Better Auth Boilerplate
        </h1>
        <h5 className='text-muted-foreground'>Feel free to fork this repo</h5>
      </div>

      <div className='w-full max-w-xs space-y-4'>
        <Tabs defaultValue='sign-in'>
          <TabsList className='w-full'>
            <TabsTrigger value='sign-in'>Sign In</TabsTrigger>
            <TabsTrigger value='sign-up'>Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value='sign-in' children={<SignIn />} />
          <TabsContent value='sign-up' children={<SignUp />} />
        </Tabs>
      </div>
    </div>
  )
}

const SignIn = () => {
  const { isPending, mutate } = useSignIn()

  const { control, handleSubmit } = useForm<SignInValidation>({
    resolver: zodResolver(signInValidation),
    defaultValues: {
      email: 'test@mail.com',
      password: 'Password1234!'
    }
  })

  const onSubmitHandler = (input: SignInValidation) => mutate(input)

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Please sign in to continue.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmitHandler)}>
          <FieldGroup>
            <Form
              type='email'
              control={control}
              name='email'
              label='Email'
              autoComplete='email'
              placeholder='john.doe@test.com'
            />
            <Form
              type='password'
              control={control}
              name='password'
              label='Password'
              autoComplete='current-password'
              placeholder='Enter your password'
            />

            <Field>
              <Button type='submit' disabled={isPending}>
                {isPending ? <Loader className='animate-spin' /> : 'Sign In'}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}

const SignUp = () => {
  const { isPending, mutate } = useSignUp()

  const { control, handleSubmit } = useForm<SignUpValidation>({
    resolver: zodResolver(signUpValidation),
    defaultValues: {
      name: 'test',
      email: 'test@mail.com',
      password: 'Password1234!'
    }
  })

  const onSubmitHandler = (input: SignUpValidation) => mutate(input)

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>
          Please sign up to continue. <br />
          Keep in mind to use dummy data.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmitHandler)}>
          <FieldGroup>
            <Form
              control={control}
              name='name'
              label='Name'
              placeholder='Enter your name'
            />
            <Form
              type='email'
              control={control}
              name='email'
              label='Email'
              autoComplete='email'
              placeholder='john.doe@test.com'
            />
            <Form
              type='password'
              control={control}
              name='password'
              label='Password'
              autoComplete='current-password'
              placeholder='Enter your password'
            />

            <Field>
              <Button type='submit' disabled={isPending}>
                {isPending ? <Loader className='animate-spin' /> : 'Sign Up'}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
