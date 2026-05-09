'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { authApi } from '@/lib/api/auth'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { setUser } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      const response = await authApi.login(data)

      // Check if user is admin or superuser
      const isAdmin = response.user.userType === 'ADMIN' ||
        (response.user as any).isStaff === true ||
        (response.user as any).isSuperuser === true

      if (!isAdmin) {
        toast.error('Unauthorized: Admin access only')
        setIsLoading(false)
        return
      }

      setUser(response.user as any)
      toast.success('Login successful')
      setTimeout(() => {
        router.push('/dashboard')
      }, 100)
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Invalid email or password.'
      toast.error(errorMsg)
      setError('root.serverError', { type: 'manual', message: errorMsg })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-white font-sans">

      {/* Left Column: Visuals */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-slate-900 flex-col justify-center p-16 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=2000&auto=format&fit=crop"
          alt="Cafeteria backend"
          fill
          className="object-cover opacity-80"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-lg">
          <div className="mb-18">
            <Link href="/" className="inline-block p-3 rounded-2xl shadow-sm">
              <Image src="/logo.png" alt="CampusBite" width={160} height={50} className="object-contain" />
            </Link>
          </div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-black text-white mb-6 leading-tight tracking-tight"
          >
            Manage your campus cafeteria with absolute precision.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-slate-300 text-lg font-medium"
          >
            Access real-time analytics, adjust menu items dynamically, and streamline operations entirely from one powerful dashboard.
          </motion.p>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
      </div>

      {/* Right Column: Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-24 xl:px-32 relative">
        {/* Mobile Logo */}
        <div className="lg:hidden absolute top-8 left-6 sm:left-12">
          <Link href="/">
            <Image src="/logo.png" alt="CampusBite Logo" width={140} height={40} className="object-contain" />
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Staff Login</h1>
            <p className="text-slate-500 font-medium text-sm">Welcome back. Enter your credentials to access the management portal.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            
            {errors.root?.serverError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl font-medium text-sm flex items-center gap-3"
              >
                <span className="shrink-0 w-6 h-6 flex items-center justify-center bg-red-100/50 rounded-full font-bold text-red-500 text-xs">!</span>
                {errors.root.serverError.message}
              </motion.div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-bold text-slate-700">
                Email Address
              </label>
              <div className="relative">
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  className={`block w-full px-4 py-3.5 bg-slate-50 border ${errors.email || errors.root?.serverError ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-primary focus:ring-primary/20'} rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-4 transition-all`}
                  placeholder="admin@campusbite.com"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500 font-bold mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-bold text-slate-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  {...register('password')}
                  type="password"
                  autoComplete="current-password"
                  className={`block w-full px-4 py-3.5 bg-slate-50 border ${errors.password || errors.root?.serverError ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-primary focus:ring-primary/20'} rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-4 transition-all`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 font-bold mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center py-4 px-4 border border-transparent rounded-2xl shadow-xl shadow-primary/20 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Authenticating...
                  </div>
                ) : (
                  'Sign In to Dashboard'
                )}
              </button>
            </div>

            {/* Back to Home Link */}
            <div className="text-center pt-6">
              <Link href="/" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                ← Back to Public Website
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
