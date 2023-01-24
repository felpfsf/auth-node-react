import { z } from 'zod'

const userCore = {
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z
    .string()
    .email('Please inform a valid email address')
    .min(1, 'Email is required')
}

export const userSchema = z
  .object({
    ...userCore,
    password: z.string().min(6, 'Password must be at least 6 characters'),
    passwordConfirmation: z.string({ required_error: 'Field is required' })
  })
  .refine(data => data.password === data.passwordConfirmation, {
    message: "Password confirmation doesn't match Password",
    path: ['passwordConfirmation']
  })

export type CreateUserSchema = z.infer<typeof userSchema>

export const loginSchema = z.object({
  email: z
    .string()
    .email('Please inform a valid email address')
    .min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

export type LoginSchema = z.infer<typeof loginSchema>

export const userPathParams = z.object({
  id: z.string()
})

export type UserPathParams = z.infer<typeof userPathParams>
