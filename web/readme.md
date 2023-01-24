# Autenticação de usuários: Parte 2 - O Frontend

Para consumir a API criada anteriormente vou utilizar react, typescript, zod, jwt-decode, js-cookie, axios, react-hook-forms e react-router-dom.

Configurando o React Router Dom v6.4:
`main.tsx`
```ts
const routes = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFound />,
    children: [
      {
        path: '/',
        element: <Home />
      },
      {
        path: '/register',
        element: <Register />
      },
      {
        path: '/login',
        element: <Login />
      }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
      {/* <App /> */}
      <RouterProvider router={routes} />
  </React.StrictMode>
)
```

Através do createBrowserRouter criamos todas as listas de rotas com os endereços(paths) e o elemento (componente) equivalente.

Note que ao invés do App é chamado o componente RouterProvider passando as rotas criadas como props. Agora em App dentro da função retornei um outro componente do router-dom chamado Outlet que vai renderizar todos os filhos(children) do elemento

```ts
function App() {
  return (
      <Outlet />
  )
}
```

## Criando o contexto

Context API é uma forma de compartilhar dados entre os componentes sem precisar ficar passando props manualmente, aqui vou utilizar ele para compartilhar o estado de autenticação do usuário.

Primeiro crio um arquivo chamado AuthProvider.tsx

```ts
interface UserProps {
  id: string
  name: string
  email: string
  bio?: string
  createdAt: Date
}

interface AuthContextProps {
  isAuthenticated: boolean
  user: UserProps | null
  error: null | string
  login: (data: LoginInputProps) => Promise<void>
  register: (data: RegisterInputProps) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: false,
  user: null,
  error: null,
  register: async () => {},
  login: async () => {},
  logout: () => {}
})

```

Aqui estou criando e exportando um contexto passando como argumento a interface com o tipo e formato dos dados que serão compartilhados. Em seguida um objeto com propriedades representando o estado inicial do contexto, elas podem ser alteradas com os componentes que utilizarem o contexto.

Em seguida criei o componente AuthProvider:

```ts
const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<UserProps | null>(null)
  const [error, setError] = useState(null)

  const register = async (data: RegisterInputProps) => {
    await api
      .post('/users/register', data)
      .then(response => {
        console.log(response.data.message)
      })
      .catch(error => {
        console.error('error', error.response.data.message)
        setError(error.response.data.message)
      })
  }

  const login = async (data: any) => {
    await api
      .post('/users/login', data)
      .then(response => {
        const token = response.data.accessToken
        Cookies.set('AccessToken', token, {
          expires: 7,
          secure: true,
          sameSite: 'Lax'
        })
        const decoded = jwtDecode<UserProps>(token)
        setUser(decoded)
        setIsAuthenticated(true)
      })
      .catch(error => {
        setError(error.response.data.message)
      })
  }

  const logout = async () => {
    try {
      Cookies.remove('AccessToken')
      setUser(null)
      setIsAuthenticated(false)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    const token = Cookies.get('AccessToken')
    if (token) {
      const decoded = jwtDecode<UserProps>(token)
      setUser(decoded)
      setIsAuthenticated(true)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, login, logout, user, register, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
```

Esse componente vai fornecer os dados para os outros compoenentes da aplicação através do contexto criando anteriormente.

Primeiro utilizo o `useState` para gerenciar os estados de isAuthenticated(bool), user(nulo ou do tipo obj user) e error(nulo ou um objeto de erro). Logo depois defini as funções para registar, efetuar o login e fazer o logout da aplicação.

Na função de `register` faço uma requisição POST para a API com o axios, enviando os dados de registro, verificando a resposta e caso haja erro exibindo a mensagem já definida no backend.

Na função `login` faço outra requisição POST para a API, enviando os dados de login, em seguida verifico a resposta e armazeno o token no cookie através do uso da lib js-cookie, com o jwt-decode recupero as informações do usuário do token e por fim atualizo o estado de isAuthenticade para true, indicando que está logado no sistema.

A função `logout` remove o token do cookie, altera o estado do usuário para null e dos isAuthenticated para false, tirando a autenticação do usuário do sistema.

O `useEffect` é usado para verificar se o usuário já está logado qdo o componente é carregado, verificando se há algum token no cookie, se sim, decodifica e atualiza para o estado de isAuthenticated para true

Por fim, o componente `AuthProvider` é retornado com o componente AuthContext.Provider envolvendo todos os childrens, passando como valor para o contexto as funções login, logout e register e os estados user, isAuthenticated e error.

Então voltamos em `main.tsx` e envolvemos o componente RouterProvider com o AuthProvider

```ts
...
  <AuthProvider>
    <RouterProvider router={routes} />
  </AuthProvider>
...
```

Em complemento crio um custom hook que exporta uma função permitindo que outros componentes acessem as informações do contexto de forma fácil e organizada.

```ts
import { useContext } from 'react'
import { AuthContext } from './AuthProvider'

const useAuthStore = () => {
  const { isAuthenticated, login, logout, user, register, error } =
    useContext(AuthContext)
  return { isAuthenticated, login, logout, user, register, error }
}

export default useAuthStore
```

