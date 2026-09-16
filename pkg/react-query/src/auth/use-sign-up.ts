import { authClient } from '@repo/api'
import { type SignUpValidation } from '@repo/validations/sign-up-validation'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router'

export const useSignUp = () => {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: async (input: SignUpValidation) => {
      const res = await authClient.signUp.email(input)

      if (res.error) throw new Error(res.error.message)

      return res
    },
    onSuccess: () => navigate('/dashboard')
  })
}
