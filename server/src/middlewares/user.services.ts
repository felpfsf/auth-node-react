import { hashPassword } from '../lib/hashPassword'
import { prisma } from '../lib/prisma'
import { CreateUserSchema } from '../schemas/user.schemas'

export async function createUser(body: CreateUserSchema) {
  const { password, passwordConfirmation, ...rest } = body

  const { hash, salt } = hashPassword(password)

  const data = { password: hash, salt, ...rest }

  // const user = await prisma.user.create({
  //   data
  // })

  // return user
  return await prisma.user.create({
    data
  })

}

export async function findUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: {
      email
    }
  })
}

export async function getUsers() {
  return await prisma.user.findMany()
}
