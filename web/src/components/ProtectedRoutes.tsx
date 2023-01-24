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
