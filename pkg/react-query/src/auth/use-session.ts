import { useQuery } from '@tanstack/react-query'
import { authClient } from '../lib/auth-client'

export const useSession = () => {
  return useQuery({
    queryKey: ['auth', 'session'],
    queryFn: async () => {
      const res = await authClient.getSession()

      if (res.error) throw new Error(res.error.message)

      return res.data
    }
  })
}
