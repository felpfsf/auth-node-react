# Autenticação de usuários: Parte 1 - O Backend

Para este exemplo utilizei node, fastify, @fastify/cors, fastify-jwt, fastify-type-provider-zod, typescript, prisma e zod.

Após instalar as dependências é preciso iniciar o servidor, para isso criei um arquivo dentro da pasta **`src`** chamado **`server.ts`**

```ts
import { server } from './lib/fastify'
import cors from '@fastify/cors'

async function main() {
  server.register(cors, { origin: true })
  await server.listen({ port: 3333 })
}

main()
```

Em `./lib/fastify` exportei uma instância do fastify para poder utilizar em outros lugares além do server. Feito isso partimos para a criação do model de usuários de prisma, para este exemplo eu utilizei o mongodb como banco de dados porém qualquer outro provider servirá.

```prisma
model User {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  email     String   @unique
  name      String
  password  String
  salt      String
  createdAt DateTime @default(now())
}
```

Com o model criado é hora de começar a construir as rotas, mas antes vamos criar um arquivo para exportar a instância do prisma e tornar as coisas um pouco mais práticas.

`./lib/prisma.ts`

```ts
import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient({
  log: ['query']
})

```

Para este exemplo criei somente as rotas para registrar o usuário e efetuar login

`./routes/user.routes.ts`

```ts
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
}
```

Primeiro temos uma função que servirá para exportar todas as rotas criadas. Nela é passada o argumento server que é declarado do tipo FastifyInstance.

```ts
  server.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/register',
    schema: {
      body: userSchema
    },
    handler: registerUserController
  })
```

Essa é a construção básica da rota, nela estou utilizando o ZodTypeProvider para poder importar os schemas do zod que estão em um arquivo externo, eem bo o handler é a função que vai manipular o banco de dados, antes de entrar nesta função vamos aos esquemas do zod.

```ts
export const userSchema = z
  .object({
    name: z.string().min(3, 'Name be at least 3 characters'),
    email: z
      .string()
      .email('Please inform a valid email address')
      .min(1, 'Email is required'),
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
```

Explicando brevemente, defini com o z.object os tipos de entrada de dados e uma mensagem de erro caso os dados não confiram. O método refine() é utilizado aqui para comparar os valores dos password e passwordConfirmation, aceitando apenas se forem iguais.

Estou também criando e exportando a tipagem CreateUserSchema e utilizando o método infer() do zod passando como argumento o objeto userSchema, assim atribuindo o seu tipo à variável. O mesmo é feito para o login tb.

Agora vamos olhar os controllers:
*./controllers/user.controllers.ts*
```ts
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
```

E também o services que abrigam funções que manipulam diretamente o banco de dados
*./middlewares/user.services.ts*
```ts
export async function createUser(body: CreateUserSchema) {
  const { password, passwordConfirmation, ...rest } = body

  const { hash, salt } = hashPassword(password)

  const data = { password: hash, salt, ...rest }

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
```

A função chamada `registerUserController` vai receber o body, ou melhor, o corpo da requisição já recebendo a tipagem criada anteriormente com o zod. Antes de efetuar a criação é necessário checar se há algum usuário registrado com o email fornecido, para isso passo para uma váriável temporária a função findUserByEmail com o email do corpo da requisição como parâmetro. Caso tenha algum registro com o mesmo email uma mensagem de erro é enviada, caso contrário é chamada a função createUser com o body como parâmetro.

Criando o usuário

No argumento da função é declarado que o tipo do body com o type exportado no arquivo com os schemas. Depois é feita uma destruturação para retirar o password e o passwordConfirmation, este último não tem necessidade pois não está no model Users, já o password é utilizado para criar um hash e um salt com o uso da lib nativa crypto. Por medidas de segurança não é recomedado armazenar as senhas "limpas" no banco de dados.

Essa função está em um arquivo separado para manter uma certa organização pq vou usar em mais de um local diferente.

