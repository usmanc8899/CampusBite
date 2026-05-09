export interface User {
  id: string
  email: string
  name: string
  userType: 'STUDENT' | 'FACULTY' | 'ADMIN'
  studentId?: string
  department?: string
  phone?: string
  isRider: boolean
  isVerified: boolean
  isActive: boolean
  createdAt: string
}

export interface MenuItem {
  id: string
  name: string
  description: string
  category: Category
  price: number
  image?: string
  stockQuantity: number
  isAvailable: boolean
  preparationTime: number
  nutritionalInfo?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  description?: string
  image?: string
  display_order?: number
  // Legacy or for form use
  displayOrder?: number
  is_active?: boolean
  isActive?: boolean
}

export interface Order {
  id: string
  orderNumber: string
  user: User
  orderType: 'PICKUP' | 'DELIVERY' | 'DINE_IN'
  items: OrderItem[]
  totalAmount: number
  deliveryLocation?: string
  pickupLocation?: string
  paymentMethod: 'CASH' | 'ONLINE'
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED'
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED'
  isPriority: boolean
  tableBooking?: TableBooking
  // Backend may return rider as UUID string; extra rider fields can be provided separately.
  rider?: { id: string; name?: string; phone?: string } | string
  riderName?: string
  riderEmail?: string
  createdAt: string
  updatedAt: string
  deliveredAt?: string
}

export interface OrderItem {
  id: string
  menuItem: MenuItem
  quantity: number
  price: number
  subtotal: number
}

export interface Payment {
  id: string
  order: Order
  user: User | { id: string; name: string; email: string }
  amount: number
  method?: 'CASH' | 'ONLINE'
  payment_method?: 'CASH' | 'ONLINE'
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
  transactionId?: string
  transaction_id?: string
  createdAt?: string
  created_at?: string
}

export interface AnalyticsOverview {
  todayOrders: number
  todayOrdersChange: number
  todayRevenue: number
  todayRevenueChange: number
  pendingOrders: number
  activeRiders: number
  revenueChart: Array<{ date: string; revenue: number }>
  ordersByCategory: Array<{ category: string; count: number }>
  peakHours: Array<{ hour: number; count: number }>
  recentOrders: Order[]
}

export interface SalesReport {
  totalRevenue: number
  revenueGrowth: number
  totalOrders: number
  ordersGrowth: number
  averageOrderValue: number
  topSellingCategory: string
  revenueTrend: Array<{ date: string; revenue: number }>
  ordersByCategory: Array<{ category: string; count: number; revenue: number }>
}

export interface PopularItem {
  menuItem: MenuItem
  timesOrdered: number
  totalRevenue: number
  percentage: number
}

export interface Forecast {
  menuItem: MenuItem
  predictedQuantity: number
  confidenceLow: number
  confidenceHigh: number
  currentStock: number
  recommendedStock: number
}

export interface ForecastItem {
  date: string
  predictedQuantity: number
  confidenceLow: number
  confidenceHigh: number
}

export interface Promotion {
  id: string
  title: string
  description: string
  image?: string
  imageUrl?: string
  promotionType: 'PERCENTAGE' | 'FIXED' | 'BUY_ONE_GET_ONE' | 'FREE_DELIVERY'
  promotion_type?: 'PERCENTAGE' | 'FIXED' | 'BUY_ONE_GET_ONE' | 'FREE_DELIVERY'
  discountValue: number
  discount_value?: number | string
  minOrderAmount: number
  min_order_amount?: number | string
  maxDiscountAmount?: number
  max_discount_amount?: number | string
  validFrom: string
  valid_from?: string
  validUntil: string
  valid_until?: string
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED'
  usageLimit?: number
  usage_limit?: number
  usedCount: number
  used_count?: number
  isActive: boolean
  is_active?: boolean
  isValidPromo?: boolean
  is_valid_promo?: boolean
  createdAt: string
  created_at?: string
  updatedAt: string
  updated_at?: string
}

export interface Notification {
  id: string
  type: 'NEW_ORDER' | 'LOW_STOCK' | 'PAYMENT_FAILURE' | 'SYSTEM_ALERT'
  title: string
  message: string
  isRead: boolean
  createdAt: string
  orderId?: string
  itemId?: string
}

export interface Table {
  id: string
  tableNumber: string
  tableType: 'SMALL' | 'MEDIUM' | 'LARGE' | 'BOOTH'
  capacity: number
  positionX: number
  positionY: number
  isActive: boolean
  isAvailable: boolean
  description?: string
  createdAt: string
  updatedAt: string
}

export interface TableBooking {
  id: string
  userId: string
  userEmail: string
  table: Table
  orderId?: string
  orderNumber?: string
  status: 'PENDING' | 'RESERVED' | 'CONFIRMED' | 'EXPIRED' | 'CANCELLED' | 'COMPLETED'
  numberOfGuests: number
  reservedAt: string
  paymentDeadline: string
  reservedUntil?: string
  specialRequests?: string
  isPaymentOverdue: boolean
  isReservationActive: boolean
  timeRemaining: number
  createdAt: string
  updatedAt: string
}

export interface UniversitySettings {
  id: string
  name: string
  latitude: number
  longitude: number
  // Radius (km) - backend uses snake_case, frontend may use camelCase
  serviceRadiusKm?: number
  service_radius_km?: number
  // Location verification toggle
  locationVerificationEnabled?: boolean
  location_verification_enabled?: boolean
}

