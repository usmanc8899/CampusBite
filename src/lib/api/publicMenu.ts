/**
 * Public menu API (no admin role required).
 * Base URLs: GET /api/v1/menu/items/, GET /api/v1/menu/categories/
 */
import { apiClient } from './client'

function unwrapList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[]
  const obj = data as { results?: T[] } | null
  return obj?.results ?? []
}

export async function getPublicMenuItems<T = Record<string, unknown>>(): Promise<T[]> {
  const data = await apiClient.get<unknown>('/menu/items/')
  return unwrapList<T>(data)
}

export async function getPublicCategories<T = Record<string, unknown>>(): Promise<T[]> {
  const data = await apiClient.get<unknown>('/menu/categories/')
  return unwrapList<T>(data)
}
