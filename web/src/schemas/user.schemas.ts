import { z } from 'zod'

export const registerSchema = z
  .object({
    name: z.string().min(3, 'Name is required'),
    email: z.string().email().min(1, 'Email is required'),
    password: z.string().min(6, 'Password is required'),
    passwordConfirmation: z.string({
      required_error: 'Password confirmation is required'
    })
  })
  .refine(data => data.password === data.passwordConfirmation, {
    message: 'Passwords do not match',
    path: ['passwordConfirmation']
  })

export type RegisterInputProps = z.infer<typeof registerSchema>

export const loginSchema = z.object({
  email: z.string().email().min(1, 'Email is required'),
  password: z.string().min(6, 'Password is required')
})

export type LoginInputProps = z.infer<typeof loginSchema>
