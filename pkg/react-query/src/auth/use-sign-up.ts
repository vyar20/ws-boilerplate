import { authClient } from '@repo/api'
import { type SignUpValidation } from '@repo/validations/sign-up-validation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'

export const useSignUp = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: SignUpValidation) => {
      const res = await authClient.signUp.email(input)

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
