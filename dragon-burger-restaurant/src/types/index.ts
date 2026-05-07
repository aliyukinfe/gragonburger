export interface OrderItem {
  name: string
  price: number
  qty: number
}

export interface DeliveryInfo {
  name: string
  phone: string
  address: string
}

export interface Order {
  id: string
  order_num: number
  created_at: string
  customer_name: string
  order_ref?: string
  order_type: 'dine-in' | 'takeaway' | 'delivery'
  items: OrderItem[]
  total: number
  delivery_status: 'pending' | 'preparing' | 'ready' | 'delivered'
  payment_status: 'unpaid' | 'paid' | 'udhaar'
  notes?: string
  delivery_info?: DeliveryInfo
  updated_at: string
}

export type MenuCategory = string
export type MenuItems = Record<MenuCategory, { name: string; price: number }[]>

export interface AccountStatus {
  is_active: boolean
  expires_at: string | null
  activated_at: string
}
