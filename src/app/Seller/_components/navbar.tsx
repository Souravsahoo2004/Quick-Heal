import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged, signOut, User } from 'firebase/auth'

const menuOption = [
  { name: 'Management', path: '/Seller/Management' },
  { name: 'Orders', path: '/Seller/Orders' },
  { name: 'About', path: '/AboutPage' },
]

function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Hide menu items on specific admin auth pages
  const hiddenMenuPaths = [
    '/Seller/Admin_Verify/Admin_Login',
    '/Seller/Admin_Verify/Admin_Resister',
  ]
  const shouldShowMenuItems = !hiddenMenuPaths.includes(pathname)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
    })
    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    await signOut(auth)
    localStorage.clear()
    sessionStorage.clear()
    router.push('/Seller/Admin_Verify/Admin_Login')
  }

  return (
    <div className='fixed top-0 left-0 right-0 z-50 flex items-center px-10 py-4 bg-white shadow-md'>
      {/* Left: Logo and Name */}
      <div className='flex items-center gap-2 flex-1'>
        <Link href='/' className='flex items-center gap-2'>
          <img src={'/logo.svg'} alt='logo' height={30} width={30} />
          <h2 className='font-bold text-2xl'>Quick Heal</h2>
        </Link>
      </div>

      {/* Center: Menu Options */}
      {shouldShowMenuItems && (
        <div className='flex items-center gap-6 justify-center flex-1'>
          {menuOption.map((menu, index) => (
            <Link href={menu.path} key={index}>
              <h2 className='text-lg hover:scale-110 transition-all hover:text-green-600'>
                {menu.name}
              </h2>
            </Link>
          ))}
        </div>
      )}

      {/* Right: User Profile (click → profile page) */}
      <div className='flex items-center gap-4 justify-end flex-1 relative'>
        <button
          onClick={() => router.push('/Seller/profile')}
          className='focus:outline-none'
          title='Profile'
        >
          <img
            src={user?.photoURL || '/profile.png'}
            alt='Profile'
            className='rounded-full w-8 h-8 border-2 border-green-400 hover:scale-105 transition-transform'
          />
        </button>
      </div>
    </div>
  )
}

export default Navbar
