<template>
  <div class="login-page">
    <div class="login-card card">
      <h1 class="page-title">관리자 로그인</h1>

      <form @submit.prevent="handleLogin" data-testid="admin-login-form">
        <div class="form-group">
          <label for="storeId">매장 식별자</label>
          <input id="storeId" v-model="storeId" type="text" required data-testid="admin-login-store-id" />
        </div>
        <div class="form-group">
          <label for="username">사용자명</label>
          <input id="username" v-model="username" type="text" required data-testid="admin-login-username" />
        </div>
        <div class="form-group">
          <label for="password">비밀번호</label>
          <input id="password" v-model="password" type="password" required data-testid="admin-login-password" />
        </div>

        <p v-if="error" class="error-message">{{ error }}</p>

        <button type="submit" class="btn-primary login-btn" data-testid="admin-login-submit">로그인</button>
      </form>

      <p class="register-link">
        계정이 없으신가요? <router-link to="/admin/register">회원가입</router-link>
      </p>
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
const username = ref('');
const password = ref('');
const error = ref('');

onMounted(() => {
  authStore.checkAuth();
  if (authStore.isAdmin) {
    router.push('/admin/dashboard');
  }
});

async function handleLogin() {
  error.value = '';
  try {
    await authStore.login(storeId.value, username.value, password.value);
    router.push('/admin/dashboard');
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

.login-card { width: 100%; max-width: 400px; }
.login-btn { width: 100%; margin-top: 8px; }
.register-link { margin-top: 16px; text-align: center; font-size: 0.9rem; }
.register-link a { color: var(--primary-color); }
</style>
