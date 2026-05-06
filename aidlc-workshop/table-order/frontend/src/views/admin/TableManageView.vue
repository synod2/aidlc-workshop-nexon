<template>
  <div class="table-manage container">
    <header class="page-header">
      <h1 class="page-title">테이블 관리</h1>
      <nav class="admin-nav">
        <router-link to="/admin/dashboard">대시보드</router-link>
        <router-link to="/admin/menus">메뉴관리</router-link>
      </nav>
    </header>

    <button class="btn-primary" data-testid="table-add-btn" @click="showForm = true">+ 테이블 추가</button>

    <div class="table-list">
      <div
        v-for="table in tableStore.tables"
        :key="table.id"
        class="table-row card"
        :data-testid="`table-row-${table.tableNumber}`"
      >
        <div class="table-info">
          <strong>테이블 {{ table.tableNumber }}</strong>
        </div>
        <div class="table-actions">
          <button class="btn-secondary" @click="viewHistory(table.id)">과거 내역</button>
          <button class="btn-danger" @click="handleComplete(table.id)">이용완료</button>
        </div>
      </div>
    </div>

    <!-- Add Table Modal -->
    <div v-if="showForm" class="modal-overlay" @click.self="showForm = false">
      <div class="modal-content">
        <h2>테이블 추가</h2>
        <form @submit.prevent="handleCreate" data-testid="table-create-form">
          <div class="form-group">
            <label>테이블 번호</label>
            <input v-model.number="newTableNumber" type="number" min="1" required data-testid="table-form-number" />
          </div>
          <div class="form-group">
            <label>비밀번호</label>
            <input v-model="newTablePassword" type="password" required data-testid="table-form-password" />
          </div>
          <p v-if="formError" class="error-message">{{ formError }}</p>
          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="showForm = false">취소</button>
            <button type="submit" class="btn-primary" data-testid="table-form-submit">추가</button>
          </div>
        </form>
      </div>
    </div>

    <!-- History Modal -->
    <div v-if="showHistory" class="modal-overlay" @click.self="showHistory = false">
      <div class="modal-content" style="max-width:600px;">
        <h2>과거 주문 내역</h2>
        <div class="history-filters">
          <input v-model="historyStartDate" type="date" />
          <input v-model="historyEndDate" type="date" />
          <button class="btn-secondary" @click="loadHistory">조회</button>
        </div>
        <div v-if="historyData.length === 0" class="empty-state">내역이 없습니다</div>
        <div v-else class="history-list">
          <div v-for="session in historyData" :key="session.session.id" class="history-session card">
            <div class="session-header">
              <span>{{ formatDate(session.session.completedAt) }}</span>
            </div>
            <div v-for="order in session.orders" :key="order.id" class="history-order">
              <span>#{{ order.id }}</span>
              <span>{{ order.totalAmount.toLocaleString() }}원</span>
              <div class="history-items">
                <span v-for="item in order.items" :key="item.id" class="history-item">
                  {{ item.menuName }} x{{ item.quantity }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <button class="btn-secondary" style="margin-top:16px;width:100%;" @click="showHistory = false">닫기</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useTableStore, type SessionHistory } from '../../stores/table';

const tableStore = useTableStore();

const showForm = ref(false);
const showHistory = ref(false);
const newTableNumber = ref<number>(1);
const newTablePassword = ref('');
const formError = ref('');
const historyTableId = ref<number>(0);
const historyStartDate = ref('');
const historyEndDate = ref('');
const historyData = ref<SessionHistory[]>([]);

async function handleCreate() {
  formError.value = '';
  try {
    await tableStore.createTable(newTableNumber.value, newTablePassword.value);
    showForm.value = false;
    newTableNumber.value = 1;
    newTablePassword.value = '';
  } catch (err: any) {
    formError.value = err.response?.data?.error || '테이블 추가에 실패했습니다';
  }
}

async function handleComplete(tableId: number) {
  if (confirm('이 테이블의 이용을 완료하시겠습니까?')) {
    try {
      await tableStore.completeSession(tableId);
    } catch (err: any) {
      alert(err.response?.data?.error || '처리에 실패했습니다');
    }
  }
}

function viewHistory(tableId: number) {
  historyTableId.value = tableId;
  historyData.value = [];
  showHistory.value = true;
  loadHistory();
}

async function loadHistory() {
  historyData.value = await tableStore.fetchHistory(
    historyTableId.value,
    historyStartDate.value || undefined,
    historyEndDate.value || undefined
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('ko-KR');
}

onMounted(() => {
  tableStore.fetchTables();
});
</script>

<style scoped lang="scss">
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.admin-nav {
  display: flex;
  gap: 16px;
  a { color: var(--primary-color); text-decoration: none; }
}

.table-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 20px;
}

.table-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
}

.table-actions {
  display: flex;
  gap: 8px;
  button { padding: 6px 12px; font-size: 0.85rem; }
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 16px;
}

.history-filters {
  display: flex;
  gap: 8px;
  margin: 12px 0;
  input { max-width: 150px; }
}

.history-session {
  margin-bottom: 12px;
}

.session-header {
  font-weight: 600;
  margin-bottom: 8px;
}

.history-order {
  padding: 4px 0;
  font-size: 0.9rem;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.history-items {
  width: 100%;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.history-item {
  margin-right: 8px;
}
</style>
