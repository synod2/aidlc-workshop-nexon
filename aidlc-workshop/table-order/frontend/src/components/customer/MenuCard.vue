<template>
  <div class="menu-card card" :data-testid="`menu-card-${item.id}`">
    <img
      v-if="item.imageUrl"
      :src="item.imageUrl"
      :alt="item.name"
      class="menu-image"
    />
    <div v-else class="menu-image-placeholder">🍽️</div>
    <div class="menu-info">
      <h3 class="menu-name">{{ item.name }}</h3>
      <p v-if="item.description" class="menu-desc">{{ item.description }}</p>
      <div class="menu-footer">
        <span class="menu-price">{{ formatPrice(item.price) }}원</span>
        <button
          class="btn-primary add-btn"
          :data-testid="`menu-add-${item.id}`"
          @click="$emit('add', item)"
        >
          담기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MenuItem } from '../../stores/menu';

defineProps<{
  item: MenuItem;
}>();

defineEmits<{
  add: [item: MenuItem];
}>();

function formatPrice(price: number): string {
  return price.toLocaleString();
}
</script>

<style scoped lang="scss">
.menu-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0;
}

.menu-image {
  width: 100%;
  height: 140px;
  object-fit: cover;
}

.menu-image-placeholder {
  width: 100%;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  font-size: 2.5rem;
}

.menu-info {
  padding: 12px 16px 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.menu-name {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.menu-desc {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 12px;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.menu-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.menu-price {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--primary-color);
}

.add-btn {
  padding: 8px 16px;
  font-size: 0.875rem;
}
</style>
