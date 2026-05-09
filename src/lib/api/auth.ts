import { apiClient } from './client'
import Cookies from 'js-cookie'

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  access: string
  refresh: string
  user: {
    id: string
    email: string
    name: string
    userType: string
    isStaff?: boolean
    isSuperuser?: boolean
    [key: string]: any // Allow additional properties
  }
}

export const authApi = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiClient.post<any>('/auth/login/', credentials)
    
    // Backend returns { user, tokens: { access, refresh } }
    const tokens = response.tokens || {}
    const userData = response.user || {}
    
    // Transform snake_case to camelCase to match TypeScript interface
    const user = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      userType: userData.user_type || userData.userType, // Handle both formats
      studentId: userData.student_id,
      department: userData.department,
      phone: userData.phone,
      isRider: userData.is_rider || false,
      isVerified: userData.is_verified || false,
      isActive: userData.is_active !== undefined ? userData.is_active : true,
      isStaff: userData.is_staff || false,
      isSuperuser: userData.is_superuser || false,
      createdAt: userData.created_at,
    }
    
    // Store tokens via API route (access_token as regular cookie, refresh_token as httpOnly)
    await fetch('/api/auth/set-tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access: tokens.access,
        refresh: tokens.refresh,
      }),
    })
    
    // Also store access token in regular cookie for immediate client access
    Cookies.set('access_token', tokens.access, { expires: 1, path: '/' })

    return {
      access: tokens.access,
      refresh: tokens.refresh,
      user: user,
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout/')
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      // Clear cookies via API route
      await fetch('/api/auth/clear-tokens', { method: 'POST' })
      Cookies.remove('access_token')
      Cookies.remove('refresh_token')
    }
  },

  async getProfile() {
    const userData = await apiClient.get<any>('/auth/profile/')
    
    // Transform snake_case to camelCase to match TypeScript interface
    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      userType: userData.user_type || userData.userType,
      studentId: userData.student_id,
      department: userData.department,
      phone: userData.phone,
      isRider: userData.is_rider || false,
      isVerified: userData.is_verified || false,
      isActive: userData.is_active !== undefined ? userData.is_active : true,
      isStaff: userData.is_staff || false,
      isSuperuser: userData.is_superuser || false,
      createdAt: userData.created_at,
    }
  },
}

