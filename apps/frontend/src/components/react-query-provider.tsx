import {
  MutationCache,
  QueryClient,
  QueryClientProvider
} from '@tanstack/react-query'
import { useState, type FC, type ReactNode } from 'react'
import { toast } from 'sonner'

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
            toast.error(err.message)
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onSuccess: (data: any) => {
            if ('message' in data) toast.info(data.message)
          }
        })
      })
  )
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
