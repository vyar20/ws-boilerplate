import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { authClient } from '../lib/auth-client'

export const useSignOut = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const res = await authClient.signOut()

      if (res.error) throw new Error(res.error.message)

      return res
    },
    onSuccess: async () => {
      // Clear the cached session before navigating so guards see the
      // signed-out state immediately.
      await queryClient.invalidateQueries({ queryKey: ['auth', 'session'] })
      navigate('/')
    }
  })
}
