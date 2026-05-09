'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/lib/api/auth'
import { websocketService } from '@/lib/services/websocket'
import Cookies from 'js-cookie'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, setUser, setLoading, isAuthenticated, isLoading } = useAuthStore()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      // Always check token first - don't rely on Zustand state which may be stale
      const token = Cookies.get('access_token')
      if (!token) {
        // Clear any stale state
        setUser(null)
        setIsChecking(false)
        setLoading(false)
        websocketService.disconnect()
        router.push('/login')
        return
      }

      // Check if WebSocket is using a different token
      const wsToken = websocketService.getCurrentToken()
      if (wsToken && wsToken !== token) {
        // Token changed, disconnect old connection
        websocketService.disconnect()
      }

      try {
        setLoading(true)
        setIsChecking(true)
        // Always validate token by fetching profile
        const userData = await authApi.getProfile()
        // Check if user is admin or superuser
        const isAdmin = userData.userType === 'ADMIN' ||
          (userData as any).isStaff === true ||
          (userData as any).isSuperuser === true

        if (!isAdmin) {
          // Clear state and redirect
          setUser(null)
          setIsChecking(false)
          setLoading(false)
          websocketService.disconnect()
          router.push('/login')
          return
        }
        // Update state with fresh user data
        setUser(userData as any)
        setIsChecking(false)
        setLoading(false)
        
        // Connect WebSocket for real-time notifications
        // Use reconnect() to ensure we use the new token
        setTimeout(() => {
          websocketService.reconnect()
        }, 500)
      } catch (error: any) {
        console.error('Auth check failed:', error)
        console.error('Error details:', error.response?.data || error.message)
        // Clear stale state on error
        setUser(null)
        setIsChecking(false)
        setLoading(false)
        websocketService.disconnect()
        // Redirect on auth error
        if (error.response?.status === 401 || error.response?.status === 403) {
          router.push('/login')
        }
      }
    }

    checkAuth()
    
    // Cleanup WebSocket on unmount
    return () => {
      websocketService.disconnect()
    }
    // Only run on mount - don't depend on Zustand state which may be stale
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Show loading only while checking authentication (not based on isAuthenticated alone)
  if (isChecking || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 bg-slate-50/50">
          <div className="max-w-7xl mx-auto p-8 lg:p-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

