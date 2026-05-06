<template>
  <div class="app-wrapper">
    <!-- Global notification bell (visible when logged in) -->
    <div v-if="authStore.isAuthenticated" class="global-notification-bar">
      <button class="notification-bell" @click="notifStore.showModal = true" data-testid="global-notification-bell">
        🔔
        <span v-if="notifStore.unreadCount > 0" class="notification-badge">{{ notifStore.unreadCount }}</span>
      </button>
    </div>

    <router-view />

    <!-- Notification Modal -->
    <div v-if="notifStore.showModal" class="modal-overlay" @click.self="notifStore.showModal = false">
      <div class="modal-content notification-modal">
        <div class="notif-modal-header">
          <h2>알림</h2>
          <button v-if="notifStore.unreadCount > 0" class="btn-secondary" @click="notifStore.dismissAll()">모두 읽음</button>
        </div>
        <div v-if="notifStore.notifications.length === 0" class="empty-state">알림이 없습니다</div>
        <div v-else class="notification-list">
          <div
            v-for="notif in notifStore.notifications"
            :key="notif.id"
            class="notification-item"
          >
            <div class="notif-content">
              <span class="notif-icon">{{ notif.icon }}</span>
              <div class="notif-text">
                <p class="notif-message">{{ notif.message }}</p>
                <span class="notif-time">{{ formatTime(notif.timestamp) }}</span>
              </div>
            </div>
            <button class="btn-secondary notif-dismiss" @click="notifStore.dismiss(notif.id)">확인</button>
          </div>
        </div>
        <button class="btn-secondary" style="margin-top:16px;width:100%;" @click="notifStore.showModal = false">닫기</button>
      </div>
    </div>

    <!-- Global toast -->
    <div v-if="toast" class="toast">{{ toast }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from './stores/auth';
import { useOrderStore } from './stores/order';
import { useMenuStore } from './stores/menu';
import { useNotificationStore } from './stores/notification';
import { sseClient } from './services/sse';

const authStore = useAuthStore();
const orderStore = useOrderStore();
const menuStore = useMenuStore();
const notifStore = useNotificationStore();

const toast = ref('');
let tableEventSource: EventSource | null = null;
let adminSSEConnected = false;

function showToast(message: string) {
  toast.value = message;
  setTimeout(() => { toast.value = ''; }, 4000);
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ===== TABLE SSE =====
function connectTableSSE() {
  if (tableEventSource) {
    tableEventSource.close();
    tableEventSource = null;
  }

  const token = localStorage.getItem('table_token');
  if (!token) return;

  tableEventSource = new EventSource(`/api/sse/table?token=${token}`);

  tableEventSource.addEventListener('order_updated', (event) => {
    const order = JSON.parse(event.data);
    orderStore.handleSSEOrderUpdate(order);

    if (order.status === 'preparing') {
      const msg = `주문 #${order.id} 준비가 시작되었습니다!`;
      showToast(`🍳 ${msg}`);
      notifStore.add('🍳', msg);
    } else if (order.status === 'completed') {
      const msg = `주문 #${order.id} 준비가 완료되었습니다!`;
      showToast(`✅ ${msg}`);
      notifStore.add('✅', msg);
    } else if (order.status === 'rejected') {
      const msg = `주문 #${order.id}이 거절되었습니다. 직원에게 문의해주세요.`;
      showToast(`❌ ${msg}`);
      notifStore.add('❌', msg);
    }
  });

  tableEventSource.addEventListener('menu_updated', (event) => {
    const menuItem = JSON.parse(event.data);
    const index = menuStore.menuItems.findIndex((m) => m.id === menuItem.id);
    if (index !== -1) {
      menuStore.menuItems[index] = menuItem;
    }
    if (!menuItem.isAvailable) {
      const msg = `"${menuItem.name}" 메뉴가 매진되었습니다`;
      showToast(`⚠️ ${msg}`);
      notifStore.add('⚠️', msg);
    } else {
      const msg = `"${menuItem.name}" 메뉴가 판매 재개되었습니다`;
      showToast(`✅ ${msg}`);
      notifStore.add('✅', msg);
    }
  });

  tableEventSource.onopen = () => {
    console.log('Table SSE connected');
  };

  tableEventSource.onerror = () => {
    console.warn('Table SSE error, will auto-reconnect...');
  };
}

function disconnectTableSSE() {
  if (tableEventSource) {
    tableEventSource.close();
    tableEventSource = null;
  }
}

// ===== ADMIN SSE =====
function connectAdminSSE() {
  if (adminSSEConnected) return;

  const token = localStorage.getItem('admin_token');
  if (!token) {
    console.warn('Admin SSE: no token found');
    return;
  }

  console.log('Admin SSE: connecting...');
  sseClient.connect(token);
  adminSSEConnected = true;

  sseClient.on('new_order', (order: any) => {
    orderStore.handleSSENewOrder(order);
    const menuNames = order.items?.map((i: any) => i.menuName).join(', ') || '';
    const msg = `테이블 ${order.tableId} 새 주문: ${menuNames}`;
    showToast(`🔔 ${msg}`);
    notifStore.add('🍽️', msg);
  });

  sseClient.on('order_updated', (order: any) => {
    orderStore.handleSSEOrderUpdate(order);
  });

  sseClient.on('order_deleted', (data: any) => {
    orderStore.handleSSEOrderDeleted(data);
  });

  sseClient.on('session_completed', (data: any) => {
    orderStore.handleSSESessionCompleted(data);
  });

  sseClient.on('table_request', (data: any) => {
    const typeLabels: Record<string, string> = {
      call_staff: '직원 호출',
      wet_tissue: '물티슈 요청',
      water: '물 요청',
      utensils: '수저/포크 요청',
    };
    const label = typeLabels[data.requestType] || data.requestType;
    const msg = `테이블 ${data.tableNumber}: ${label}${data.message ? ' - ' + data.message : ''}`;
    showToast(`🔔 ${msg}`);
    notifStore.add('🙋', msg);
  });
}

function disconnectAdminSSE() {
  if (adminSSEConnected) {
    sseClient.disconnect();
    adminSSEConnected = false;
  }
}

// ===== LIFECYCLE =====
watch(
  () => authStore.isTable,
  (isTable) => {
    if (isTable) {
      disconnectAdminSSE();
      connectTableSSE();
    } else {
      disconnectTableSSE();
    }
  }
);

watch(
  () => authStore.isAdmin,
  (isAdmin) => {
    if (isAdmin) {
      disconnectTableSSE();
      connectAdminSSE();
    } else {
      disconnectAdminSSE();
    }
  }
);

onMounted(() => {
  authStore.checkAuth();
  // Connect SSE based on current auth state
  if (authStore.isTable) {
    connectTableSSE();
  }
  if (authStore.isAdmin) {
    connectAdminSSE();
  }
});

onUnmounted(() => {
  disconnectTableSSE();
  disconnectAdminSSE();
});
</script>

<style scoped>
.app-wrapper {
  position: relative;
}

.global-notification-bar {
  position: fixed;
  bottom: 20px;
  left: 16px;
  z-index: 900;
}

.notification-bell {
  position: relative;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 50%;
  width: 44px;
  height: 44px;
  font-size: 1.3rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow);
  padding: 0;
  min-width: 44px;
  min-height: 44px;
}

.notification-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: var(--danger-color);
  color: white;
  font-size: 0.65rem;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.notification-modal {
  max-width: 500px;
}

.notif-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.notification-list {
  max-height: 60vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.notification-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--bg-color);
  border-radius: var(--radius);
}

.notif-content {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  flex: 1;
}

.notif-icon {
  font-size: 1.2rem;
}

.notif-message {
  font-size: 0.9rem;
  margin-bottom: 2px;
}

.notif-time {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.notif-dismiss {
  padding: 4px 10px;
  font-size: 0.8rem;
  min-width: auto;
  min-height: auto;
}
</style>
