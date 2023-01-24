import { FastifyReply, FastifyRequest } from 'fastify'

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    await request.jwtVerify()
  } catch (error) {
    return reply.send({
      message: error
    })
  }
}