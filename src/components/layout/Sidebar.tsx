'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Utensils,
  ShoppingCart,
  Users,
  DollarSign,
  BarChart3,
  TrendingUp,
  LogOut,
  User,
  FolderOpen,
  Tag,
  Table,
  Calendar,
  MapPin,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api/auth'
import toast from 'react-hot-toast'

const menuItems = [
  { href: '/dashboard/categories', label: 'Categories', icon: FolderOpen },
  { href: '/dashboard/menu', label: 'Menu Items', icon: Utensils },
  { href: '/dashboard/promotions', label: 'Promotions', icon: Tag },
  { href: '/dashboard/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/dashboard/tables', label: 'Tables', icon: Table },
  { href: '/dashboard/table-bookings', label: 'Table Bookings', icon: Calendar },
  { href: '/dashboard/users', label: 'Users', icon: Users },
  { href: '/dashboard/payments', label: 'Payments', icon: DollarSign },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/forecasts', label: 'Forecasts', icon: TrendingUp },
  { href: '/dashboard/location-settings', label: 'Location Settings', icon: MapPin },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleLogout = async () => {
    try {
      await authApi.logout()
      logout()
      router.push('/login')
      toast.success('Logged out successfully')
    } catch (error) {
      toast.error('Logout failed')
    }
  }

  return (
    <div
      className={`sticky top-0 h-screen bg-slate-900 text-white flex flex-col transition-all duration-300 ease-in-out z-30 ${isCollapsed ? 'w-20' : 'w-72'
        }`}
    >
      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 bg-primary text-white p-1 rounded-full border-2 border-slate-900 hover:bg-primary-dark transition-colors z-40"
      >
        <LayoutDashboard className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
      </button>

      <div className={` border-b border-slate-800 flex flex-col items-center ${isCollapsed ? 'px-2' : ''}`}>
        <div className="relative w-full flex justify-center">
          <img
            src="/logo.png"
            alt="Logo"
            className={`object-contain transition-all duration-300 ${isCollapsed ? 'w-24 h-24' : 'h-24 w-auto'
              }`}
          />
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto overflow-x-hidden sidebar-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : ''}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : ''}`} />
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className={`p-4 border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm ${isCollapsed ? 'px-2' : ''}`}>

        <button
          onClick={handleLogout}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-all duration-200 group ${isCollapsed ? 'justify-center px-0' : ''
            }`}
          title={isCollapsed ? 'Logout' : ''}
        >
          <LogOut className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </div>
  )
}

