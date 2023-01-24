import Cookies from 'js-cookie'
import jwtDecode from 'jwt-decode'
import React, { createContext, ReactNode, useEffect, useState } from 'react'
import { LoginInputProps, RegisterInputProps } from '../schemas/user.schemas'
import { api } from '../services/axios'

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
