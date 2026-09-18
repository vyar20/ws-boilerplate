import { authClient } from '@repo/api'
import { useQuery } from '@tanstack/react-query'

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
