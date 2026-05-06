<template>
  <div class="history-page container">
    <header class="page-header">
      <router-link to="/customer/menu" class="back-link">← 메뉴</router-link>
      <h1 class="page-title">주문 내역</h1>
    </header>

    <div v-if="orderStore.loading" class="empty-state">불러오는 중...</div>
    <div v-else-if="orderStore.orders.length === 0" class="empty-state">
      주문 내역이 없습니다
    </div>

    <div v-else class="order-list">
      <div
        v-for="order in orderStore.orders"
        :key="order.id"
        :class="['order-card', 'card', { 'highlight-new': highlightedOrders.has(order.id) }]"
        :data-testid="`order-card-${order.id}`"
      >
        <div class="order-header">
          <span class="order-id">#{{ order.id }}</span>
          <span :class="['badge', `badge-${order.status}`]">
            {{ statusLabel(order.status) }}
          </span>
        </div>
        <div class="order-time">{{ formatTime(order.createdAt) }}</div>
        <div class="order-items">
          <div v-for="item in order.items" :key="item.id" class="order-item-row">
            <span>{{ item.menuName }} x{{ item.quantity }}</span>
            <span>{{ formatPrice(item.unitPrice * item.quantity) }}원</span>
          </div>
        </div>
        <div class="order-total">
          <span>합계</span>
          <span class="total-amount">{{ formatPrice(order.totalAmount) }}원</span>
        </div>
      </div>
    </div>

    <!-- Toast notification -->
    <div v-if="toast" class="toast">{{ toast }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useOrderStore, type Order } from '../../stores/order';
import { useAuthStore } from '../../stores/auth';

const orderStore = useOrderStore();
const authStore = useAuthStore();

const toast = ref('');
const highlightedOrders = ref<Set<number>>(new Set());
let eventSource: EventSource | null = null;

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: '대기중',
    preparing: '준비중',
    completed: '완료',
    rejected: '거절됨',
  };
  return labels[status] || status;
}

function formatPrice(price: number): string {
  return price.toLocaleString();
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

function showToast(message: string) {
  toast.value = message;
  setTimeout(() => { toast.value = ''; }, 4000);
}

function connectSSE() {
  const token = localStorage.getItem('table_token');
  if (!token) return;

  eventSource = new EventSource(`/api/sse/table?token=${token}`);

  eventSource.addEventListener('order_updated', (event) => {
    const order = JSON.parse(event.data) as Order;

    // Update order in store
    orderStore.handleSSEOrderUpdate(order);

    // Highlight and notify
    highlightedOrders.value.add(order.id);
    setTimeout(() => highlightedOrders.value.delete(order.id), 3000);

    if (order.status === 'preparing') {
      showToast(`🍳 주문 #${order.id} 준비가 시작되었습니다!`);
    } else if (order.status === 'completed') {
      showToast(`✅ 주문 #${order.id} 준비가 완료되었습니다!`);
    }
  });

  eventSource.onerror = () => {
    console.warn('Table SSE connection error');
  };
}

onMounted(() => {
  orderStore.fetchOrders();
  connectSSE();
});

onUnmounted(() => {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }
});
</script>

<style scoped lang="scss">
.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.back-link {
  color: var(--text-secondary);
  text-decoration: none;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.order-id {
  font-weight: 700;
}

.order-time {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.order-item-row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 0.9rem;
}

.order-total {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--border-color);
  font-weight: 600;
}

.total-amount {
  color: var(--primary-color);
}
</style>
