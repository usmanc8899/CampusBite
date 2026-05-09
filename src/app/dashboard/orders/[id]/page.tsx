'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { adminApi } from '@/lib/api/admin'
import type { Order } from '@/lib/types'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { ArrowLeft, Phone, Mail, MapPin, Package, CreditCard, User, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

function getStatusFlow(orderType: Order['orderType']) {
  if (orderType === 'DELIVERY') {
    return ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED'] as const
  }
  // PICKUP + DINE_IN never use rider statuses; backend still uses DELIVERED as the terminal status.
  return ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED'] as const
}

function statusLabel(orderType: Order['orderType'], status: string) {
  if (status !== 'DELIVERED') return status.replace('_', ' ')
  if (orderType === 'PICKUP') return 'COMPLETED'
  if (orderType === 'DINE_IN') return 'SERVED'
  return 'DELIVERED'
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [newStatus, setNewStatus] = useState('')

  useEffect(() => {
    if (params.id) {
      loadOrder()
    }
  }, [params.id])

  const loadOrder = async () => {
    try {
      setIsLoading(true)
      const orderData = await adminApi.getOrder(params.id as string)
      setOrder(orderData)
      setNewStatus(orderData.status)
    } catch (error) {
      toast.error('Failed to load order')
      router.push('/dashboard/orders')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!order || newStatus === order.status) return

    if (!confirm(`Are you sure you want to update status to ${newStatus.replace('_', ' ')}?`)) return

    try {
      await adminApi.updateOrderStatus(order.id, newStatus)
      toast.success('Order status updated')
      loadOrder()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handleCancel = async () => {
    if (!order) return

    if (!confirm('Are you sure you want to cancel this order?')) return

    try {
      await adminApi.cancelOrder(order.id)
      toast.success('Order cancelled')
      loadOrder()
    } catch (error) {
      toast.error('Failed to cancel order')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!order) {
    return <div className="text-center text-gray-500">Order not found</div>
  }

  const statusFlow = getStatusFlow(order.orderType)
  const currentStatusIndex = statusFlow.indexOf(order.status as any)
  const canCancel = order.status !== 'DELIVERED' && order.status !== 'CANCELLED'

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link
          href="/dashboard/orders"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order {order.orderNumber}</h1>
          <p className="text-sm text-gray-500">Created {formatDateTime(order.createdAt)}</p>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Order Status</h2>
        <div className="flex items-center justify-between">
          {statusFlow.map((status, index) => {
            const hasKnownIndex = currentStatusIndex >= 0
            const isCompleted = hasKnownIndex ? index <= currentStatusIndex : false
            const isCurrent = hasKnownIndex ? index === currentStatusIndex : false

            return (
              <div key={status} className="flex-1 flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isCompleted ? <CheckCircle className="w-6 h-6" /> : index + 1}
                  </div>
                  <span className={`mt-2 text-xs text-center ${isCurrent ? 'font-semibold' : ''}`}>
                    {statusLabel(order.orderType, status)}
                  </span>
                </div>
                {index < statusFlow.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      isCompleted ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Customer Information
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{order.user.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium flex items-center">
                <Mail className="w-4 h-4 mr-1" />
                {order.user.email}
              </p>
            </div>
            {order.user.phone && (
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium flex items-center">
                  <Phone className="w-4 h-4 mr-1" />
                  {order.user.phone}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">User Type</p>
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                {order.user.userType}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Order Type</p>
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                {order.orderType === 'DINE_IN' ? 'Dine In' : order.orderType === 'PICKUP' ? 'Pickup' : 'Delivery'}
              </span>
            </div>
            {order.orderType === 'DELIVERY' && order.deliveryLocation && (
              <div>
                <p className="text-sm text-gray-500">Delivery Location</p>
                <p className="font-medium flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {order.deliveryLocation}
                </p>
              </div>
            )}
            {order.orderType === 'PICKUP' && order.pickupLocation && (
              <div>
                <p className="text-sm text-gray-500">Pickup Location</p>
                <p className="font-medium flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {order.pickupLocation}
                </p>
              </div>
            )}
            {order.orderType === 'DINE_IN' && order.tableBooking && (
              <div>
                <p className="text-sm text-gray-500">Table Booking</p>
                <p className="font-medium flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  Table {order.tableBooking.table.tableNumber} ({order.tableBooking.numberOfGuests} guests)
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Status: {order.tableBooking.status} | 
                  {order.tableBooking.isReservationActive 
                    ? ` Reserved until ${new Date(order.tableBooking.reservedUntil!).toLocaleString()}`
                    : order.tableBooking.isPaymentOverdue 
                    ? ' Payment overdue'
                    : ` Payment deadline: ${new Date(order.tableBooking.paymentDeadline).toLocaleString()}`
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Order Items
          </h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between pb-3 border-b">
                <div>
                  <p className="font-medium">{item.menuItem.name}</p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="font-medium">{formatCurrency(item.subtotal)}</p>
              </div>
            ))}
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment & Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Payment Information
          </h2>
          <div className="space-y-3 mb-6">
            <div>
              <p className="text-sm text-gray-500">Payment Method</p>
              <p className="font-medium">{order.paymentMethod}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Payment Status</p>
              <span
                className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                  order.paymentStatus === 'PAID'
                    ? 'bg-green-100 text-green-800'
                    : order.paymentStatus === 'FAILED'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {order.paymentStatus}
              </span>
            </div>
          </div>

          {/* Rider Info */}
          {(order.rider || (order as any).riderName || (order as any).riderEmail) && (
            <div className="mb-6 pb-6 border-b">
              <h3 className="font-semibold mb-2">Rider Information</h3>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="text-gray-500">Name:</span>{' '}
                  {typeof order.rider === 'object' && order.rider?.name
                    ? order.rider.name
                    : ((order as any).riderName ?? 'Assigned')}
                </p>
                {typeof order.rider === 'object' && order.rider?.phone ? (
                  <p className="text-sm">
                    <span className="text-gray-500">Phone:</span> {order.rider.phone}
                  </p>
                ) : null}
                {(order as any).riderEmail ? (
                  <p className="text-sm">
                    <span className="text-gray-500">Email:</span> {(order as any).riderEmail}
                  </p>
                ) : null}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Update Status
              </label>
              <div className="flex space-x-2">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {[...statusFlow, 'CANCELLED'].map((status) => (
                    <option key={status} value={status}>
                      {statusLabel(order.orderType, status)}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleStatusUpdate}
                  disabled={newStatus === order.status}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Update
                </button>
              </div>
            </div>
            {canCancel && (
              <button
                onClick={handleCancel}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

