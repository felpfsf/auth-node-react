import { Link } from 'react-router-dom'
import useAuthStore from '../context/useAuthStore'

const Home = () => {
  const { isAuthenticated, user } = useAuthStore()
  return (
    <div className='mx-auto flex h-screen w-full max-w-[1440px] items-center justify-center gap-16 px-5 py-24'>
      <Link
        to={'/register'}
        className='flex w-24 items-center justify-center border py-2 px-4 duration-300 ease-in-out hover:bg-neutral-100 hover:text-neutral-900'>
        Registrar
      </Link>
      <Link
        to={'/login'}
        className='flex w-24 items-center justify-center border py-2 px-4 duration-300 ease-in-out hover:bg-neutral-100 hover:text-neutral-900'>
        Login
      </Link>
    </div>
  )
}

export default Home
