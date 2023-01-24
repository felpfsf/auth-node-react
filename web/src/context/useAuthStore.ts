import { useContext } from 'react'
import { AuthContext } from './AuthProvider'

const useAuthStore = () => {
  const { isAuthenticated, login, logout, user, register, error } =
    useContext(AuthContext)
  return { isAuthenticated, login, logout, user, register, error }
}

export default useAuthStore