A função useAuthStore importa o AuthContext criado anteriormente e usa o useContext do React para acessar suas informações armazenando em constantes, por fim retorna elas como um objeto para serem acessadas em outros componentes.

## Criando as páginas

Para esse projeto criei 3 páginas, uma para o registro, outra para o login e uma para acessar já autenticado.

Para as páginas de registro e login utilizei o `React Hook Form` e o resolver `@hookform/resolvers zod`

De forma geral não é muito diferente configurar a lib, brevemente ela funciona assim:

```tsx
export const RegisterForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterInputProps>({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (data: RegisterInputProps) => {
    console.log(data)
  }
  ...
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Email</label>
        <input
          type='text'
          {...register('email')}
        />
        {errors.email ? (<span>{errors.email?.message}</span>) : null}
      </div>
      <div>
        <label>Password</label>
        <input
          type='text'
          {...register('password')}
        />
        {errors.password ? (<span>{errors.password?.message}</span>) : null}
      </div>
      <input
        type='submit'
        value='Sign In'
        className='...'
      />
      {error ? (<span>{error}</span>) : null}
    </form>
}
```

A função useForm é passada como argumento uma interface que define o formato dos dados que passarão pelo formulário. Além dela é passada tb o resolver zodResolver recebendo como argumento o schema registerSchema, criado com o zod para validar os dados do formulário.

Essa função é destruturada para receber apenas as informções register, que receberá os valores do input, handleSubmit para tratar a ação de onSubmit dos form e formState.errors que contém as informações de erros de validação pelo schema do zod.

A função onSubmit é executada qdo o formulário é enviado, ela recebe como argumento os dados do formulário com a declaração de tipo adequada (LoginInputProps ou RegisterInputProps) e se não houver erros envia os dados para o servidor.

Agora para tratar de enviar os dados para o servidor utilizo o useAuthStore para pegar as informações desejadas e passar elas, por exemplo:

```ts
  const { login, error } = useAuthStore()
  const navigate = useNavigate()

  const onSubmit = async (data: LoginInputProps) => {
    login(data)
    navigate('/dashboard')
  }
```

Destruturando o useAuthStore, utilizei somente a função de login e o estado de error que vem do backend. Dentro da função de onSubmit chamei a função login passando os dados vindo do formulário. Caso ocorra algum erro o erro é exibido alertando ao usuário caso contrário o usuário é direcionado para a página `dashboard` através do useNavigate do react-router-dom

Para fins de demonstração, a página Dashboard é um componente simples que exibe o nome do usuário autenticado e um botão para efeutar o logout:

```tsx
const Header = () => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const logoutHandler = () => {
    logout()
    navigate('/')
  }

  return (
    <div>
      <h1>Bem-vindo {user?.name}</h1>
      <button onClick={logoutHandler}>Logout</button>
    </div>
  )
}

export default Header
```

Novamente utilizo o custom hook useAuthStore para acessar as informações do contexto, desta vez quero somente o objeto user e a função de logout.

Criei uma função para lidar com o logout e assim que executar redireciona o usuário para a home.

Na tela é exibido o nome do usuário acessando a propriedade name do objeto user. O `?` indica que o objeto pode ser null. No botão só uma chamada simples para função de logout.

## Protegendo as rotas

Não faz sentido um usuário não autenticado acessar a página de dashboard, da maneira atual isso pode ocorrer e uma das formas de previnir isso no frontend é criando um componente para proteger essas rotas.

```tsx
import { Route, Routes } from 'react-router-dom'
import useAuthStore from '../context/useAuthStore'
import Login from '../pages/Login'

export const ProtectedRoute = ({
  element,
  ...rest
}: {
  element: JSX.Element
}) => {
  const { isAuthenticated } = useAuthStore()
  return (
    <Routes {...rest}>
      {isAuthenticated ? (
        <Route path='/*' element={element} />
      ) : (
        <Route path='/*' element={<Login />} />
      )}
    </Routes>
  )
}
```

Esse componente importa as funções Routes e Route do react-router-dom, o custom hook useAuthStore e o componente de Login.

O primeiro argumentdo passado é um element do tipo JSX.Element e outras propriedades, dentro da função é destruturado do useAuthStore o estado isAuthenticated.

No retorno é enviado um componente Routes e dentro dele´é verificado se o usuário está autenticado, se estiver é renderizado uma rota que irá mostrar o elemento passado, caso contrário é renderizado uma rota para a página de login.

Por fim, no arquivo main.tsx adicionei a rota para o dashboard e em element importei o componente ProtectedRoute passando o Dashboard como props

```tsx
const routes = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFound />,
    children: [
      {
        path: '/',
        element: <Home />
      },
      {
        path: '/register',
        element: <Register />
      },
      {
        path: '/login',
        element: <Login />
      },
      {
        path: '/dashboard/*',
        element: <ProtectedRoute element={<Dashboard />} />
      }
    ]
  }
])
```

Assim está pronto esse sistema simples de autenticação.