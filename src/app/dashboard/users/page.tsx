'use client'

import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/api/admin'
import type { User } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { Search, CheckCircle, XCircle, UserCheck, UserX, Bike } from 'lucide-react'
import toast from 'react-hot-toast'

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    userType: 'All',
    isVerified: 'All',
    isRider: 'All',
    search: '',
  })
  const [page, setPage] = useState(1)
  const pageSize = 50

  useEffect(() => {
    loadUsers()
  }, [filters, page])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      const response = await adminApi.getUsers({
        user_type: filters.userType !== 'All' && filters.userType !== 'RIDER' ? filters.userType : undefined,
        is_verified: filters.isVerified !== 'All' ? filters.isVerified === 'Verified' : undefined,
        is_rider: filters.userType === 'RIDER' ? true : (filters.isRider !== 'All' ? filters.isRider === 'Riders Only' : undefined),
        search: filters.search || undefined,
        page,
        page_size: pageSize,
      })
      // Map snake_case to camelCase and handle response structure
      const rawUsers = Array.isArray(response)
        ? response
        : (response as any)?.results || []

      const mappedUsers = rawUsers.map((u: any) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        phone: u.phone,
        userType: u.user_type,
        studentId: u.student_id,
        department: u.department,
        isRider: u.is_rider,
        isVerified: u.is_verified,
        isActive: u.is_active ?? true, // Default to true if missing
        createdAt: u.created_at,
      }))
      setUsers(mappedUsers)
    } catch (error) {
      console.error('Failed to load users:', error)
      toast.error('Failed to load users')
      // Set empty array on error to prevent map errors
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify = async (userId: string) => {
    try {
      await adminApi.verifyUser(userId)
      toast.success('User verified')
      loadUsers()
    } catch (error) {
      toast.error('Failed to verify user')
    }
  }

  const handleToggleActive = async (user: User) => {
    try {
      await adminApi.deactivateUser(user.id, !user.isActive)
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`)
      loadUsers()
    } catch (error) {
      toast.error('Failed to update user')
    }
  }

  const handleToggleRider = async (user: User) => {
    try {
      await adminApi.toggleRiderStatus(user.id, !user.isRider)
      toast.success(`User successfully ${user.isRider ? 'removed from Rider role' : 'made a Rider'}`)
      loadUsers()
    } catch (error) {
      toast.error('Failed to update rider status')
    }
  }

  // Separate admins from normal users, and wrap with local search filter just in case backend search isn't functioning
  const safelyFilteredUsers = users.filter(user => {
    if (!filters.search) return true;
    const q = filters.search.toLowerCase();
    return (
      ((user.name && user.name.toLowerCase().includes(q)) ||
        (user.email && user.email.toLowerCase().includes(q)) ||
        (user.studentId && user.studentId.toLowerCase().includes(q)) ||
        (user.department && user.department.toLowerCase().includes(q))) &&
      (filters.userType !== 'RIDER' || user.isRider === true)
    );
  });

  const regularUsers = safelyFilteredUsers.filter((u) => u.userType !== 'ADMIN')
  const adminUsers = safelyFilteredUsers.filter((u) => u.userType === 'ADMIN')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by email, name, or student ID..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={filters.userType}
            onChange={(e) => setFilters({ ...filters, userType: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="All">All User Types</option>
            <option value="STUDENT">Student</option>
            <option value="FACULTY">Faculty</option>
            {/* <option value="ADMIN">Admin</option> */}
          </select>
          <select
            value={filters.isVerified}
            onChange={(e) => setFilters({ ...filters, isVerified: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="All">All Verification Status</option>
            <option value="Verified">Verified</option>
            <option value="Unverified">Unverified</option>
          </select>
          <select
            value={filters.isRider}
            onChange={(e) => setFilters({ ...filters, isRider: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="All">All Users</option>
            <option value="Riders Only">Riders Only</option>
            <option value="Non-Riders">Non-Riders</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-8">

          {/* Regular Users Table (Moved to Top) */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-3">Regular Users</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID / Dept</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rider</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verified</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {regularUsers.length > 0 ? (
                      regularUsers.map((user) => (
                        <tr
                          key={user.id}
                          className={!user.isActive ? 'bg-red-50/50 opacity-75' : 'hover:bg-gray-50'}
                        >
                          <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {user.userType}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {user.studentId || user.department || '-'}
                          </td>
                          <td className="px-6 py-4">
                            {user.isRider ? (
                              <span className="text-green-600 font-bold text-lg leading-none">✓</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {user.isVerified ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-600" />
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{formatDate(user.createdAt)}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              {/* Toggle Rider Status */}
                              <button
                                onClick={() => handleToggleRider(user)}
                                className={`p-2 rounded-lg transition-colors border border-transparent ${user.isRider
                                  ? 'text-orange-500 hover:bg-orange-50 hover:border-orange-200'
                                  : 'text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200'
                                  }`}
                                title={user.isRider ? 'Remove Rider Privileges' : 'Make User a Rider'}
                              >
                                <Bike className="w-5 h-5" />
                              </button>

                              {!user.isVerified && (
                                <button
                                  onClick={() => handleVerify(user.id)}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-transparent hover:border-green-200"
                                  title="Verify User"
                                >
                                  <UserCheck className="w-5 h-5" />
                                </button>
                              )}
                              <button
                                onClick={() => handleToggleActive(user)}
                                className={`p-2 rounded-lg transition-colors border border-transparent ${user.isActive
                                  ? 'text-red-500 hover:bg-red-50 hover:border-red-200'
                                  : 'text-green-600 hover:bg-green-50 hover:border-green-200'
                                  }`}
                                title={user.isActive ? 'Deactivate Account' : 'Activate Account'}
                              >
                                {user.isActive ? <UserX className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                          {filters.search ? "No users found matching your search." : "No users found in the system."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Admin Table (Moved to Bottom, Collapsible/Dropdown style) */}
          {adminUsers.length > 0 && (
            <div className="pt-6 border-t border-gray-200">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer list-none bg-gray-50 p-4 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-gray-800">System Administrators</h2>
                    <span className="bg-white border border-gray-200 text-gray-600 font-black text-xs px-2 py-0.5 rounded-full">
                      {adminUsers.length}
                    </span>
                  </div>
                  <span className="transform transition-transform text-gray-400 group-open:rotate-180">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>

                <div className="mt-4 bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-indigo-50/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Role</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Verified</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Registration</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {adminUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.email}</td>
                            <td className="px-6 py-4 text-sm font-bold text-gray-900">{user.name}</td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 shadow-sm border border-indigo-200">
                                {user.userType}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {user.isVerified ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-600" />
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">{formatDate(user.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </details>
            </div>
          )}

        </div>
      )}
    </div>
  )
}
