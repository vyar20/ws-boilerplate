import { toast } from '@/components/ui/toast'
import {
  MutationCache,
  QueryClient,
  QueryClientProvider
} from '@tanstack/react-query'
import { useState, type FC, type ReactNode } from 'react'

type ReactQueryProviderProps = {
  children?: ReactNode
}

export const ReactQueryProvider: FC<ReactQueryProviderProps> = ({
  children
}) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        mutationCache: new MutationCache({
          onError: (err) => {
            toast.add({
              type: 'error',
              description: err.message,
              priority: 'high'
            })
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onSuccess: (data: any) => {
            if ('message' in data)
              toast.add({
                type: 'info',
                description: data.message
              })
          }
        })
      })
  )
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
