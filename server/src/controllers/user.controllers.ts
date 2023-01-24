import { FastifyReply, FastifyRequest } from 'fastify'
import { ZodError } from 'zod'
import { server } from '../lib/fastify'
import { verifyPassword } from '../lib/hashPassword'
import { createUser, findUserByEmail, getUsers } from '../middlewares/user.services'
import { CreateUserSchema, LoginSchema } from '../schemas/user.schemas'

export async function registerUserController(
  request: FastifyRequest<{ Body: CreateUserSchema }>,
  reply: FastifyReply
) {
  const body = request.body

  try {
    const temp = await findUserByEmail(body.email)

    if (temp) {
      return reply.status(500).send({
        message: 'User already registered with this email address'
      })
    }

    await createUser(body)

    return reply
      .status(201)
      .send({ message: 'User created with success'})
  } catch (error) {
    console.log(error)
    if (error instanceof ZodError) {
      return reply.status(500).send({
        message: 'Validation Error',
        error: JSON.parse(error.message)
      })
    } else if (error instanceof Error) {
      console.error(error.message)
      return reply.status(500).send({
        message: 'Something went wrong, try again later'
      })
    }
  }
}

export async function userLoginController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const body = request.body as LoginSchema

  const user = await findUserByEmail(body.email)

  if (!user) {
    return reply.status(400).send({
      message: 'User not registered with this email'
    })
  }

  const correctPassword = verifyPassword({
    candidatePassword: body.password,
    hash: user.password,
    salt: user.salt
  })

  if (correctPassword) {
    const { password, salt, ...rest } = user
    const accessToken = server.jwt.sign(rest, { expiresIn: '7d' })

    return reply.status(200).send({
      accessToken
    })
  }

  return reply.status(400).send({
    message: 'Invalid Email por password'
  })
}

export async function getUsersController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const users = await getUsers()

  return users.length > 0
    ? reply.status(200).send({ message: 'Users registered', users })
    : reply.status(404).send({ message: 'No users registered' })
}
