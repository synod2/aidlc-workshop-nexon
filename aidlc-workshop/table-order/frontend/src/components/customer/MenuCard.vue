<template>
  <div :class="['menu-card', 'card', { 'sold-out': !item.isAvailable }]" :data-testid="`menu-card-${item.id}`">
    <div class="image-wrapper">
      <img
        v-if="item.imageUrl"
        :src="item.imageUrl"
        :alt="item.name"
        class="menu-image"
      />
      <div v-else class="menu-image-placeholder">🍽️</div>
      <div v-if="!item.isAvailable" class="sold-out-overlay">
        <span class="sold-out-text">매진</span>
      </div>
    </div>
    <div class="menu-info">
      <h3 class="menu-name">{{ item.name }}</h3>
      <p v-if="item.description" class="menu-desc">{{ item.description }}</p>
      <div class="menu-footer">
        <span class="menu-price">{{ formatPrice(item.price) }}원</span>
        <button
          v-if="item.isAvailable"
          class="btn-primary add-btn"
          :data-testid="`menu-add-${item.id}`"
          @click="$emit('add', item)"
        >
          담기
        </button>
        <span v-else class="sold-out-badge">매진</span>
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
  transition: opacity 0.3s;

  &.sold-out {
    opacity: 0.7;
  }
}

.image-wrapper {
  position: relative;
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

.sold-out-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.sold-out-text {
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  background: var(--danger-color);
  padding: 6px 16px;
  border-radius: 4px;
}

.sold-out-badge {
  background: #fee2e2;
  color: var(--danger-color);
  padding: 6px 12px;
  border-radius: var(--radius);
  font-size: 0.8rem;
  font-weight: 600;
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
