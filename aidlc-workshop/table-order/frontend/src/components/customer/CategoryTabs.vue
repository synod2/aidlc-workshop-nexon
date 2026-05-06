<template>
  <div class="category-tabs" data-testid="category-tabs">
    <button
      v-for="category in categories"
      :key="category.id"
      :class="['tab-btn', { active: activeId === category.id }]"
      :data-testid="`category-tab-${category.id}`"
      @click="$emit('select', category.id)"
    >
      {{ category.name }}
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Category } from '../../stores/menu';

defineProps<{
  categories: Category[];
  activeId: number | null;
}>();

defineEmits<{
  select: [id: number];
}>();
</script>

<style scoped lang="scss">
.category-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 12px 0;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }
}

.tab-btn {
  white-space: nowrap;
  padding: 8px 16px;
  border-radius: 20px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  font-size: 0.875rem;
  min-height: 36px;

  &.active {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
  }
}
</style>
