<template>
  <button
    v-if="itemCount > 0"
    class="cart-float-btn"
    data-testid="cart-floating-button"
    @click="$emit('click')"
  >
    🛒 장바구니 ({{ itemCount }})
  </button>
</template>

<script setup lang="ts">
defineProps<{
  itemCount: number;
}>();

defineEmits<{
  click: [];
}>();
</script>

<style scoped lang="scss">
.cart-float-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: var(--primary-color);
  color: white;
  border-radius: 30px;
  padding: 14px 24px;
  font-size: 1rem;
  font-weight: 600;
  box-shadow: var(--shadow-lg);
  z-index: 100;
  min-height: 50px;
}
</style>
