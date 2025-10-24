import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged, signOut, User } from 'firebase/auth'
import { ShoppingCart, Stethoscope } from 'lucide-react'
import FeaturedProducts from '../Products/page'
import Doctors from '../Doctors/page'

const menuOption = [
  { name: 'Home', path: '/' },
  { name: 'Products', path: '/Products' },
  { name: 'Doctors', path: '/Doctors' },
  { name: 'Orders', path: '/my-Orders' },
  { name: 'Seller', path: '/Seller' },
  { name: 'About', path: '/AboutPage' },
]

function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Paths where menu items should be hidden
  const hiddenMenuPaths = ['/Verify/login', '/Verify/resister']
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
    setDropdownOpen(false)
    router.push('/Verify/login')
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

      {/* Center: Menu Options - Only show if not on login/register pages */}
      {shouldShowMenuItems && (
        <div className='flex items-center gap-6 justify-center flex-1'>
          {menuOption.map((menu, index) => (
            <Link href={menu.path} key={index}>
              <h2 className='text-lg hover:scale-110 transition-all hover:text-green-600'>{menu.name}</h2>
            </Link>
          ))}
        </div>
      )}

      {/* Right: Doctor Icon, Cart Icon and User Profile */}
      <div className='flex items-center gap-4 justify-end flex-1 relative'>
        {/* Doctor Icon (routes to /Doctor-Consult) */}
        <Link href='/Doctor-Consult' className='relative' aria-label='Doctor Consult' title='Doctor Consult'>
          <Stethoscope
            size={24}
            className='text-gray-700 hover:text-green-600 transition-colors cursor-pointer'
          />
        </Link>

        {/* Cart Icon */}
        <Link href='/Cart' className='relative' aria-label='Cart' title='Cart'>
          <ShoppingCart
            size={24}
            className='text-gray-700 hover:text-green-600 transition-colors cursor-pointer'
          />
          {/* Optional: Cart item count badge */}
          {/* <span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
            3
          </span> */}
        </Link>

        {/* User Profile Icon Dropdown */}
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className='focus:outline-none'
        >
          <img
            src={user?.photoURL || '/profile.png'}
            alt='Profile'
            className='rounded-full w-8 h-8 border-2 border-green-400'
          />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded shadow-lg z-10">
            <ul>
              {!user ? (
                <>
                  <li>
                    <Link href="/Verify/login">
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Login
                      </button>
                    </Link>
                  </li>
                  <li>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 cursor-not-allowed text-gray-400"
                      disabled
                      title="No accounts to switch"
                    >
                      Switch Account
                    </button>
                  </li>
                  <li>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Cancel
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </li>
                  <li>
                    <Link href="/Verify/login">
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Switch Account
                      </button>
                    </Link>
                  </li>
                  <li>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Cancel
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default Navbar
