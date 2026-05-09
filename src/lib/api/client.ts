import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'
//'https://your-ngrok-url.ngrok.io/api/v1'
class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = Cookies.get('access_token')
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor - handle errors and token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            // Try to refresh token via API route (since refresh_token is httpOnly)
            const refreshResponse = await fetch('/api/auth/refresh-token', {
              method: 'POST',
            })
            
            if (refreshResponse.ok) {
              const { access } = await refreshResponse.json()
              // Update access token cookie
              Cookies.set('access_token', access, { expires: 1, path: '/' })

              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${access}`
              }

              return this.client(originalRequest)
            } else {
              // Refresh failed, redirect to login
              Cookies.remove('access_token')
              if (typeof window !== 'undefined') {
                window.location.href = '/login'
              }
              return Promise.reject(error)
            }
          } catch (refreshError) {
            // Refresh failed, logout user and redirect
            Cookies.remove('access_token')
            if (typeof window !== 'undefined') {
              window.location.href = '/login'
            }
            return Promise.reject(refreshError)
          }
        }
        
        // If 401 and retry already attempted, redirect to login
        if (error.response?.status === 401 && originalRequest._retry) {
          Cookies.remove('access_token')
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
          return Promise.reject(error)
        }

        // Handle other errors
        if (error.response) {
          const config = error.config as InternalAxiosRequestConfig
          // Skip global toast for login, since the login page has custom error UI
          if (!config.url?.includes('/auth/login')) {
            const message = (error.response.data as any)?.detail || error.message || 'An error occurred'
            toast.error(message)
          }
        }

        return Promise.reject(error)
      }
    )
  }

  async get<T>(url: string, config?: any): Promise<T> {
    const response = await this.client.get<T>(url, config)
    return response.data
  }

  async post<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.post<T>(url, data, config)
    return response.data
  }

  async patch<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.patch<T>(url, data, config)
    return response.data
  }

  async put<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.put<T>(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: any): Promise<T> {
    const response = await this.client.delete<T>(url, config)
    return response.data
  }

  async postFormData<T>(url: string, formData: FormData): Promise<T> {
    const token = Cookies.get('access_token')
    const response = await this.client.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
    return response.data
  }

  async patchFormData<T>(url: string, formData: FormData): Promise<T> {
    const token = Cookies.get('access_token')
    const response = await this.client.patch<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
    return response.data
  }
}

export const apiClient = new ApiClient()

