import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../services/api';

export interface OrderItem {
  id: number;
  orderId: number;
  menuItemId: number;
  menuName: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: number;
  sessionId: string;
  tableId: number;
  storeId: string;
  totalAmount: number;
  status: 'pending' | 'preparing' | 'completed';
  createdAt: string;
  items: OrderItem[];
}

export const useOrderStore = defineStore('order', () => {
  const orders = ref<Order[]>([]);
  const loading = ref(false);

  async function fetchOrders(sessionId?: string, tableId?: number) {
    loading.value = true;
    try {
      const params: any = {};
      if (sessionId) params.sessionId = sessionId;
      if (tableId) params.tableId = tableId;
      const res = await api.get('/orders', { params });
      orders.value = res.data.data;
    } finally {
      loading.value = false;
    }
  }

  async function createOrder(items: { menuItemId: number; quantity: number }[]) {
    const res = await api.post('/orders', { items });
    return res.data.data as Order;
  }

  async function updateOrderStatus(orderId: number, status: string) {
    const res = await api.patch(`/orders/${orderId}/status`, { status });
    const index = orders.value.findIndex((o) => o.id === orderId);
    if (index !== -1) {
      orders.value[index] = res.data.data;
    }
    return res.data.data;
  }

  async function deleteOrder(orderId: number) {
    await api.delete(`/orders/${orderId}`);
    orders.value = orders.value.filter((o) => o.id !== orderId);
  }

  function handleSSENewOrder(order: Order) {
    orders.value.unshift(order);
  }

  function handleSSEOrderUpdate(order: Order) {
    const index = orders.value.findIndex((o) => o.id === order.id);
    if (index !== -1) {
      orders.value[index] = order;
    }
  }

  function handleSSEOrderDeleted(data: { orderId: number }) {
    orders.value = orders.value.filter((o) => o.id !== data.orderId);
  }

  function handleSSESessionCompleted(data: { tableId: number }) {
    orders.value = orders.value.filter((o) => o.tableId !== data.tableId);
  }

  return {
    orders,
    loading,
    fetchOrders,
    createOrder,
    updateOrderStatus,
    deleteOrder,
    handleSSENewOrder,
    handleSSEOrderUpdate,
    handleSSEOrderDeleted,
    handleSSESessionCompleted,
  };
});
