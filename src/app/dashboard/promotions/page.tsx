'use client'

import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/api/admin'
import type { Promotion } from '@/lib/types'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils'
import { Plus, Edit, Trash2, Image as ImageIcon, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import Image from 'next/image'

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')

  useEffect(() => {
    loadPromotions()
  }, [filter])

  const loadPromotions = async () => {
    try {
      setIsLoading(true)
      const params: any = {}
      if (filter === 'active') {
        params.is_active = true
        params.status = 'ACTIVE'
      } else if (filter === 'inactive') {
        params.is_active = false
      }

      const response = await adminApi.getPromotions(params)
      const promotionsArray = Array.isArray(response)
        ? response
        : (response as any)?.results || []
      setPromotions(promotionsArray)
    } catch (error) {
      console.error('Failed to load promotions:', error)
      toast.error('Failed to load promotions')
      setPromotions([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotion?')) return

    try {
      await adminApi.deletePromotion(id)
      toast.success('Promotion deleted')
      loadPromotions()
    } catch (error) {
      toast.error('Failed to delete promotion')
    }
  }

  const handleToggleStatus = async (id: string) => {
    try {
      await adminApi.togglePromotionStatus(id)
      toast.success('Promotion status updated')
      loadPromotions()
    } catch (error) {
      toast.error('Failed to update promotion status')
    }
  }

  const getImageUrl = (image?: string) => {
    if (!image) return null
    if (image.startsWith('http')) return image
    return `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:8000'}${image}`
  }

  const getPromotionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      PERCENTAGE: 'Percentage Discount',
      FIXED: 'Fixed Amount',
      BUY_ONE_GET_ONE: 'Buy One Get One',
      FREE_DELIVERY: 'Free Delivery',
    }
    return labels[type] || type
  }

  const isPromotionValid = (promo: Promotion) => {
    const now = new Date()
    const validFrom = new Date(promo.validFrom)
    const validUntil = new Date(promo.validUntil)
    return promo.isActive && promo.status === 'ACTIVE' && now >= validFrom && now <= validUntil
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Promotions Management</h1>
        <Link
          href="/dashboard/promotions/new"
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Promotion</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg transition-colors ${filter === 'active'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('inactive')}
            className={`px-4 py-2 rounded-lg transition-colors ${filter === 'inactive'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            Inactive
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.isArray(promotions) && promotions.length > 0 ? (
            promotions.map((promotion) => {
              const imageUrl = getImageUrl(promotion.image)

              // Normalize data from backend (handle both snake_case and camelCase)
              const title = promotion.title
              const description = promotion.description
              const promoType = promotion.promotion_type || promotion.promotionType
              const discountVal = Number(promotion.discount_value || promotion.discountValue || 0)
              const minOrder = Number(promotion.min_order_amount || promotion.minOrderAmount || 0)
              const validUntil = promotion.valid_until || promotion.validUntil
              const validFrom = promotion.valid_from || promotion.validFrom
              const currentStatus = promotion.status
              const isActive = promotion.is_active ?? promotion.isActive ?? false
              const usedCount = promotion.used_count ?? promotion.usedCount ?? 0
              const usageLimit = promotion.usage_limit ?? promotion.usageLimit

              const isExpired = new Date(validUntil) < new Date()
              const isStarted = new Date(validFrom) <= new Date()
              const isPromotionCurrentlyValid = isActive && currentStatus === 'ACTIVE' && isStarted && !isExpired

              return (
                <div
                  key={promotion.id}
                  className={`group relative bg-white rounded-2xl shadow-sm border ${isPromotionCurrentlyValid ? 'border-primary/20' : 'border-gray-100'
                    } overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col`}
                >
                  {/* Image Section */}
                  <div className="relative h-48 bg-gray-50 overflow-hidden">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100">
                        <ImageIcon className="w-12 h-12 text-gray-200" />
                      </div>
                    )}

                    {/* Status Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {isPromotionCurrentlyValid ? (
                        <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg">
                          ACTIVE NOW
                        </span>
                      ) : isExpired ? (
                        <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                          EXPIRED
                        </span>
                      ) : !isActive ? (
                        <span className="px-3 py-1 bg-gray-500 text-white text-xs font-bold rounded-full shadow-lg">
                          PAUSED
                        </span>
                      ) : !isStarted ? (
                        <span className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full shadow-lg">
                          UPCOMING
                        </span>
                      ) : null}
                    </div>

                    <div className="absolute top-4 right-4">
                      <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                        <span className="text-primary font-bold text-sm">
                          {promoType === 'PERCENTAGE' ? `${discountVal}% OFF` : `${formatCurrency(discountVal)} OFF`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                        {title}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px]">
                        {description}
                      </p>
                    </div>

                    <div className="space-y-3 mb-6 flex-1">
                      <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-100/50">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Type</span>
                        <span className="text-sm font-semibold text-gray-700">{getPromotionTypeLabel(promoType)}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-2 rounded-xl bg-gray-50 border border-gray-100/50">
                          <span className="block text-[10px] font-medium text-gray-400 uppercase mb-1">Min Order</span>
                          <span className="text-sm font-bold text-gray-700">{formatCurrency(minOrder)}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-gray-50 border border-gray-100/50">
                          <span className="block text-[10px] font-medium text-gray-400 uppercase mb-1">Usage</span>
                          <span className="text-sm font-bold text-gray-700">{usedCount} / {usageLimit || '∞'}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between px-2 pt-1">
                        <span className="text-xs text-gray-400">Ends: {formatDate(validUntil)}</span>
                        {isExpired && <span className="text-xs text-red-400 font-medium">Expired</span>}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleToggleStatus(promotion.id)}
                        className={`group/toggle flex items-center space-x-2 px-3 py-1.5 rounded-xl transition-all ${isActive
                            ? 'bg-green-50 text-green-600 hover:bg-green-100'
                            : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                          }`}
                        title={isActive ? 'Deactivate' : 'Activate'}
                      >
                        {isActive ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                        <span className="text-xs font-bold uppercase tracking-wide">
                          {isActive ? 'Active' : 'Hidden'}
                        </span>
                      </button>

                      <div className="flex items-center space-x-1">
                        <Link
                          href={`/dashboard/promotions/${promotion.id}`}
                          className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                          title="Edit Promotion"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(promotion.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          title="Delete Promotion"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="col-span-full py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 text-center">
              <div className="bg-white w-20 h-20 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 rotate-3">
                <ImageIcon className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-gray-900 text-xl font-bold mb-2">No promotions found</h3>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto uppercase text-xs tracking-widest font-bold">
                Create a campaign to boost your sales
              </p>
              <Link
                href="/dashboard/promotions/new"
                className="inline-flex items-center space-x-2 px-8 py-3 bg-primary text-white rounded-2xl hover:bg-blue-700 transition-all hover:shadow-lg active:scale-95"
              >
                <Plus className="w-5 h-5" />
                <span className="font-bold">Create Promotion</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

