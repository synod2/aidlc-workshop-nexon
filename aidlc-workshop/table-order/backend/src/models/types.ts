// Domain Entity Types

export interface Store {
  id: string;
  name: string;
  createdAt: string;
}

export interface Admin {
  id: number;
  storeId: string;
  username: string;
  passwordHash: string;
  createdAt: string;
}

export interface Table {
  id: number;
  storeId: string;
  tableNumber: number;
  passwordHash: string;
  createdAt: string;
}

export interface TableSession {
  id: string;
  tableId: number;
  storeId: string;
  startedAt: string;
  completedAt: string | null;
}

export interface Category {
  id: number;
  storeId: string;
  name: string;
  sortOrder: number;
}

export interface MenuItem {
  id: number;
  categoryId: number;
  storeId: string;
  name: string;
  price: number;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isAvailable: number;
  createdAt: string;
}

export interface Order {
  id: number;
  sessionId: string;
  tableId: number;
  storeId: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
}

export type OrderStatus = 'pending' | 'preparing' | 'completed';

export interface OrderItem {
  id: number;
  orderId: number;
  menuItemId: number;
  menuName: string;
  quantity: number;
  unitPrice: number;
}

// DTO Types

export interface CreateAdminDTO {
  storeId: string;
  username: string;
  password: string;
}

export interface LoginDTO {
  storeId: string;
  username: string;
  password: string;
}

export interface TableLoginDTO {
  storeId: string;
  tableNumber: number;
  password: string;
}

export interface CreateTableDTO {
  storeId: string;
  tableNumber: number;
  password: string;
}

export interface CreateCategoryDTO {
  storeId: string;
  name: string;
  sortOrder?: number;
}

export interface CreateMenuDTO {
  categoryId: number;
  storeId: string;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  sortOrder?: number;
}

export interface UpdateMenuDTO {
  name?: string;
  price?: number;
  description?: string;
  imageUrl?: string;
  categoryId?: number;
  sortOrder?: number;
  isAvailable?: number;
}

export interface CreateOrderDTO {
  storeId: string;
  tableId: number;
  items: CreateOrderItemDTO[];
}

export interface CreateOrderItemDTO {
  menuItemId: number;
  quantity: number;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

// JWT Payload Types

export interface AdminTokenPayload {
  adminId: number;
  storeId: string;
  role: 'admin';
}

export interface TableTokenPayload {
  tableId: number;
  storeId: string;
  tableNumber: number;
  role: 'table';
}

export type TokenPayload = AdminTokenPayload | TableTokenPayload;

// API Response Types

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
