import { authClient } from '@repo/api'
import { type SignInValidation } from '@repo/validations/sign-in-validation'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router'

export const useSignIn = () => {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: async (input: SignInValidation) => {
      const res = await authClient.signIn.email(input)

      if (res.error) throw new Error(res.error.message)

      return res
    },
    onSuccess: () => navigate('/dashboard')
  })
}
