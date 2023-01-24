import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../context/useAuthStore'
import { RegisterInputProps, registerSchema } from '../schemas/user.schemas'

const RegisterForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<RegisterInputProps>({ resolver: zodResolver(registerSchema) })

  const { register: signup, error } = useAuthStore()
  const navigate = useNavigate()

  const onSubmit = async (data: RegisterInputProps) => {
    console.log(data)
    signup(data)
    if (error) {
      return
    } else {
      navigate('/login')
    }
  }

  return (
    <form className='flex flex-col' onSubmit={handleSubmit(onSubmit)}>
      <div className='relative mb-5'>
        <label className='text-sm leading-7'>Name</label>
        <input
          className='w-full rounded-md border border-slate-400 bg-slate-600 px-2 py-1 leading-8 text-neutral-100 outline-none transition-colors duration-300 ease-in-out focus:border-indigo-500 focus:ring-2 focus:ring-indigo-800'
          type='text'
          {...register('name')}
        />
        {errors.name ? (
          <div className='absolute mt-1 flex items-center justify-center gap-x-2 text-xs text-red-500'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-4 w-4 flex-shrink-0 stroke-current'
              fill='none'
              viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'></path>
            </svg>
            <span>{errors.name?.message}</span>
          </div>
        ) : null}
      </div>
      <div className='relative mb-5'>
        <label className='text-sm leading-7'>Email</label>
        <input
          className='w-full rounded-md border border-slate-400 bg-slate-600 px-2 py-1 leading-8 text-neutral-100 outline-none transition-colors duration-300 ease-in-out focus:border-indigo-500 focus:ring-2 focus:ring-indigo-800'
          type='text'
          {...register('email')}
        />
        {errors.email ? (
          <div className='absolute mt-1 flex items-center justify-center gap-x-2 text-xs text-red-500'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-4 w-4 flex-shrink-0 stroke-current'
              fill='none'
              viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'></path>
            </svg>
            <span>{errors.email?.message}</span>
          </div>
        ) : null}
      </div>
      <div className='relative mb-5'>
        <label className='text-sm leading-7'>Password</label>
        <input
          className='w-full rounded-md border border-slate-400 bg-slate-600 px-2 py-1 leading-8 text-neutral-100 outline-none transition-colors duration-300 ease-in-out focus:border-indigo-500 focus:ring-2 focus:ring-indigo-800'
          type='text'
          {...register('password')}
        />
        {errors.password ? (
          <div className='absolute mt-1 flex items-center justify-center gap-x-2 text-xs text-red-500'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-4 w-4 flex-shrink-0 stroke-current'
              fill='none'
              viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'></path>
            </svg>
            <span>{errors.password?.message}</span>
          </div>
        ) : null}
      </div>
      <div className='relative mb-5'>
        <label className='text-sm leading-7'>Confirm Password</label>
        <input
          className='w-full rounded-md border border-slate-400 bg-slate-600 px-2 py-1 leading-8 text-neutral-100 outline-none transition-colors duration-300 ease-in-out focus:border-indigo-500 focus:ring-2 focus:ring-indigo-800'
          type='text'
          {...register('passwordConfirmation')}
        />
        {errors.passwordConfirmation ? (
          <div className='absolute mt-1 flex items-center justify-center gap-x-2 text-xs text-red-500'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-4 w-4 flex-shrink-0 stroke-current'
              fill='none'
              viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'></path>
            </svg>
            <span>{errors.passwordConfirmation?.message}</span>
          </div>
        ) : null}
      </div>
      <input
        type='submit'
        value='Sign Up'
        className='mt-4 w-1/2 cursor-pointer self-center rounded-lg bg-slate-600 p-4 text-neutral-100 transition-colors duration-300 ease-in-out hover:bg-indigo-500'
      />
      {error ? (
        <div className='mt-1 flex items-center justify-center gap-x-2 text-xs text-red-500'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-4 w-4 flex-shrink-0 stroke-current'
            fill='none'
            viewBox='0 0 24 24'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'></path>
          </svg>
          <span>{error}</span>
        </div>
      ) : null}
    </form>
  )
}

export default RegisterForm
