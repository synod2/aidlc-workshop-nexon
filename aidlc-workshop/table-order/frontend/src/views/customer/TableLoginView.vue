<template>
  <div class="login-page">
    <div class="login-card card">
      <h1 class="page-title">테이블 설정</h1>
      <p class="subtitle">매장 정보를 입력해주세요</p>

      <form @submit.prevent="handleLogin" data-testid="table-login-form">
        <div class="form-group">
          <label for="storeId">매장 식별자</label>
          <input
            id="storeId"
            v-model="storeId"
            type="text"
            placeholder="매장 ID"
            required
            data-testid="table-login-store-id"
          />
        </div>
        <div class="form-group">
          <label for="tableNumber">테이블 번호</label>
          <input
            id="tableNumber"
            v-model.number="tableNumber"
            type="number"
            placeholder="테이블 번호"
            required
            min="1"
            data-testid="table-login-table-number"
          />
        </div>
        <div class="form-group">
          <label for="password">비밀번호</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="비밀번호"
            required
            data-testid="table-login-password"
          />
        </div>

        <p v-if="error" class="error-message">{{ error }}</p>

        <button type="submit" class="btn-primary login-btn" data-testid="table-login-submit">
          로그인
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const storeId = ref('');
const tableNumber = ref<number | null>(null);
const password = ref('');
const error = ref('');

onMounted(() => {
  // Check for saved credentials
  authStore.checkAuth();
  if (authStore.isTable) {
    router.push('/customer/menu');
    return;
  }

  // Load saved login info
  const saved = localStorage.getItem('table_login_info');
  if (saved) {
    const info = JSON.parse(saved);
    storeId.value = info.storeId;
    tableNumber.value = info.tableNumber;
  }
});

async function handleLogin() {
  error.value = '';
  if (!storeId.value || !tableNumber.value || !password.value) {
    error.value = '모든 필드를 입력해주세요';
    return;
  }

  try {
    await authStore.tableLogin(storeId.value, tableNumber.value, password.value);
    // Save login info for auto-login
    localStorage.setItem(
      'table_login_info',
      JSON.stringify({ storeId: storeId.value, tableNumber: tableNumber.value })
    );
    router.push('/customer/menu');
  } catch (err: any) {
    error.value = err.response?.data?.error || '로그인에 실패했습니다';
  }
}
</script>

<style scoped lang="scss">
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
}

.subtitle {
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.login-btn {
  width: 100%;
  margin-top: 8px;
}
</style>
