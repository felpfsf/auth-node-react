import { useRouteError } from 'react-router-dom'

type ErrorData = {
  statusText: string
  message: string
}

const NotFound = () => {
  const error = useRouteError() as ErrorData

  console.log(error, typeof error)
  return (
    <div className='mx-auto w-full max-w-[1440px] px-5 py-24'>
      <h1>404 | NotFound</h1>
      <p>
        <i>{error.statusText || error.message}</i>
      </p>
    </div>
  )
}

export default NotFound
