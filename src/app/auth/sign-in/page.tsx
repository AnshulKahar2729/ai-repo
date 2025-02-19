import React, {FC} from 'react'
import LoginForm from '~/components/login-form';

interface pageProps {

}
const page : FC<pageProps> = ({}) => {
  return (
    <div className='h-screen w-full flex items-center justify-center mx-auto'>
      <LoginForm/>
    </div>
  )
}

export default page;