import { server } from './lib/fastify'
import cors from '@fastify/cors'
import {
  serializerCompiler,
  validatorCompiler
} from 'fastify-type-provider-zod'
import jwt from '@fastify/jwt'
import { userRoutes } from './routes/user.routes'


async function main() {
  server.register(cors, { origin: true })

  await server.register(jwt, {
    secret: process.env.JWT_SECRET as string
  })

  server.setValidatorCompiler(validatorCompiler)
  server.setSerializerCompiler(serializerCompiler)

  server.setErrorHandler((error, request, reply) => {
    const toSend = {
      message: 'Validation error',
      errors: JSON.parse(error.message),
      statusCode: error.statusCode || 500
    }

    reply.code(toSend.statusCode).send(toSend)
  })

  await server.register(userRoutes, { prefix: '/users' })

  await server.listen({ port: 3333 })
}

main()
