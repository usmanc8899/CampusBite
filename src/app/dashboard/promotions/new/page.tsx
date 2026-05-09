'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { adminApi } from '@/lib/api/admin'
import { ArrowLeft, Upload } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

const optionalNumber = z.preprocess((val) => {
  if (val === '' || val === undefined || val === null || Number.isNaN(val)) return undefined;
  return Number(val);
}, z.number().min(0).optional());

const promotionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  promotionType: z.enum(['PERCENTAGE', 'FIXED', 'BUY_ONE_GET_ONE', 'FREE_DELIVERY']),
  discountValue: z.coerce.number().min(0, 'Discount value must be non-negative'),
  minOrderAmount: z.coerce.number().min(0, 'Minimum order amount must be non-negative'),
  maxDiscountAmount: optionalNumber,
  validFrom: z.string().min(1, 'Valid from date is required'),
  validUntil: z.string().min(1, 'Valid until date is required'),
  usageLimit: z.preprocess(
    (val) => (val === '' || val === undefined || val === null || Number.isNaN(val) ? undefined : Number(val)),
    z.number().min(1).optional()
  ),
  image: z.instanceof(File).optional(),
})

type PromotionForm = z.infer<typeof promotionSchema>

export default function NewPromotionPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PromotionForm>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      minOrderAmount: 0,
      discountValue: 0,
    },
  })

  const imageFile = watch('image')
  const promotionType = watch('promotionType')

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setValue('image', file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data: PromotionForm) => {
    try {
      setIsLoading(true)
      const formData = new FormData()
      formData.append('title', data.title)
      formData.append('description', data.description)
      formData.append('promotion_type', data.promotionType)
      formData.append('discount_value', data.discountValue.toString())
      formData.append('min_order_amount', data.minOrderAmount.toString())
      if (data.maxDiscountAmount) {
        formData.append('max_discount_amount', data.maxDiscountAmount.toString())
      }
      formData.append('valid_from', new Date(data.validFrom).toISOString())
      formData.append('valid_until', new Date(data.validUntil).toISOString())
      if (data.usageLimit) {
        formData.append('usage_limit', data.usageLimit.toString())
      }
      if (data.image) {
        formData.append('image', data.image)
      }

      await adminApi.createPromotionFormData(formData)
      toast.success('Promotion created successfully')
      router.push('/dashboard/promotions')
    } catch (error: any) {
      console.error('Failed to create promotion:', error)
      toast.error(error.response?.data?.detail || 'Failed to create promotion')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link
          href="/dashboard/promotions"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">New Promotion</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Promotion Image
            </label>
            <div className="mt-1 flex items-center space-x-5">
              {imagePreview && (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-300">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              {...register('title')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Promotion Type <span className="text-red-500">*</span>
            </label>
            <select
              {...register('promotionType')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="PERCENTAGE">Percentage Discount</option>
              <option value="FIXED">Fixed Amount Discount</option>
            </select>
            {errors.promotionType && (
              <p className="mt-1 text-sm text-red-600">{errors.promotionType.message}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discount Value <span className="text-red-500">*</span>
            </label>
            <input
              {...register('discountValue', { valueAsNumber: true })}
              type="number"
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="mt-1 text-xs text-gray-500">
              {promotionType === 'PERCENTAGE' ? 'Enter percentage (e.g., 10 for 10%)' : 'Enter fixed amount'}
            </p>
            {errors.discountValue && (
              <p className="mt-1 text-sm text-red-600">{errors.discountValue.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Order Amount
            </label>
            <input
              {...register('minOrderAmount', { valueAsNumber: true })}
              type="number"
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.minOrderAmount && (
              <p className="mt-1 text-sm text-red-600">{errors.minOrderAmount.message}</p>
            )}
          </div>

          {promotionType === 'PERCENTAGE' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Discount Amount (Optional)
              </label>
              <input
                {...register('maxDiscountAmount', { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Usage Limit (Optional)
            </label>
            <input
              {...register('usageLimit', { valueAsNumber: true })}
              type="number"
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="mt-1 text-xs text-gray-500">Leave empty for unlimited</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valid From <span className="text-red-500">*</span>
            </label>
            <input
              {...register('validFrom')}
              type="datetime-local"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.validFrom && (
              <p className="mt-1 text-sm text-red-600">{errors.validFrom.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valid Until <span className="text-red-500">*</span>
            </label>
            <input
              {...register('validUntil')}
              type="datetime-local"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.validUntil && (
              <p className="mt-1 text-sm text-red-600">{errors.validUntil.message}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4 pt-4 border-t">
          <Link
            href="/dashboard/promotions"
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Creating...' : 'Create Promotion'}
          </button>
        </div>
      </form>
    </div>
  )
}

