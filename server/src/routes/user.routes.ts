import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import {
  getUsersController,
  registerUserController,
  userLoginController
} from '../controllers/user.controllers'
import { loginSchema, userSchema } from '../schemas/user.schemas'

export async function userRoutes(server: FastifyInstance) {
  server.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/register',
    schema: {
      body: userSchema
    },
    handler: registerUserController
  })

  server.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/login',
    schema: {
      body: loginSchema
    },
    handler: userLoginController
  })

  server.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/',
    handler: getUsersController
  })
}
