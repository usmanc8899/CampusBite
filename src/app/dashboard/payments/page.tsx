'use client'

import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/api/admin'
import type { Payment } from '@/lib/types'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { Search, Download, DollarSign } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [summary, setSummary] = useState({
    totalToday: 0,
    cashToday: 0,
    onlineToday: 0,
    pending: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    method: 'All',
    status: 'All',
    search: '',
  })
  const [page, setPage] = useState(1)
  const pageSize = 50

  const toAmount = (value: unknown): number => {
    const n = typeof value === 'number' ? value : Number(value)
    return Number.isFinite(n) ? n : 0
  }

  useEffect(() => {
    loadPayments()
  }, [filters, page])

  const loadPayments = async () => {
    try {
      setIsLoading(true)
      const response = await adminApi.getPayments({
        method: filters.method !== 'All' ? filters.method : undefined,
        status: filters.status !== 'All' ? filters.status : undefined,
        search: filters.search || undefined,
        page,
        page_size: pageSize,
      })
      // Handle paginated response or direct array
      const paymentsArray = (Array.isArray(response)
        ? response
        : (response as any)?.results || []) as Payment[]
      setPayments(paymentsArray)
      
      // Calculate summary
      const today = new Date().toISOString().split('T')[0]
      const todayPayments = paymentsArray.filter(
        (p: Payment) => p.createdAt && p.createdAt.startsWith(today) && p.status === 'COMPLETED'
      )
      setSummary({
        totalToday: todayPayments.reduce((sum: number, p: Payment) => sum + toAmount(p.amount), 0),
        cashToday: todayPayments
          .filter((p: Payment) => (p.method || p.payment_method) === 'CASH')
          .reduce((sum: number, p: Payment) => sum + toAmount(p.amount), 0),
        onlineToday: todayPayments
          .filter((p: Payment) => (p.method || p.payment_method) === 'ONLINE')
          .reduce((sum: number, p: Payment) => sum + toAmount(p.amount), 0),
        pending: paymentsArray.filter((p: Payment) => p.status === 'PENDING').length,
      })
    } catch (error) {
      console.error('Failed to load payments:', error)
      toast.error('Failed to load payments')
      // Set empty array on error to prevent map errors
      setPayments([])
      setSummary({
        totalToday: 0,
        cashToday: 0,
        onlineToday: 0,
        pending: 0,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = () => {
    // Generate CSV
    const headers = ['Payment ID', 'Order Number', 'User', 'Amount', 'Method', 'Status', 'Date']
    const rows = (Array.isArray(payments) ? payments : []).map((p) => [
      p.id,
      p.order?.orderNumber || '',
      p.user?.email || '',
      toAmount(p.amount),
      p.method || p.payment_method || '',
      p.status || '',
      formatDateTime(p.createdAt),
    ])
    
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Payments exported to CSV')
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      REFUNDED: 'bg-gray-100 text-gray-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="text-sm text-gray-500 mt-1">
            Card payments are stored as method <span className="font-medium">ONLINE</span>; Stripe PaymentIntent IDs look like{' '}
            <code className="text-xs bg-gray-100 px-1 rounded">pi_…</code>.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-5 h-5" />
          <span>Export to CSV</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Payments (Today)</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalToday)}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Cash Payments (Today)</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.cashToday)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Online / Stripe (Today)</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.onlineToday)}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Payments</p>
              <p className="text-2xl font-bold text-gray-900">{summary.pending}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
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
            value={filters.method}
            onChange={(e) => setFilters({ ...filters, method: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="All">All Methods</option>
            <option value="CASH">Cash</option>
            <option value="ONLINE">Online</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="All">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date/Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Array.isArray(payments) && payments.length > 0 ? (
                  payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{payment.id.slice(0, 8)}...</td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/orders/${payment.order.id}`}
                        className="text-primary hover:underline font-medium"
                      >
                        {payment.order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{payment.user.name}</div>
                        <div className="text-sm text-gray-500">{payment.user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {formatCurrency(toAmount(payment.amount))}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{payment.method || payment.payment_method || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {payment.transactionId || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDateTime(payment.createdAt)}
                    </td>
                  </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                      No payments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

