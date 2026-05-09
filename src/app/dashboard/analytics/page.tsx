'use client'

import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/api/admin'
import type { SalesReport, PopularItem } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Download, TrendingUp, TrendingDown } from 'lucide-react'
import toast from 'react-hot-toast'

const COLORS = ['#1976D2', '#4CAF50', '#FF9800', '#F44336', '#9C27B0', '#00BCD4']

export default function AnalyticsPage() {
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null)
  const [popularItems, setPopularItems] = useState<PopularItem[]>([])
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  })
  const [isLoading, setIsLoading] = useState(true)

  const toNumber = (value: unknown): number => {
    const n = typeof value === 'number' ? value : Number(value)
    return Number.isFinite(n) ? n : 0
  }

  useEffect(() => {
    loadData()
  }, [dateRange])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [sales, popular, overview] = await Promise.all([
        adminApi.getSalesReport(dateRange.start, dateRange.end),
        adminApi.getPopularItems(),
        adminApi.getOverview(),
      ])
      // Popular items endpoint returns: { popular_items: [...] }
      const popularRaw = popular as any
      const popularItemsRaw: any[] = Array.isArray(popularRaw?.popular_items)
        ? popularRaw.popular_items
        : Array.isArray(popularRaw)
          ? popularRaw
          : []

      const totalRevenueSum = popularItemsRaw.reduce(
        (sum: number, item: any) => sum + toNumber(item?.total_revenue),
        0,
      )

      const mappedPopularItems = popularItemsRaw.map((item: any) => {
        const timesOrdered = toNumber(item?.total_quantity)
        const totalRevenue = toNumber(item?.total_revenue)
        const percentage = totalRevenueSum > 0 ? (totalRevenue / totalRevenueSum) * 100 : 0

        // UI only uses menuItem.name, but PopularItem type expects a full MenuItem shape.
        // We cast to keep the rest of the app type-safe.
        return {
          menuItem: { name: item?.menu_item__name } as any,
          timesOrdered,
          totalRevenue,
          percentage,
        } as PopularItem
      })

      setPopularItems(mappedPopularItems)
      
      // Backend returns: { total_revenue, total_orders, category_revenue: [...] }
      // Frontend UI expects SalesReport fields.
      const salesAny = sales as any
      const totalRevenue = toNumber(salesAny?.total_revenue ?? salesAny?.totalRevenue)
      const totalOrders = toNumber(salesAny?.total_orders ?? salesAny?.totalOrders)
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

      const ordersByCategory = Array.isArray(salesAny?.category_revenue)
        ? salesAny.category_revenue.map((item: any) => ({
            category: item?.['items__menu_item__category__name'] || item?.category || 'Uncategorized',
            // Backend returns revenue per category; reuse this value for the pie chart.
            count: toNumber(item?.revenue),
          }))
        : []

      setSalesReport({
        totalRevenue,
        revenueGrowth: 0,
        totalOrders,
        ordersGrowth: 0,
        averageOrderValue,
        topSellingCategory: 'N/A',
        revenueTrend: Array.isArray((overview as any)?.revenueChart)
          ? (overview as any).revenueChart
          : [],
        ordersByCategory,
      })
    } catch (error) {
      console.error('Failed to load analytics:', error)
      toast.error('Failed to load analytics')
      // Set defaults on error
      setSalesReport({
        totalRevenue: 0,
        revenueGrowth: 0,
        totalOrders: 0,
        ordersGrowth: 0,
        averageOrderValue: 0,
        topSellingCategory: 'N/A',
        revenueTrend: [],
        ordersByCategory: [],
      })
      setPopularItems([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = () => {
    // Export popular items to CSV
    const headers = ['Item Name', 'Times Ordered', 'Total Revenue', 'Percentage']
    const rows = popularItems.map((item) => [
      item.menuItem.name,
      item.timesOrdered,
      item.totalRevenue,
      `${item.percentage.toFixed(2)}%`,
    ])
    
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `popular-items-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Report exported to CSV')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!salesReport) {
    return <div className="text-center text-gray-500">Failed to load analytics</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <span>to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(salesReport.totalRevenue)}</p>
          <div className="flex items-center mt-2">
            {salesReport.revenueGrowth >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
            )}
            <span className={`text-sm ${salesReport.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(salesReport.revenueGrowth)}% growth
            </span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900">{salesReport.totalOrders}</p>
          <div className="flex items-center mt-2">
            {salesReport.ordersGrowth >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
            )}
            <span className={`text-sm ${salesReport.ordersGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(salesReport.ordersGrowth)}% growth
            </span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Average Order Value</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(salesReport.averageOrderValue)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Top Selling Category</p>
          <p className="text-2xl font-bold text-gray-900">{salesReport.topSellingCategory}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            {salesReport.revenueTrend && salesReport.revenueTrend.length > 0 ? (
              <LineChart data={salesReport.revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#1976D2" strokeWidth={2} />
              </LineChart>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No revenue data available
              </div>
            )}
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Orders by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            {salesReport.ordersByCategory && salesReport.ordersByCategory.length > 0 ? (
              <PieChart>
                <Pie
                  data={salesReport.ordersByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                label={({ category, count }) => `${category}: ${formatCurrency(count)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {salesReport.ordersByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No category data available
              </div>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Popular Items */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Popular Items (Top 10)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Times Ordered</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Array.isArray(popularItems) && popularItems.length > 0 ? (
                popularItems.slice(0, 10).map((item) => (
                <tr key={item.menuItem.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.menuItem.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.timesOrdered}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {formatCurrency(item.totalRevenue)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.percentage.toFixed(2)}%</td>
                </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    No popular items data available
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

