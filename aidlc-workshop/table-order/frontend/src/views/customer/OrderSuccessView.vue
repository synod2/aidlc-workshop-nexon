<template>
  <div class="success-page container">
    <div class="success-card card">
      <div class="success-icon">✅</div>
      <h1>주문 완료!</h1>
      <p class="order-number">주문번호: #{{ orderId }}</p>
      <p class="redirect-msg">{{ countdown }}초 후 메뉴 화면으로 이동합니다</p>
      <router-link to="/customer/menu" class="btn-primary" data-testid="order-success-back">
        메뉴로 돌아가기
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const orderId = route.params.id;
const countdown = ref(5);
let timer: ReturnType<typeof setInterval>;

onMounted(() => {
  timer = setInterval(() => {
    countdown.value -= 1;
    if (countdown.value <= 0) {
      clearInterval(timer);
      router.push('/customer/menu');
    }
  }, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style scoped lang="scss">
.success-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
}

.success-card {
  text-align: center;
  max-width: 400px;
  width: 100%;
}

.success-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.order-number {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 12px 0;
  color: var(--primary-color);
}

.redirect-msg {
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.btn-primary {
  display: inline-block;
  text-decoration: none;
}
</style>
