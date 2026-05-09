'use client'

import { Bell, Search, User, LayoutDashboard, X, Check } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { formatRelativeTime } from '@/lib/utils'

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuthStore()
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotificationStore()
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)

  const isActive = pathname === '/dashboard'

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false)
      }
    }

    if (isNotificationOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isNotificationOpen])

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id)
    if (notification.orderId) {
      router.push(`/dashboard/orders/${notification.orderId}`)
      setIsNotificationOpen(false)
    }
  }

  const unreadNotifications = notifications.filter((n) => !n.read)

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-20 shadow-sm shadow-slate-200/50">
      <div className="flex items-center space-x-4">
        <Link
          href="/dashboard"
          className={`flex items-center space-x-3 px-5 py-2.5 rounded-2xl border transition-all duration-300 pointer-events-auto group shadow-sm ${isActive
              ? 'bg-primary border-primary shadow-primary/20 text-white'
              : 'bg-slate-50/50 border-slate-100 shadow-slate-100/20 text-slate-800 hover:bg-white hover:shadow-md hover:shadow-primary/5'
            }`}
        >
          <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-white/20' : 'bg-primary/10 group-hover:bg-primary/20'
            }`}>
            <LayoutDashboard className={`w-5 h-5 ${isActive ? 'text-white' : 'text-primary'}`} />
          </div>
          <div>
            <h1 className={`text-lg font-bold tracking-tight leading-none mb-1 transition-colors ${isActive ? 'text-white' : 'text-slate-800'
              }`}>
              System Dashboard
            </h1>
            <p className={`text-[10px] font-medium uppercase tracking-widest transition-colors ${isActive ? 'text-white/70' : 'text-slate-400'
              }`}>
              Management Overview
            </p>
          </div>
        </Link>
      </div>

      <div className="flex items-center space-x-6">
        <div className="h-10 w-[1px] bg-slate-200 hidden md:block"></div>

        {/* Notification Bell */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="relative p-3 text-slate-500 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all duration-200"
          >
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 max-h-[600px] flex flex-col">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={() => {
                      markAllAsRead()
                    }}
                    className="text-xs text-primary hover:text-primary-dark font-semibold"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="overflow-y-auto max-h-[500px]">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm font-medium">No notifications</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer ${
                          !notification.read ? 'bg-blue-50/50' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-bold text-slate-800 truncate">
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 mb-2 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">
                              {formatRelativeTime(notification.timestamp)}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              removeNotification(notification.id)
                            }}
                            className="p-1 text-slate-400 hover:text-slate-600 flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-3 border-t border-slate-200 bg-slate-50">
                  <button
                    onClick={() => {
                      useNotificationStore.getState().clearNotifications()
                    }}
                    className="text-xs text-slate-500 hover:text-slate-700 font-medium w-full text-center"
                  >
                    Clear all notifications
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3 pl-4 border-l border-slate-100">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white shadow-md shadow-primary/20 border border-white/20">
            <User className="w-6 h-6" />
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-bold text-slate-800">{user?.name || 'Administrator'}</p>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-tighter">{user?.email || 'CampusBite Authority'}</p>
          </div>
        </div>
      </div>
    </header>
  )
}

