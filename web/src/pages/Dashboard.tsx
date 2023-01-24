import { useNavigate } from 'react-router-dom'
import useAuthStore from '../context/useAuthStore'

const Dashboard = () => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const logoutHandler = () => {
    logout()
    navigate('/login')
  }
  return (
    <div className='flex h-screen w-screen flex-col items-center justify-center'>
      <h1 className='text-2xl'>Bem-vindo {user?.name}</h1>
      <button onClick={logoutHandler}>Logout</button>
    </div>
  )
}

export default Dashboard
