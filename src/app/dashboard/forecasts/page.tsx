'use client'

import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/api/admin'
import type { Forecast, ForecastItem } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Calendar, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ForecastsPage() {
  const [forecasts, setForecasts] = useState<Forecast[]>([])
  const [selectedDate, setSelectedDate] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  )
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [itemForecast, setItemForecast] = useState<ForecastItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadForecast()
  }, [selectedDate])

  useEffect(() => {
    if (selectedItem) {
      loadItemForecast()
    }
  }, [selectedItem])

  const loadForecast = async () => {
    try {
      setIsLoading(true)
      const data = await adminApi.getDailyForecast(selectedDate)
      // Map snake_case to camelCase and handle response structure
      const rawForecasts = Array.isArray(data)
        ? data
        : (data as any)?.results || []

      const mappedForecasts = rawForecasts.map((f: any) => ({
        id: f.id,
        menuItem: {
          id: f.menu_item?.id,
          name: f.menu_item?.name || 'Unknown Item',
          category: {
            name: f.menu_item?.category?.name || 'Uncategorized'
          }
        },
        predictedQuantity: f.predicted_quantity,
        confidenceLow: f.confidence_interval_low,
        confidenceHigh: f.confidence_interval_high,
        currentStock: f.current_stock,
        recommendedStock: f.recommended_stock,
        forecastDate: f.forecast_date
      }))
      setForecasts(mappedForecasts)
    } catch (error) {
      console.error('Failed to load forecast:', error)
      toast.error('Failed to load forecast')
      // Set empty array on error to prevent map errors
      setForecasts([])
    } finally {
      setIsLoading(false)
    }
  }

  const loadItemForecast = async () => {
    if (!selectedItem) return
    try {
      const data = await adminApi.getItemForecast(selectedItem)
      // Map snake_case to camelCase and handle response structure
      const rawItemForecasts = Array.isArray(data)
        ? data
        : (data as any)?.results || []

      const mappedItemForecasts = rawItemForecasts.map((f: any) => ({
        date: f.forecast_date,
        predictedQuantity: f.predicted_quantity,
        confidenceLow: f.confidence_interval_low,
        confidenceHigh: f.confidence_interval_high,
      }))
      setItemForecast(mappedItemForecasts)
    } catch (error) {
      console.error('Failed to load item forecast:', error)
      toast.error('Failed to load item forecast')
      // Set empty array on error to prevent map errors
      setItemForecast([])
    }
  }

  const handleStockAdjustment = async (itemId: string, recommendedStock: number) => {
    if (!confirm(`Adjust stock to ${recommendedStock}?`)) return

    try {
      await adminApi.updateMenuItem(itemId, { stockQuantity: recommendedStock })
      toast.success('Stock adjusted')
      loadForecast()
    } catch (error) {
      toast.error('Failed to adjust stock')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Demand Forecasts</h1>
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Daily Forecast Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Daily Forecast for {selectedDate}</h2>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Predicted Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Confidence Range</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recommended Stock</th>
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th> */}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Array.isArray(forecasts) && forecasts.length > 0 ? (
                  forecasts.map((forecast) => (
                    <tr key={forecast.menuItem.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedItem(forecast.menuItem.id)}
                          className="text-primary hover:underline font-medium"
                        >
                          {forecast.menuItem.name}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{forecast.menuItem.category.name}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {forecast.predictedQuantity}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {forecast.confidenceLow} - {forecast.confidenceHigh}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {forecast.currentStock === 0 ? 'Unlimited' : forecast.currentStock}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {forecast.recommendedStock}
                      </td>
                      {/* <td className="px-6 py-4">
                        <button
                          onClick={() => handleStockAdjustment(forecast.menuItem.id, forecast.recommendedStock)}
                          className="px-3 py-1 text-sm bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Adjust Stock
                        </button>
                      </td> */}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No forecasts available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Item-Specific Forecast Chart */}
      {selectedItem && itemForecast.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">7-Day Forecast</h2>
            <button
              onClick={() => setSelectedItem(null)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={itemForecast}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="predictedQuantity"
                stroke="#1976D2"
                strokeWidth={2}
                name="Predicted"
              />
              <Line
                type="monotone"
                dataKey="confidenceLow"
                stroke="#FF9800"
                strokeDasharray="5 5"
                name="Confidence Low"
              />
              <Line
                type="monotone"
                dataKey="confidenceHigh"
                stroke="#FF9800"
                strokeDasharray="5 5"
                name="Confidence High"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

