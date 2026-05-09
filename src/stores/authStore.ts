import { create } from 'zustand'
import Cookies from 'js-cookie'
import type { User } from '@/lib/types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false, // Start as false, will be set to true only when checking auth
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => {
    // Disconnect WebSocket before clearing tokens
    if (typeof window !== 'undefined') {
      import('@/lib/services/websocket').then(({ websocketService }) => {
        websocketService.disconnect()
      })
    }
    Cookies.remove('access_token')
    Cookies.remove('refresh_token')
    set({ user: null, isAuthenticated: false, isLoading: false })
  },
  clearAuth: () => {
    // Disconnect WebSocket when clearing auth
    if (typeof window !== 'undefined') {
      import('@/lib/services/websocket').then(({ websocketService }) => {
        websocketService.disconnect()
      })
    }
    set({ user: null, isAuthenticated: false, isLoading: false })
  },
}))

// Clear auth state if cookies are missing (e.g., after clearing browser cache)
if (typeof window !== 'undefined') {
  const token = Cookies.get('access_token')
  if (!token) {
    useAuthStore.getState().clearAuth()
  }
}

