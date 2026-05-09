'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { adminApi } from '@/lib/api/admin'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

const tableSchema = z.object({
  tableNumber: z.string().min(1, 'Table number is required'),
  tableType: z.enum(['SMALL', 'MEDIUM', 'LARGE', 'BOOTH']),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  positionX: z.number().default(50),
  positionY: z.number().default(50),
  isActive: z.boolean().default(true),
  description: z.string().optional(),
})

type TableForm = z.infer<typeof tableSchema>

export default function EditTablePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TableForm>({
    resolver: zodResolver(tableSchema),
    defaultValues: {
      tableType: 'MEDIUM',
      capacity: 4,
      positionX: 0,
      positionY: 0,
      isActive: true,
    },
  })

  useEffect(() => {
    const fetchTable = async () => {
      try {
        const data = await adminApi.getTable(params.id)
        if (data) {
          reset({
            tableNumber: data.tableNumber,
            tableType: data.tableType as any,
            capacity: data.capacity,
            positionX: data.positionX ?? 50,
            positionY: data.positionY ?? 50,
            isActive: data.isActive ?? true,
            description: data.description || '',
          })
        }
      } catch (error) {
        toast.error('Failed to load table details')
        router.push('/dashboard/tables')
      } finally {
        setIsInitializing(false)
      }
    }

    if (params.id) {
      fetchTable()
    }
  }, [params.id, reset, router])

  const onSubmit = async (data: TableForm) => {
    setIsLoading(true)
    try {
      await adminApi.updateTable(params.id, data)
      toast.success('Table updated successfully')
      router.push('/dashboard/tables')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update table')
    } finally {
      setIsLoading(false)
    }
  }

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/tables"
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">Edit Table</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Table Number *</label>
          <input
            {...register('tableNumber')}
            type="text"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="e.g., T1, T2, Booth-1"
          />
          {errors.tableNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.tableNumber.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Table Type *</label>
          <select
            {...register('tableType')}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="SMALL">Small (1-2 persons)</option>
            <option value="MEDIUM">Medium (3-4 persons)</option>
            <option value="LARGE">Large (5-6 persons)</option>
            <option value="BOOTH">Booth</option>
          </select>
          {errors.tableType && (
            <p className="text-red-500 text-sm mt-1">{errors.tableType.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Capacity *</label>
          <input
            {...register('capacity', { valueAsNumber: true })}
            type="number"
            min="1"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {errors.capacity && (
            <p className="text-red-500 text-sm mt-1">{errors.capacity.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 hidden">
          <div>
            <label className="block text-sm font-medium mb-2">Position X</label>
            <input
              {...register('positionX', { valueAsNumber: true })}
              type="number"
              step="0.1"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Position Y</label>
            <input
              {...register('positionY', { valueAsNumber: true })}
              type="number"
              step="0.1"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description (Optional)</label>
          <textarea
            {...register('description')}
            rows={3}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Additional notes about the table"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            {...register('isActive')}
            type="checkbox"
            id="isActive"
            className="w-4 h-4 text-primary rounded focus:ring-primary"
          />
          <label htmlFor="isActive" className="text-sm font-medium">
            Active (available for booking)
          </label>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
          <Link
            href="/dashboard/tables"
            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
