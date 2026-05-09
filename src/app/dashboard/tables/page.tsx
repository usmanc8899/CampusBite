'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminApi } from '@/lib/api/admin'
import type { Table } from '@/lib/types'
import { Plus, Edit, Trash2, Table as TableIcon } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function TablesPage() {
  const router = useRouter()
  const [tables, setTables] = useState<Table[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTables()
  }, [])

  const loadTables = async () => {
    try {
      setIsLoading(true)
      const data = await adminApi.getTables()
      setTables(data.results || [])
    } catch (error) {
      toast.error('Failed to load tables')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this table?')) return

    try {
      await adminApi.deleteTable(id)
      toast.success('Table deleted')
      loadTables()
    } catch (error) {
      toast.error('Failed to delete table')
    }
  }

  const getTableTypeColor = (type: string) => {
    switch (type) {
      case 'SMALL':
        return 'bg-blue-100 text-blue-800'
      case 'MEDIUM':
        return 'bg-green-100 text-green-800'
      case 'LARGE':
        return 'bg-orange-100 text-orange-800'
      case 'BOOTH':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
        <h1 className="text-2xl font-bold">Table Management</h1>
        <Link
          href="/dashboard/tables/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          <Plus className="w-5 h-5" />
          Add Table
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables.map((table) => (
          <div
            key={table.id}
            className="bg-white rounded-lg shadow p-6 border-2 border-transparent hover:border-primary transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${table.isAvailable ? 'bg-green-100' : 'bg-red-100'}`}>
                  <TableIcon className={`w-6 h-6 ${table.isAvailable ? 'text-green-600' : 'text-red-600'}`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{table.tableNumber}</h3>
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getTableTypeColor(table.tableType)}`}>
                    {table.tableType}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/dashboard/tables/${table.id}/edit`}
                  className="p-2 text-gray-600 hover:text-primary"
                >
                  <Edit className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleDelete(table.id)}
                  className="p-2 text-gray-600 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Capacity:</span>
                <span className="font-medium">{table.capacity} seats</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span className={`font-medium ${table.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {table.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Available:</span>
                <span className={`font-medium ${table.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                  {table.isAvailable ? 'Yes' : 'No'}
                </span>
              </div>
              {table.description && (
                <div className="pt-2 border-t">
                  <p className="text-gray-600 text-xs">{table.description}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {tables.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <TableIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 mb-4">No tables found</p>
          <Link
            href="/dashboard/tables/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            <Plus className="w-5 h-5" />
            Add Your First Table
          </Link>
        </div>
      )}
    </div>
  )
}

