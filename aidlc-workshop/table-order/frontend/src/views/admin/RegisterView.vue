<template>
  <div class="login-page">
    <div class="login-card card">
      <h1 class="page-title">관리자 회원가입</h1>

      <form @submit.prevent="handleRegister" data-testid="admin-register-form">
        <div class="form-group">
          <label for="storeId">매장 식별자</label>
          <input id="storeId" v-model="storeId" type="text" required data-testid="admin-register-store-id" />
        </div>
        <div class="form-group">
          <label for="username">사용자명</label>
          <input id="username" v-model="username" type="text" required data-testid="admin-register-username" />
        </div>
        <div class="form-group">
          <label for="password">비밀번호 (4자 이상)</label>
          <input id="password" v-model="password" type="password" required minlength="4" data-testid="admin-register-password" />
        </div>

        <p v-if="error" class="error-message">{{ error }}</p>

        <button type="submit" class="btn-primary login-btn" data-testid="admin-register-submit">회원가입</button>
      </form>

      <p class="register-link">
        이미 계정이 있으신가요? <router-link to="/admin/login">로그인</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const storeId = ref('');
const username = ref('');
const password = ref('');
const error = ref('');

async function handleRegister() {
  error.value = '';
  try {
    await authStore.register(storeId.value, username.value, password.value);
    router.push('/admin/dashboard');
  } catch (err: any) {
    if (err.response) {
      const data = err.response.data;
      error.value = data?.error || `서버 에러 (${err.response.status}): ${JSON.stringify(data)}`;
    } else if (err.request) {
      error.value = '서버에 연결할 수 없습니다. 백엔드가 실행 중인지 확인해주세요.';
    } else {
      error.value = err.message || '알 수 없는 에러가 발생했습니다';
    }
    console.error('Register error:', err);
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
