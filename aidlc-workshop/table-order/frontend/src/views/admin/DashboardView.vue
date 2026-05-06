<template>
  <div class="dashboard container">
    <header class="page-header">
      <h1 class="page-title">주문 대시보드</h1>
      <nav class="admin-nav">
        <router-link to="/admin/menus">메뉴관리</router-link>
        <router-link to="/admin/tables">테이블</router-link>
        <button class="btn-secondary logout-btn" @click="handleLogout">로그아웃</button>
      </nav>
    </header>

    <div v-if="loading" class="empty-state">불러오는 중...</div>

    <div v-else-if="tableStore.tables.length === 0" class="empty-state">
      등록된 테이블이 없습니다. <router-link to="/admin/tables">테이블 등록하기</router-link>
    </div>

    <div v-else class="table-grid">
      <div
        v-for="table in tableStore.tables"
        :key="table.id"
        class="table-card card"
        :class="{ 'has-orders': getTableOrders(table.id).length > 0 }"
        :data-testid="`dashboard-table-${table.tableNumber}`"
        @click="selectedTable = table.id"
      >
        <div class="table-header">
          <span class="table-number">테이블 {{ table.tableNumber }}</span>
          <span class="table-total">{{ formatPrice(getTableTotal(table.id)) }}원</span>
        </div>
        <div class="table-orders">
          <div
            v-for="order in getTableOrders(table.id).slice(0, 3)"
            :key="order.id"
            :class="['order-preview', { 'highlight-new': isNewOrder(order) }]"
          >
            <span :class="['badge', `badge-${order.status}`]">{{ statusLabel(order.status) }}</span>
            <span class="order-summary">
              {{ order.items.map(i => i.menuName).join(', ').substring(0, 30) }}
            </span>
          </div>
        </div>
        <div class="table-actions">
          <button
            class="btn-secondary"
            :data-testid="`table-complete-${table.id}`"
            @click.stop="handleComplete(table.id)"
          >이용완료</button>
        </div>
      </div>
    </div>

    <!-- Order Detail Modal -->
    <div v-if="selectedTable" class="modal-overlay" @click.self="selectedTable = null">
      <div class="modal-content" style="max-width:600px;">
        <h2>테이블 {{ getTableNumber(selectedTable) }} - 주문 상세</h2>
        <div class="detail-orders">
          <div v-for="order in getTableOrders(selectedTable)" :key="order.id" class="detail-order card">
            <div class="detail-header">
              <span>#{{ order.id }} - {{ formatTime(order.createdAt) }}</span>
              <span :class="['badge', `badge-${order.status}`]">{{ statusLabel(order.status) }}</span>
            </div>
            <div v-for="item in order.items" :key="item.id" class="detail-item">
              {{ item.menuName }} x{{ item.quantity }} ({{ formatPrice(item.unitPrice * item.quantity) }}원)
            </div>
            <div class="detail-actions">
              <button
                v-if="order.status === 'pending'"
                class="btn-primary"
                @click="changeStatus(order.id, 'preparing')"
              >준비중</button>
              <button
                v-if="order.status === 'preparing'"
                class="btn-primary"
                @click="changeStatus(order.id, 'completed')"
              >완료</button>
              <button class="btn-danger" @click="handleDeleteOrder(order.id)">삭제</button>
            </div>
          </div>
        </div>
        <button class="btn-secondary" style="margin-top:16px;width:100%;" @click="selectedTable = null">닫기</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useOrderStore, type Order } from '../../stores/order';
import { useTableStore } from '../../stores/table';
import { useAuthStore } from '../../stores/auth';
import { sseClient } from '../../services/sse';

const router = useRouter();
const orderStore = useOrderStore();
const tableStore = useTableStore();
const authStore = useAuthStore();

const loading = ref(true);
const selectedTable = ref<number | null>(null);
const newOrderIds = ref<Set<number>>(new Set());

function getTableOrders(tableId: number): Order[] {
  return orderStore.orders.filter((o) => o.tableId === tableId);
}

function getTableTotal(tableId: number): number {
  return getTableOrders(tableId).reduce((sum, o) => sum + o.totalAmount, 0);
}

function getTableNumber(tableId: number): number {
  return tableStore.tables.find((t) => t.id === tableId)?.tableNumber || 0;
}

function isNewOrder(order: Order): boolean {
  return newOrderIds.value.has(order.id);
}

function statusLabel(status: string): string {
  const labels: Record<string, string> = { pending: '대기중', preparing: '준비중', completed: '완료' };
  return labels[status] || status;
}

function formatPrice(price: number): string {
  return price.toLocaleString();
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

async function changeStatus(orderId: number, status: string) {
  await orderStore.updateOrderStatus(orderId, status);
}

async function handleDeleteOrder(orderId: number) {
  if (confirm('이 주문을 삭제하시겠습니까?')) {
    await orderStore.deleteOrder(orderId);
  }
}

async function handleComplete(tableId: number) {
  if (confirm('이 테이블의 이용을 완료하시겠습니까? 주문 내역이 과거 이력으로 이동됩니다.')) {
    await tableStore.completeSession(tableId);
    orderStore.handleSSESessionCompleted({ tableId });
  }
}

function handleLogout() {
  sseClient.disconnect();
  authStore.logout();
  router.push('/admin/login');
}

onMounted(async () => {
  authStore.checkAuth();
  if (!authStore.isAdmin) {
    router.push('/admin/login');
    return;
  }

  await Promise.all([tableStore.fetchTables(), orderStore.fetchOrders()]);
  loading.value = false;

  // Connect SSE
  const token = authStore.token;
  if (token) {
    sseClient.connect(token);
    sseClient.on('new_order', (order: Order) => {
      orderStore.handleSSENewOrder(order);
      newOrderIds.value.add(order.id);
      setTimeout(() => newOrderIds.value.delete(order.id), 3000);
    });
    sseClient.on('order_updated', (order: Order) => {
      orderStore.handleSSEOrderUpdate(order);
    });
    sseClient.on('order_deleted', (data: { orderId: number }) => {
      orderStore.handleSSEOrderDeleted(data);
    });
    sseClient.on('session_completed', (data: { tableId: number }) => {
      orderStore.handleSSESessionCompleted(data);
    });
  }
});

onUnmounted(() => {
  sseClient.disconnect();
});
</script>

<style scoped lang="scss">
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.admin-nav {
  display: flex;
  gap: 16px;
  align-items: center;
  a { color: var(--primary-color); text-decoration: none; }
}

.logout-btn { padding: 6px 12px; font-size: 0.85rem; }

.table-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.table-card {
  cursor: pointer;
  transition: box-shadow 0.2s;
  &:hover { box-shadow: var(--shadow-lg); }
  &.has-orders { border-left: 4px solid var(--primary-color); }
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.table-number { font-weight: 700; font-size: 1.1rem; }
.table-total { font-weight: 600; color: var(--primary-color); }

.order-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  font-size: 0.85rem;
}

.order-summary {
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.table-actions {
  margin-top: 12px;
  button { width: 100%; padding: 8px; font-size: 0.85rem; }
}

.detail-orders {
  max-height: 60vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.detail-item {
  font-size: 0.85rem;
  padding: 2px 0;
  color: var(--text-secondary);
}

.detail-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  button { padding: 6px 12px; font-size: 0.8rem; }
}
</style>