```ts
export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
    .toString('hex')

  return { hash, salt }
}

export function verifyPassword({
  candidatePassword,
  hash,
  salt
}: PasswordProps) {
  const candidateHash = crypto
    .pbkdf2Sync(candidatePassword, salt, 10000, 64, 'sha512')
    .toString('hex')

  const result = candidateHash === hash

  return result
}
```

`hashPassword` primeiro cria uma string "salt" para "embaralhar" a senha e em `hash` é utilizado a função crypto com a senha atual, o salt e iterações, por fim é convertido em hexadecimal e enviado de volta junto com salt.

Voltando ao services já com o hash e o salt gerados, armazeno em uma váriavel `data` os valores da requisição juntamente com o hash, nominado corretamente como password e o salt. Após isso no retorno da função é inserido no banco de dados essas informações e voltamos para o controllers.

Como está em um bloco try/catch caso haja algum erro do banco já cairá automaticamente e uma mensagem de erro é enviada mas em caso de sucesso retorno uma resposta de sucesso(201) com uma mensagem.

Efetuando o login do usuário

Primeiro criei uma rota para o login dentro da função de rotas:

```ts
  server.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/login',
    schema: {
      body: loginSchema
    },
    handler: userLoginController
  })
```

É tb uma rota de método post que recebe no body o schema de login criado anteriormente e o handler é a função de controle

```ts
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
```

Dessa vez ao invés de passar declarar o tipo no request eu optei por declarar diretamente na criação da variável body utilizando o `as`(como, em ptBr). Reutilizo a função de encontrar o email para checar se há algum usuário registrado com o email fornecido, caso não haja retorno uma mensagem de erro. Após passar por essa checagem utilizo a função verifyPassword para validar se a senha está correta, como ela foi armazenada criptografada então é necessário comparar os hashs, para isso utilizo 3 valores como parâmetros: a senha digitada, a senha(hash) e o salt correspondente do usuário.

Então efetuo parte do processo utilizado na criação, no caso estou criando um novo hash usando a senha digitada com o salt do usuário. Por fim comparo o valor do hash gerado com o que está armazenado no banco e retorno o resultado.

Voltando em controllers caso a comparação seja positiva eu gero um token de acesso com as informações do usuário, excluindo a senha(hash) e o salt. Esse token é gerado através da lib "fastify/jwt" com um prazo para expirar de 7 dias. Então retorno esse token na resposta.

Para garantir que o fastify/jwt funcione corretamente com typescript eu criei uma pasta @types e dentro dela um arquivo do tipo `d.ts`, nele declarei uma interface global para o FastifyJWT

```ts
import '@fastify/jwt'
import { JWT } from '@fastify/jwt'

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: {
      id: string
      name: string
      email: string
    }
  }
}
```

Agora é necessário atualizar o arquivo server

```ts
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
```

Primeiro criei uma configuração para o jwt utilizando um `secret`, ou seja, uma chave para o token que será gerado. Essa chave pode ser uma string simples mas mantenha armazenada em um arquivo `env` por mediddas de segurança.

NOTA: Para gerar uma chave boa recomendo utilizar o comando `openssl rand -base64 32`, não funciona no terminal do windows mas pode rodar via gitBASH sem problemas.

Em `setValidatorCompiler` e `setSerializerCompiler` importo as configurações de `fastify-type-provider-zod`, essa lib serve para gerenciar melhor os schemas do zod.

O bloco setErrorHandler serve para formatar corretamente as mensagens de erro, isso ocorria pq a lib não possui uma formatação padrão e ocasionava alguns problemas de visualização.

Por fim as rotas são registradas através daquela função, tb passei um prefixo de `/users` para todas as rotas dessa função, ou seja, tudo relacionado a users terá uma rota assim `http://localhost:3333/users`

Dessa forma a etapa do backend está concluída, agora vamos para o frontend.