import Cookies from 'js-cookie'
import { useNotificationStore } from '@/stores/notificationStore'
import toast from 'react-hot-toast'

class WebSocketService {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000
  private reconnectTimer: NodeJS.Timeout | null = null
  private pingInterval: NodeJS.Timeout | null = null
  private isConnecting = false
  private currentToken: string | null = null

  connect() {
    // Only run in browser
    if (typeof window === 'undefined') {
      return
    }

    const token = Cookies.get('access_token')
    if (!token) {
      // No token, disconnect if connected
      this.disconnect()
      return
    }

    // If already connected with the same token, don't reconnect
    if (this.ws?.readyState === WebSocket.OPEN && this.currentToken === token) {
      return
    }

    // If token changed or connection is closed, disconnect first
    if (this.currentToken && this.currentToken !== token) {
      this.disconnect()
    }

    // If already connecting, wait
    if (this.isConnecting) {
      return
    }

    this.currentToken = token
    this.isConnecting = true

    try {
      // Derive WebSocket base URL from API base URL (same pattern as orders page)
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'
      const wsBase = apiBase
        .replace(/^http:/, 'ws:')
        .replace(/^https:/, 'wss:')
        .replace(/\/api\/v1\/?$/, '')

      const wsUrl = `${wsBase}/ws/orders/?token=${encodeURIComponent(token)}`
      
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        this.isConnecting = false
        this.reconnectAttempts = 0
        
        // Start ping interval to keep connection alive
        this.pingInterval = setInterval(() => {
          if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'ping' }))
          }
        }, 30000) // Ping every 30 seconds
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          // Handle pong response
          if (data.type === 'pong') {
            return
          }
          
          // Handle order updates
          if (data.type === 'order_update') {
            this.handleOrderUpdate(data.data)
          } else if (data.type === 'order_status_change') {
            this.handleOrderStatusChange(data)
          } else if (data.type === 'order_assigned') {
            this.handleOrderAssigned(data)
          }
        } catch (error) {
          console.error('[WebSocket] Error parsing message:', error)
        }
      }

      this.ws.onerror = (error) => {
        this.isConnecting = false
      }

      this.ws.onclose = (event) => {
        this.isConnecting = false
        
        // Clear ping interval
        if (this.pingInterval) {
          clearInterval(this.pingInterval)
          this.pingInterval = null
        }
        
        // Don't reconnect if closed due to authentication error (1008) or policy violation (1008)
        // or if token is no longer available
        const token = Cookies.get('access_token')
        if (event.code === 1008 || event.code === 1003 || !token || token !== this.currentToken) {
          // Authentication failed or token changed - don't auto-reconnect
          this.currentToken = null
          this.ws = null
          return
        }
        
        // Attempt to reconnect only if token is still valid
        this.attemptReconnect()
      }
    } catch (error) {
      console.error('[WebSocket] Connection error:', error)
      this.isConnecting = false
      this.attemptReconnect()
    }
  }

  private attemptReconnect() {
    // Check if token still exists and matches
    const token = Cookies.get('access_token')
    if (!token || token !== this.currentToken) {
      // Token changed or removed, don't reconnect
      this.currentToken = null
      return
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * this.reconnectAttempts
    
    this.reconnectTimer = setTimeout(() => {
      this.connect()
    }, delay)
  }

  private handleOrderUpdate(orderData: any) {
    const notificationStore = useNotificationStore.getState()
    
    // Check if this is a new order (created within last 30 seconds)
    // The backend sends order_update for both new and updated orders
    const createdDate = orderData.created_at || orderData.createdAt
    
    if (createdDate) {
      const orderDate = new Date(createdDate)
      const timeDiff = Date.now() - orderDate.getTime()
      const isNew = timeDiff < 30000 // Created within last 30 seconds
      
      if (isNew) {
        const orderNumber = orderData.order_number || orderData.orderNumber || orderData.id
        const userName = orderData.user?.name || orderData.user_name || 'Customer'
        const totalAmount = orderData.total_amount || orderData.totalAmount || '0'
        
        notificationStore.addNotification({
          type: 'new_order',
          title: 'New Order Received!',
          message: `Order #${orderNumber} from ${userName} - Total: $${totalAmount}`,
          orderId: orderData.id,
          orderNumber: orderNumber,
          data: orderData,
        })
        
        // Show toast notification
        toast.success(`New Order: #${orderNumber}`, {
          duration: 5000,
        })
        return
      }
    }
    
    // Existing order update
    const orderNumber = orderData.order_number || orderData.orderNumber || orderData.id
    notificationStore.addNotification({
      type: 'order_update',
      title: 'Order Updated',
      message: `Order #${orderNumber} has been updated`,
      orderId: orderData.id,
      orderNumber: orderNumber,
      data: orderData,
    })
  }

  private handleOrderStatusChange(data: any) {
    const notificationStore = useNotificationStore.getState()
    notificationStore.addNotification({
      type: 'order_status_change',
      title: 'Order Status Changed',
      message: data.message || `Order status changed to ${data.status}`,
      orderId: data.order_id,
      data: data,
    })
    
    toast.info(`Order Status: ${data.status}`, {
      duration: 3000,
    })
  }

  private handleOrderAssigned(data: any) {
    const notificationStore = useNotificationStore.getState()
    notificationStore.addNotification({
      type: 'order_update',
      title: 'Rider Assigned',
      message: `A rider has been assigned to order #${data.order_id}`,
      orderId: data.order_id,
      data: data,
    })
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
    
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    
    this.isConnecting = false
    this.reconnectAttempts = 0
    this.currentToken = null
  }

  reconnect() {
    /** Force reconnect with current token (useful after login). */
    this.disconnect()
    // Small delay to ensure cleanup completes
    setTimeout(() => {
      this.connect()
    }, 100)
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  getCurrentToken(): string | null {
    return this.currentToken
  }
}

// Singleton instance
export const websocketService = new WebSocketService()

