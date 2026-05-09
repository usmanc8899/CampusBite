'use client'

import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/api/admin'
import type { Category } from '@/lib/types'
import { Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import Image from 'next/image'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setIsLoading(true)
      const res = await adminApi.getCategories()
      // Backend now filters inactive categories, but add extra safety check
      const activeCategories = (res.results || []).filter((cat: Category) =>
        cat.is_active === true || cat.is_active === undefined
      )
      setCategories(activeCategories)
    } catch (error) {
      console.error('Failed to load categories:', error)
      toast.error('Failed to load categories')
      setCategories([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? This will also make all items in this category unavailable.')) return

    try {
      await adminApi.deleteCategory(id)
      toast.success('Category deleted successfully')
      loadCategories()
    } catch (error: any) {
      console.error('Failed to delete category:', error)
      const errorMessage = error.response?.data?.detail || error.response?.data?.error || 'Failed to delete category'
      toast.error(errorMessage)
    }
  }

  const getImageUrl = (image?: string) => {
    if (!image) return null
    if (image.startsWith('http')) return image
    return `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:8000'}${image}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Categories Management</h1>
        <Link
          href="/dashboard/categories/new"
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Category</span>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.isArray(categories) && categories.length > 0 ? (
            categories.map((category) => {
              const imageUrl = getImageUrl(category.image)
              const displayOrder = category.display_order ?? category.displayOrder ?? 0

              return (
                <div
                  key={category.id}
                  className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <Link href={`/dashboard/menu?category=${category.id}`} className="block relative h-48 bg-gray-50 overflow-hidden">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={category.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <ImageIcon className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                      <span className="bg-white/90 text-primary px-4 py-2 rounded-full font-medium opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        View Items
                      </span>
                    </div>
                  </Link>

                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        Order: {displayOrder}
                      </span>
                    </div>

                    {category.description && (
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2 h-10">
                        {category.description}
                      </p>
                    )}

                    <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-50">
                      <Link
                        href={`/dashboard/categories/${category.id}`}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        title="Edit Category"
                      >
                        <Edit className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          handleDelete(category.id)
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Delete Category"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="col-span-full bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center">
              <div className="bg-white w-16 h-16 rounded-full shadow-sm flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-gray-900 font-medium mb-1">No categories found</h3>
              <p className="text-gray-500 text-sm mb-6">Start by creating your first menu category</p>
              <Link
                href="/dashboard/categories/new"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Add Category</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

