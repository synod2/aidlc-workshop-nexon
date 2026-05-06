<template>
  <div class="confirm-page container">
    <h1 class="page-title">주문 확인</h1>

    <div class="order-items card">
      <div v-for="item in cartStore.items" :key="item.menuItemId" class="confirm-item">
        <span class="item-name">{{ item.name }}</span>
        <span class="item-qty">x{{ item.quantity }}</span>
        <span class="item-total">{{ formatPrice(item.price * item.quantity) }}원</span>
      </div>
      <hr />
      <div class="confirm-total">
        <span>총 주문 금액</span>
        <span class="total-amount">{{ formatPrice(cartStore.totalPrice) }}원</span>
      </div>
    </div>

    <p v-if="error" class="error-message">{{ error }}</p>

    <div class="confirm-actions">
      <router-link to="/customer/cart" class="btn-secondary">뒤로</router-link>
      <button
        class="btn-primary"
        :disabled="submitting"
        data-testid="order-confirm-submit"
        @click="submitOrder"
      >
        {{ submitting ? '주문 중...' : '주문 확정' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '../../stores/cart';
import { useOrderStore } from '../../stores/order';

const router = useRouter();
const cartStore = useCartStore();
const orderStore = useOrderStore();

const submitting = ref(false);
const error = ref('');

function formatPrice(price: number): string {
  return price.toLocaleString();
}

async function submitOrder() {
  submitting.value = true;
  error.value = '';

  try {
    const items = cartStore.items.map((item) => ({
      menuItemId: item.menuItemId,
      quantity: item.quantity,
    }));
    const order = await orderStore.createOrder(items);
    cartStore.clearCart();
    router.push(`/customer/order/success/${order.id}`);
  } catch (err: any) {
    error.value = err.response?.data?.error || '주문에 실패했습니다';
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped lang="scss">
.confirm-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.item-name { flex: 1; font-weight: 500; }
.item-qty { margin: 0 16px; color: var(--text-secondary); }
.item-total { font-weight: 600; }

hr {
  border: none;
  border-top: 1px solid var(--border-color);
  margin: 12px 0;
}

.confirm-total {
  display: flex;
  justify-content: space-between;
  font-size: 1.1rem;
  font-weight: 700;
}

.total-amount {
  color: var(--primary-color);
}

.confirm-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;

  .btn-primary { flex: 1; }
  .btn-secondary { text-decoration: none; text-align: center; }
}
</style>
