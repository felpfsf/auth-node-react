import { NavLink, useNavigate } from 'react-router-dom'
import useAuthStore from '../context/useAuthStore'

const Navbar = () => {
  const { isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()

  const logoutHandler = () => {
    logout()
    navigate('/login')
    console.log('logout')
  }
  return (
    <div className='mx-auto flex w-5/6 items-center justify-between border-b px-[6%] py-6'>
      <div className='flex gap-4'>
        {/* <NavLink
          to={'/'}
          className={({ isActive }) =>
            isActive ? 'border-b-2' : 'border-b-transparent'
          }>
          Home
        </NavLink> */}
        {!isAuthenticated ? (
          <>
            <NavLink
              to={'/register'}
              className={({ isActive }) =>
                isActive ? 'border-b-2' : 'border-b-transparent'
              }>
              Register
            </NavLink>
            <NavLink
              to={'/login'}
              className={({ isActive }) =>
                isActive ? 'border-b-2' : 'border-b-transparent'
              }>
              Login
            </NavLink>
          </>
        ) : (
          <>
            {/* <NavLink
              to={'/dashboard'}
              className={({ isActive }) =>
                isActive ? 'border-b-2' : 'border-b-transparent'
              }>
              Dashboard
            </NavLink> */}
            <button onClick={logoutHandler}>Logout</button>
          </>
        )}
      </div>
    </div>
  )
}

export default Navbar
