import { authClient } from '@repo/api'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router'

export const useSignOut = () => {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: async () => {
      const res = await authClient.signOut()

      if (res.error) throw new Error(res.error.message)

      return res
    },
    onSuccess: () => navigate('/')
  })
}
