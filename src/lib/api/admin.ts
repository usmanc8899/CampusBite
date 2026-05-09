import { apiClient } from './client'
import type {
  AnalyticsOverview,
  SalesReport,
  PopularItem,
  Order,
  MenuItem,
  Category,
  User,
  Payment,
  Forecast,
  ForecastItem,
  Table,
  TableBooking,
  UniversitySettings,
  Promotion,
} from '../types'

export const adminApi = {
  // Analytics
  async getOverview(): Promise<AnalyticsOverview> {
    return apiClient.get('/admin/analytics/overview/')
  },

  async getSalesReport(startDate: string, endDate: string): Promise<SalesReport> {
    return apiClient.get('/admin/reports/sales/', {
      params: { start_date: startDate, end_date: endDate },
    })
  },

  async getPopularItems(): Promise<PopularItem[]> {
    return apiClient.get('/admin/reports/popular-items/')
  },

  // Menu Management
  async getMenuItems(params?: { category?: string; search?: string }): Promise<{ results: MenuItem[]; count: number }> {
    return apiClient.get('/admin/menu/items/', { params })
  },

  async getMenuItem(id: string): Promise<MenuItem> {
    return apiClient.get(`/admin/menu/items/${id}/`)
  },

  async createMenuItem(data: Partial<MenuItem>): Promise<MenuItem> {
    return apiClient.post('/admin/menu/items/', data)
  },

  async createMenuItemFormData(formData: FormData): Promise<MenuItem> {
    return apiClient.postFormData('/admin/menu/items/', formData)
  },

  async updateMenuItem(id: string, data: Partial<MenuItem>): Promise<MenuItem> {
    return apiClient.patch(`/admin/menu/items/${id}/`, data)
  },

  async updateMenuItemFormData(id: string, formData: FormData): Promise<MenuItem> {
    return apiClient.patchFormData(`/admin/menu/items/${id}/`, formData)
  },

  async deleteMenuItem(id: string): Promise<void> {
    return apiClient.delete(`/admin/menu/items/${id}/`)
  },

  // Categories
  async getCategories(): Promise<{ results: Category[]; count: number }> {
    return apiClient.get('/admin/menu/categories/')
  },

  async getCategory(id: string): Promise<Category> {
    return apiClient.get(`/admin/menu/categories/${id}/`)
  },

  async createCategory(data: Partial<Category>): Promise<Category> {
    return apiClient.post('/admin/menu/categories/', data)
  },

  async createCategoryFormData(formData: FormData): Promise<Category> {
    return apiClient.postFormData('/admin/menu/categories/', formData)
  },

  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    return apiClient.patch(`/admin/menu/categories/${id}/`, data)
  },

  async updateCategoryFormData(id: string, formData: FormData): Promise<Category> {
    return apiClient.patchFormData(`/admin/menu/categories/${id}/`, formData)
  },

  async deleteCategory(id: string): Promise<void> {
    return apiClient.delete(`/admin/menu/categories/${id}/`)
  },

  // Orders
  async getOrders(params?: {
    status?: string
    payment_status?: string
    priority?: string
    start_date?: string
    end_date?: string
    search?: string
    page?: number
    page_size?: number
  }): Promise<{ results: Order[]; count: number; next?: string; previous?: string }> {
    return apiClient.get('/admin/orders/', { params })
  },

  async getOrder(id: string): Promise<Order> {
    return apiClient.get(`/admin/orders/${id}/`)
  },

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    return apiClient.patch(`/admin/orders/${id}/update-status/`, { status })
  },

  async cancelOrder(id: string): Promise<Order> {
    return apiClient.post(`/admin/orders/${id}/cancel/`)
  },

  // Users
  async getUsers(params?: {
    user_type?: string
    is_verified?: boolean
    is_rider?: boolean
    search?: string
    page?: number
    page_size?: number
  }): Promise<{ results: User[]; count: number }> {
    return apiClient.get('/admin/users/', { params })
  },

  async getUser(id: string): Promise<User> {
    return apiClient.get(`/admin/users/${id}/`)
  },

  async verifyUser(id: string): Promise<User> {
    return apiClient.patch(`/admin/users/${id}/verify/`)
  },

  async deactivateUser(id: string, isActive: boolean): Promise<User> {
    return apiClient.patch(`/admin/users/${id}/`, { is_active: isActive })
  },

  async toggleRiderStatus(id: string, isRider: boolean): Promise<User> {
    return apiClient.patch(`/admin/users/${id}/`, { is_rider: isRider })
  },

  // Payments
  async getPayments(params?: {
    method?: string
    status?: string
    start_date?: string
    end_date?: string
    search?: string
    page?: number
    page_size?: number
  }): Promise<{ results: Payment[]; count: number }> {
    return apiClient.get('/admin/payments/', { params })
  },

  async getPayment(id: string): Promise<Payment> {
    return apiClient.get(`/admin/payments/${id}/`)
  },

  // Forecasts
  async getDailyForecast(date: string): Promise<Forecast[]> {
    return apiClient.get('/admin/forecast/daily/', { params: { date } })
  },

  async getItemForecast(itemId: string): Promise<ForecastItem[]> {
    return apiClient.get(`/admin/forecast/item/${itemId}/`)
  },

  // Promotions
  async getPromotions(params?: {
    status?: string
    is_active?: boolean
    promotion_type?: string
  }): Promise<{ results: Promotion[]; count: number }> {
    return apiClient.get('/admin/promotions/', { params })
  },

  async getPromotion(id: string): Promise<Promotion> {
    return apiClient.get(`/admin/promotions/${id}/`)
  },

  async createPromotionFormData(formData: FormData): Promise<Promotion> {
    return apiClient.postFormData('/admin/promotions/', formData)
  },

  async updatePromotionFormData(id: string, formData: FormData): Promise<Promotion> {
    return apiClient.patchFormData(`/admin/promotions/${id}/`, formData)
  },

  async deletePromotion(id: string): Promise<void> {
    return apiClient.delete(`/admin/promotions/${id}/`)
  },

  async togglePromotionStatus(id: string): Promise<Promotion> {
    return apiClient.post(`/admin/promotions/${id}/toggle_status/`)
  },

  // Tables
  async getTables(): Promise<{ results: Table[]; count: number }> {
    const response: any = await apiClient.get('/admin/tables/')
    const items = Array.isArray(response) ? response : (response.results || [])
    const mapped = items.map((t: any) => ({ ...t, tableNumber: t.table_number, tableType: t.table_type, positionX: t.position_x, positionY: t.position_y, isActive: t.is_active, isAvailable: t.is_available, createdAt: t.created_at, updatedAt: t.updated_at }))
    return { results: mapped, count: response.count || mapped.length }
  },

  async getTable(id: string): Promise<Table> {
    const t: any = await apiClient.get(`/admin/tables/${id}/`)
    return { ...t, tableNumber: t.table_number, tableType: t.table_type, positionX: t.position_x, positionY: t.position_y, isActive: t.is_active, isAvailable: t.is_available, createdAt: t.created_at, updatedAt: t.updated_at }
  },

  async createTable(data: Partial<Table>): Promise<Table> {
    const snakeData = {
      table_number: data.tableNumber,
      table_type: data.tableType,
      capacity: data.capacity,
      position_x: data.positionX,
      position_y: data.positionY,
      is_active: data.isActive,
      description: data.description,
    }
    return apiClient.post('/admin/tables/', snakeData)
  },

  async updateTable(id: string, data: Partial<Table>): Promise<Table> {
    const snakeData = {
      table_number: data.tableNumber,
      table_type: data.tableType,
      capacity: data.capacity,
      position_x: data.positionX,
      position_y: data.positionY,
      is_active: data.isActive,
      description: data.description,
    }
    return apiClient.patch(`/admin/tables/${id}/`, snakeData)
  },

  async deleteTable(id: string): Promise<void> {
    return apiClient.delete(`/admin/tables/${id}/`)
  },

  // Table Bookings
  async getTableBookings(params?: {
    status?: string
    table_id?: string
    user_id?: string
  }): Promise<TableBooking[]> {
    const data: any = await apiClient.get('/admin/table-bookings/', { params })
    const rows: any[] = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : []
    return rows.map((b: any) => ({
      id: b.id,
      userId: b.user_id ?? b.userId ?? b.user,
      userEmail: b.user_email ?? b.userEmail,
      table: {
        id: b.table?.id,
        tableNumber: b.table?.tableNumber ?? b.table?.table_number ?? '',
        tableType: b.table?.tableType ?? b.table?.table_type ?? 'MEDIUM',
        capacity: b.table?.capacity ?? 0,
        positionX: b.table?.positionX ?? b.table?.position_x ?? 0,
        positionY: b.table?.positionY ?? b.table?.position_y ?? 0,
        isActive: b.table?.isActive ?? b.table?.is_active ?? true,
        isAvailable: b.table?.isAvailable ?? b.table?.is_available ?? true,
        description: b.table?.description ?? '',
        createdAt: b.table?.createdAt ?? b.table?.created_at ?? '',
        updatedAt: b.table?.updatedAt ?? b.table?.updated_at ?? '',
      },
      orderId: b.order_id ?? b.orderId ?? b.order,
      orderNumber: b.order_number ?? b.orderNumber,
      status: b.status,
      numberOfGuests: b.number_of_guests ?? b.numberOfGuests ?? 1,
      reservedAt: b.reserved_at ?? b.reservedAt,
      paymentDeadline: b.payment_deadline ?? b.paymentDeadline,
      reservedUntil: b.reserved_until ?? b.reservedUntil,
      specialRequests: b.special_requests ?? b.specialRequests,
      isPaymentOverdue: b.is_payment_overdue ?? b.isPaymentOverdue ?? false,
      isReservationActive: b.is_reservation_active ?? b.isReservationActive ?? false,
      timeRemaining: b.time_remaining ?? b.timeRemaining ?? 0,
      createdAt: b.created_at ?? b.createdAt ?? '',
      updatedAt: b.updated_at ?? b.updatedAt ?? '',
    })) as TableBooking[]
  },

  async getTableBooking(id: string): Promise<TableBooking> {
    const b: any = await apiClient.get(`/admin/table-bookings/${id}/`)
    const rows: any[] = [b]
    const mapped = (rows.map((x: any) => ({
      id: x.id,
      userId: x.user_id ?? x.userId ?? x.user,
      userEmail: x.user_email ?? x.userEmail,
      table: {
        id: x.table?.id,
        tableNumber: x.table?.tableNumber ?? x.table?.table_number ?? '',
        tableType: x.table?.tableType ?? x.table?.table_type ?? 'MEDIUM',
        capacity: x.table?.capacity ?? 0,
        positionX: x.table?.positionX ?? x.table?.position_x ?? 0,
        positionY: x.table?.positionY ?? x.table?.position_y ?? 0,
        isActive: x.table?.isActive ?? x.table?.is_active ?? true,
        isAvailable: x.table?.isAvailable ?? x.table?.is_available ?? true,
        description: x.table?.description ?? '',
        createdAt: x.table?.createdAt ?? x.table?.created_at ?? '',
        updatedAt: x.table?.updatedAt ?? x.table?.updated_at ?? '',
      },
      orderId: x.order_id ?? x.orderId ?? x.order,
      orderNumber: x.order_number ?? x.orderNumber,
      status: x.status,
      numberOfGuests: x.number_of_guests ?? x.numberOfGuests ?? 1,
      reservedAt: x.reserved_at ?? x.reservedAt,
      paymentDeadline: x.payment_deadline ?? x.paymentDeadline,
      reservedUntil: x.reserved_until ?? x.reservedUntil,
      specialRequests: x.special_requests ?? x.specialRequests,
      isPaymentOverdue: x.is_payment_overdue ?? x.isPaymentOverdue ?? false,
      isReservationActive: x.is_reservation_active ?? x.isReservationActive ?? false,
      timeRemaining: x.time_remaining ?? x.timeRemaining ?? 0,
      createdAt: x.created_at ?? x.createdAt ?? '',
      updatedAt: x.updated_at ?? x.updatedAt ?? '',
    })) as TableBooking[])[0]
    return mapped
  },

  async clearTableBooking(id: string): Promise<TableBooking> {
    return apiClient.post(`/admin/table-bookings/${id}/clear_booking/`)
  },

  async forceCompleteBooking(id: string): Promise<TableBooking> {
    return apiClient.post(`/admin/table-bookings/${id}/force_complete/`)
  },

  // University location / radius settings
  async getUniversitySettings(): Promise<UniversitySettings> {
    return apiClient.get('/admin/university-settings/')
  },

  async updateUniversitySettings(
    data: Partial<UniversitySettings>
  ): Promise<UniversitySettings> {
    return apiClient.patch('/admin/university-settings/', data)
  },
}

