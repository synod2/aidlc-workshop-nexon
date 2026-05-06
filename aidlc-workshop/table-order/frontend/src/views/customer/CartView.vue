<template>
  <div class="cart-page container">
    <h1 class="page-title">장바구니</h1>

    <div v-if="cartStore.items.length === 0" class="empty-state">
      <p>장바구니가 비어있습니다</p>
      <router-link to="/customer/menu" class="btn-primary" style="display:inline-block;margin-top:16px;text-decoration:none;">
        메뉴 보기
      </router-link>
    </div>

    <div v-else>
      <div class="cart-items">
        <div
          v-for="item in cartStore.items"
          :key="item.menuItemId"
          class="cart-item card"
          :data-testid="`cart-item-${item.menuItemId}`"
        >
          <div class="item-info">
            <span class="item-name">{{ item.name }}</span>
            <span class="item-price">{{ formatPrice(item.price) }}원</span>
          </div>
          <div class="item-controls">
            <button
              class="qty-btn"
              :data-testid="`cart-decrease-${item.menuItemId}`"
              @click="cartStore.updateQuantity(item.menuItemId, item.quantity - 1)"
            >−</button>
            <span class="qty-value">{{ item.quantity }}</span>
            <button
              class="qty-btn"
              :data-testid="`cart-increase-${item.menuItemId}`"
              @click="cartStore.updateQuantity(item.menuItemId, item.quantity + 1)"
            >+</button>
            <button
              class="remove-btn"
              :data-testid="`cart-remove-${item.menuItemId}`"
              @click="cartStore.removeItem(item.menuItemId)"
            >✕</button>
          </div>
          <div class="item-subtotal">
            {{ formatPrice(item.price * item.quantity) }}원
          </div>
        </div>
      </div>

      <div class="cart-summary card">
        <div class="summary-row">
          <span>총 금액</span>
          <span class="total-price">{{ formatPrice(cartStore.totalPrice) }}원</span>
        </div>
        <div class="summary-actions">
          <button class="btn-secondary" data-testid="cart-clear" @click="cartStore.clearCart()">
            비우기
          </button>
          <router-link to="/customer/order/confirm" class="btn-primary order-btn" data-testid="cart-order-btn">
            주문하기
          </router-link>
        </div>
      </div>
    </div>

    <router-link to="/customer/menu" class="back-link">← 메뉴로 돌아가기</router-link>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '../../stores/cart';

const cartStore = useCartStore();

function formatPrice(price: number): string {
  return price.toLocaleString();
}
</script>

<style scoped lang="scss">
.cart-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.cart-item {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.item-info {
  flex: 1;
  min-width: 120px;
}

.item-name {
  font-weight: 600;
  display: block;
}

.item-price {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.item-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qty-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  min-width: 36px;
  min-height: 36px;
}

.qty-value {
  font-weight: 600;
  min-width: 24px;
  text-align: center;
}

.remove-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #fee2e2;
  color: var(--danger-color);
  font-size: 1rem;
  padding: 0;
  min-width: 36px;
  min-height: 36px;
  margin-left: 8px;
}

.item-subtotal {
  font-weight: 700;
  min-width: 80px;
  text-align: right;
}

.cart-summary {
  margin-top: 20px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-size: 1.1rem;
}

.total-price {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--primary-color);
}

.summary-actions {
  display: flex;
  gap: 12px;
  align-items: stretch;
}

.order-btn {
  flex: 1;
  text-align: center;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-link {
  display: block;
  margin-top: 20px;
  color: var(--text-secondary);
  text-decoration: none;
}
</style>
