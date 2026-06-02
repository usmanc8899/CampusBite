'use client'

import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/api/admin'
import type { Order } from '@/lib/types'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'
import { Search, Filter } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Cookies from 'js-cookie'

const statusOptions = [
  'All',
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'ASSIGNED',
  'IN_TRANSIT',
  'DELIVERED',
  'CANCELLED',
]

const paymentStatusOptions = ['All', 'PENDING', 'PAID', 'FAILED']

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: 'All',
    paymentStatus: 'All',
    priority: 'All',
    search: '',
  })
  const [page, setPage] = useState(1)
  const pageSize = 50

  useEffect(() => {
    loadOrders()
  }, [filters, page])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadOrders()
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  // Real-time WebSocket updates for admins
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return

    const token = Cookies.get('access_token')
    if (!token) return

    // Derive WebSocket base URL from API base URL
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'
    const wsBase = apiBase
      .replace(/^http:/, 'ws:')
      .replace(/^https:/, 'wss:')
      .replace(/\/api\/v1\/?$/, '')

    const wsUrl = `${wsBase}/ws/orders/?token=${encodeURIComponent(token)}`
    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      // Optionally log or show debug
      // console.log('Admin WebSocket connected:', wsUrl)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        // We send 'order_update' events from the backend for all orders to 'admins_all' group
        if (data.type === 'order_update') {
          const order: Order = data.data

          // Show a toast for new or updated order
          toast.success(`New / updated order: ${order.orderNumber || order.orderNumber || ''}`)

          // Optionally refresh the list to keep it in sync
          // Only refresh if currently on first page and no active filters (to avoid surprising the user)
          const hasActiveFilters =
            filters.status !== 'All' ||
            filters.paymentStatus !== 'All' ||
            filters.priority !== 'All' ||
            (filters.search || '').trim().length > 0

          if (!hasActiveFilters && page === 1) {
            // Fire and forget; we don't await here inside onmessage
            loadOrders()
          }
        }
      } catch {
        // Ignore malformed messages
      }
    }

    ws.onerror = () => {
      // Silently ignore errors; admin panel still works with polling
    }

    // Keep connection alive with ping
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }))
      }
    }, 30000)

    return () => {
      clearInterval(pingInterval)
      ws.close()
    }
  }, [filters, page])

  const loadOrders = async () => {
    try {
      setIsLoading(true)
      const response = await adminApi.getOrders({
        status: filters.status !== 'All' ? filters.status : undefined,
        payment_status: filters.paymentStatus !== 'All' ? filters.paymentStatus : undefined,
        priority: filters.priority !== 'All' ? filters.priority : undefined,
        search: filters.search || undefined,
        page,
        page_size: pageSize,
      })
      // Handle paginated response or direct array
      const ordersArray = Array.isArray(response)
        ? response
        : (response as any)?.results || []

      const normalizedOrders = ordersArray.map((order: any) => ({
        ...order,
        user: {
          ...order.user,
          userType: order.user?.userType || order.user?.user_type,
        },
      }))

      setOrders(normalizedOrders)
      setTotalCount((response as any)?.count || normalizedOrders.length)
    } catch (error) {
      console.error('Failed to load orders:', error)
      toast.error('Failed to load orders')
      // Set empty array on error to prevent map errors
      setOrders([])
      setTotalCount(0)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PREPARING: 'bg-purple-100 text-purple-800',
      READY: 'bg-indigo-100 text-indigo-800',
      ASSIGNED: 'bg-cyan-100 text-cyan-800',
      IN_TRANSIT: 'bg-orange-100 text-orange-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const isPriorityOrder = (order: Order) => {
    const userType = order.user?.userType
    return !!userType && userType.toString().toUpperCase() === 'FACULTY'
  }

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PAID: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by order number or user email..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <select
            value={filters.paymentStatus}
            onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {paymentStatusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="All">All Priorities</option>
            <option value="true">Priority Only</option>
            <option value="false">Normal Only</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Array.isArray(orders) && orders.length > 0 ? (
                  orders.map((order) => (
                  <tr
                    key={order.id}
                    className={isPriorityOrder(order) ? 'bg-yellow-50 hover:bg-yellow-100' : 'hover:bg-gray-50'}
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/orders/${order.id}`}
                        className="text-primary hover:underline font-medium"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.user.name}</div>
                        <div className="text-sm text-gray-500">{order.user.email}</div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                          {order.user.userType}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        order.orderType === 'DINE_IN' ? 'bg-purple-100 text-purple-800' :
                        order.orderType === 'PICKUP' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {order.orderType === 'DINE_IN' ? 'Dine In' : order.orderType === 'PICKUP' ? 'Pickup' : 'Delivery'}
                      </span>
                      {order.tableBooking && (
                        <div className="text-xs text-gray-500 mt-1">
                          Table {order.tableBooking.table.tableNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{order.items.length} items</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span className="text-xs text-gray-500">{order.paymentMethod}</span>
                        <br />
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {isPriorityOrder(order) ? (
                        <span className="inline-flex items-center text-yellow-500">⭐ Faculty</span>
                      ) : (
                        <span className="text-gray-500">Normal</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatRelativeTime(order.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/orders/${order.id}`}
                        className="text-primary hover:underline text-sm"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount} orders
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page * pageSize >= totalCount}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

