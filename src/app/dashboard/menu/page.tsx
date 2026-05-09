'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { adminApi } from '@/lib/api/admin'
import type { MenuItem, Category } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { Plus, Search, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

const getImageUrl = (image?: string) => {
  if (!image) return null
  if (image.startsWith('http')) return image
  // Backend returns relative media path like `/media/...`
  const base =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '') ||
    'http://localhost:8000'
  return `${base}${image}`
}

export default function MenuManagementPage() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get('category') || ''

  const [items, setItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [itemsRes, categoriesRes] = await Promise.all([
        adminApi.getMenuItems({ category: selectedCategory || undefined, search: searchQuery || undefined }),
        adminApi.getCategories(),
      ])

      // Backend filters inactive categories, but add extra safety check
      const activeCategories = (categoriesRes.results || []).filter((cat: Category) =>
        cat.is_active === true || cat.is_active === undefined
      )

      setItems(itemsRes.results || [])
      setCategories(activeCategories)
    } catch (error) {
      console.error('Failed to load menu items:', error)
      toast.error('Failed to load menu items')
      // Set empty arrays on error to prevent map errors
      setItems([])
      setCategories([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const debounce = setTimeout(() => {
      loadData()
    }, 500)
    return () => clearTimeout(debounce)
  }, [selectedCategory, searchQuery])

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      await adminApi.updateMenuItem(item.id, { isAvailable: !item.isAvailable })
      toast.success(`Item ${item.isAvailable ? 'unavailable' : 'available'}`)
      loadData()
    } catch (error) {
      toast.error('Failed to update item')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      await adminApi.deleteMenuItem(id)
      toast.success('Item deleted')
      loadData()
    } catch (error) {
      toast.error('Failed to delete item')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
        <Link
          href="/dashboard/menu/new"
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Item</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Categories</option>
          {Array.isArray(categories) && categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {item.image ? (
                        <img
                          src={getImageUrl(item.image) ?? ''}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No Image</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-500">{item.description}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.category.name}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.stockQuantity === 0 ? 'Unlimited' : item.stockQuantity}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleAvailability(item)}
                        className={`p-2 rounded-lg transition-colors ${item.isAvailable
                          ? 'bg-green-100 text-green-600 hover:bg-green-200'
                          : 'bg-red-100 text-red-600 hover:bg-red-200'
                          }`}
                      >
                        {item.isAvailable ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/dashboard/menu/${item.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {items.length === 0 && (
            <div className="text-center py-12 text-gray-500">No menu items found</div>
          )}
        </div>
      )}
    </div>
  )
}

