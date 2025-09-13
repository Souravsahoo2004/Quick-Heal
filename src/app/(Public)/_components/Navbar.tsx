import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'

const menuOption = [
    {
        name: 'Home',
        path: '/'
    },
    {
        name: 'Products',
        path: '/Products'
    },
    {
        name: 'Doctors',
        path: '/doctors'
    },
    {
        name: 'Orders',
        path: '/orders'
    },
    {
        name: 'Seller',
        path: '/Seller'
    },
]

function Navbar() {
  return (
    <div className='flex items-center px-10 py-4 bg-transparent shadow-md'>
      
      {/* Left: Logo and Name */}
      <div className='flex items-center gap-2 flex-1'>
        <Link href='/' className='flex items-center gap-2'>
          <img src={'logo.svg'} alt='logo' height={30} width={30}/>
          <h2 className='font-bold text-2xl'>Quick Heal</h2> 
        </Link>
      </div>

      {/* Center: Menu Options */}
      <div className='flex items-center gap-6 justify-center flex-1'>
        {menuOption.map((menu, index) => (
          <Link href={menu.path} key={index}>
            <h2 className='text-lg hover:scale-110 transition-all hover:text-green-600'>{menu.name}</h2>
          </Link>    
        ))}
      </div>

      {/* Right: Login Button */}
      <div className='flex justify-end flex-1'>
        <Button>Login</Button>
      </div>
     <div>
        
     </div>
    </div>
  )
}

export default Navbar
