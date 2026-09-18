import { Button } from '@/components/ui/button'
import { useSession } from '@repo/react-query/auth/use-session'
import { useSignOut } from '@repo/react-query/auth/use-sign-out'
import { Loader } from 'lucide-react'
import type { FC, ReactNode } from 'react'

type DashboardProps = {
  children?: ReactNode
}

export const Dashboard: FC<DashboardProps> = () => {
  const { mutate, isPending } = useSignOut()
  const { data: session } = useSession()

  return (
    <div className='flex h-screen w-full flex-col items-center justify-center gap-4'>
      <pre>{JSON.stringify(session?.user, null, 2)}</pre>

      <Button disabled={isPending} onClick={() => mutate()}>
        {isPending ? <Loader className='animate-spin' /> : 'Sign Out'}
      </Button>
    </div>
  )
}
