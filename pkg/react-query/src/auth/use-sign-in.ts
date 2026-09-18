import { authClient } from '@repo/api'
import { type SignInValidation } from '@repo/validations/sign-in-validation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'

export const useSignIn = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: SignInValidation) => {
      const res = await authClient.signIn.email(input)

      if (res.error) throw new Error(res.error.message)

      return res
    },
    onSuccess: async () => {
      // Refresh the cached session before navigating so route guards
      // evaluate against the authenticated state (avoids redirect bounce).
      await queryClient.invalidateQueries({ queryKey: ['auth', 'session'] })
      navigate('/dashboard')
    }
  })
}
