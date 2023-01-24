import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'

type FormControllerProps = {
  page: string
}

const FormController = ({ page }: FormControllerProps) => {
  return (
    <div className='mx-auto flex w-full max-w-lg flex-col'>
      <h1 className='mb-4 text-center text-2xl font-semibold capitalize'>
        {page}
      </h1>
      {page === 'login' ? <LoginForm /> : null}
      {page === 'register' ? <RegisterForm /> : null}
    </div>
  )
}

export default FormController
