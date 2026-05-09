'use client'

import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/api/admin'
import type { TableBooking } from '@/lib/types'
import { formatDateTime, formatRelativeTime } from '@/lib/utils'
import { Search, Filter, X, CheckCircle, Clock, AlertCircle, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

const statusOptions = [
  'All',
  'PENDING',
  'RESERVED',
  'CONFIRMED',
  'EXPIRED',
  'CANCELLED',
  'COMPLETED',
]

export default function TableBookingsPage() {
  const [bookings, setBookings] = useState<TableBooking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: 'All',
    search: '',
  })

  useEffect(() => {
    loadBookings()
  }, [filters])

  const loadBookings = async () => {
    try {
      setIsLoading(true)
      const params: any = {}
      if (filters.status !== 'All') {
        params.status = filters.status
      }
      const data = await adminApi.getTableBookings(params)
      setBookings(data)
    } catch (error) {
      toast.error('Failed to load table bookings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearBooking = async (id: string) => {
    if (!confirm('Are you sure you want to clear this table booking? This will cancel the booking and free up the table.')) {
      return
    }

    try {
      await adminApi.clearTableBooking(id)
      toast.success('Table booking cleared successfully')
      loadBookings()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to clear booking')
    }
  }

  const handleForceComplete = async (id: string) => {
    if (!confirm('Mark this booking as completed?')) {
      return
    }

    try {
      await adminApi.forceCompleteBooking(id)
      toast.success('Booking marked as completed')
      loadBookings()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to complete booking')
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      RESERVED: 'bg-blue-100 text-blue-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      EXPIRED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800',
      COMPLETED: 'bg-purple-100 text-purple-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
      case 'RESERVED':
        return <Clock className="w-4 h-4" />
      case 'CONFIRMED':
        return <CheckCircle className="w-4 h-4" />
      case 'EXPIRED':
      case 'CANCELLED':
        return <X className="w-4 h-4" />
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Table Bookings Management</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by user email or table number..."
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
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Table</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guests</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reserved At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Deadline</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookings.length > 0 ? (
                bookings
                  .filter((booking) => {
                    if (!filters.search) return true
                    const search = filters.search.toLowerCase()
                    return (
                      booking.userEmail.toLowerCase().includes(search) ||
                      booking.table.tableNumber.toLowerCase().includes(search) ||
                      booking.id.toLowerCase().includes(search)
                    )
                  })
                  .map((booking) => (
                    <tr
                      key={booking.id}
                      className={`hover:bg-gray-50 ${
                        booking.isPaymentOverdue && booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED'
                          ? 'bg-red-50'
                          : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {booking.id.substring(0, 8)}...
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{booking.userEmail}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            {booking.table.tableNumber}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({booking.table.capacity} seats)
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {booking.numberOfGuests}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {getStatusIcon(booking.status)}
                          {booking.status}
                        </span>
                        {booking.isPaymentOverdue &&
                          booking.status !== 'CANCELLED' &&
                          booking.status !== 'COMPLETED' && (
                            <div className="text-xs text-red-600 mt-1">Payment Overdue</div>
                          )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDateTime(booking.reservedAt)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div>{formatDateTime(booking.paymentDeadline)}</div>
                        {booking.timeRemaining > 0 && booking.status !== 'CANCELLED' && (
                          <div className="text-xs text-orange-600 mt-1">
                            {Math.floor(booking.timeRemaining / 60)}m {booking.timeRemaining % 60}s left
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {booking.orderNumber ? (
                          <a
                            href={`/dashboard/orders/${booking.orderId}`}
                            className="text-primary hover:underline text-sm"
                          >
                            {booking.orderNumber}
                          </a>
                        ) : (
                          <span className="text-sm text-gray-400">No order</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
                            <button
                              onClick={() => handleClearBooking(booking.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              title="Clear/Cancel Booking"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          {booking.status === 'CONFIRMED' && (
                            <button
                              onClick={() => handleForceComplete(booking.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                              title="Mark as Completed"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    No table bookings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

