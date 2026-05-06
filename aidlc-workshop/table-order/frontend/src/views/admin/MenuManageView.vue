<template>
  <div class="menu-manage container">
    <header class="page-header">
      <h1 class="page-title">메뉴 관리</h1>
      <nav class="admin-nav">
        <router-link to="/admin/dashboard">대시보드</router-link>
        <router-link to="/admin/tables">테이블</router-link>
      </nav>
    </header>

    <div class="actions-bar">
      <button class="btn-primary" data-testid="menu-add-btn" @click="openForm()">+ 메뉴 추가</button>
      <button class="btn-secondary" data-testid="category-add-btn" @click="showCategoryForm = true">+ 카테고리 추가</button>
    </div>

    <div v-for="category in menuStore.categories" :key="category.id" class="category-section">
      <h2 class="category-title">{{ category.name }}</h2>
      <div class="menu-table">
        <div
          v-for="item in menuStore.getMenusByCategory(category.id)"
          :key="item.id"
          :class="['menu-row', 'card', { 'sold-out': !item.isAvailable }]"
        >
          <div class="menu-info">
            <strong>{{ item.name }}</strong>
            <span class="menu-price">{{ item.price.toLocaleString() }}원</span>
            <span v-if="!item.isAvailable" class="sold-out-badge">매진</span>
          </div>
          <div class="menu-actions">
            <button
              :class="item.isAvailable ? 'btn-warning' : 'btn-primary'"
              @click="toggleAvailability(item)"
            >{{ item.isAvailable ? '매진' : '판매재개' }}</button>
            <button class="btn-secondary" @click="openForm(item)">수정</button>
            <button class="btn-danger" @click="handleDelete(item.id)">삭제</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Menu Form Modal -->
    <div v-if="showForm" class="modal-overlay" @click.self="showForm = false">
      <div class="modal-content">
        <h2>{{ editingMenu ? '메뉴 수정' : '메뉴 추가' }}</h2>
        <form @submit.prevent="handleSubmit" data-testid="menu-form">
          <div class="form-group">
            <label>메뉴명</label>
            <input v-model="form.name" required data-testid="menu-form-name" />
          </div>
          <div class="form-group">
            <label>가격</label>
            <input v-model.number="form.price" type="number" min="0" required data-testid="menu-form-price" />
          </div>
          <div class="form-group">
            <label>설명</label>
            <input v-model="form.description" data-testid="menu-form-description" />
          </div>
          <div class="form-group">
            <label>이미지 URL</label>
            <input v-model="form.imageUrl" data-testid="menu-form-image" />
          </div>
          <div class="form-group">
            <label>카테고리</label>
            <select v-model.number="form.categoryId" required data-testid="menu-form-category">
              <option v-for="cat in menuStore.categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="showForm = false">취소</button>
            <button type="submit" class="btn-primary" data-testid="menu-form-submit">저장</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Category Form Modal -->
    <div v-if="showCategoryForm" class="modal-overlay" @click.self="showCategoryForm = false">
      <div class="modal-content">
        <h2>카테고리 추가</h2>
        <form @submit.prevent="handleCreateCategory" data-testid="category-form">
          <div class="form-group">
            <label>카테고리명</label>
            <input v-model="newCategoryName" required data-testid="category-form-name" />
          </div>
          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="showCategoryForm = false">취소</button>
            <button type="submit" class="btn-primary" data-testid="category-form-submit">추가</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useMenuStore, type MenuItem } from '../../stores/menu';

const menuStore = useMenuStore();

const showForm = ref(false);
const showCategoryForm = ref(false);
const editingMenu = ref<MenuItem | null>(null);
const newCategoryName = ref('');

const form = reactive({
  name: '',
  price: 0,
  description: '',
  imageUrl: '',
  categoryId: 0,
});

function openForm(item?: MenuItem) {
  if (item) {
    editingMenu.value = item;
    form.name = item.name;
    form.price = item.price;
    form.description = item.description || '';
    form.imageUrl = item.imageUrl || '';
    form.categoryId = item.categoryId;
  } else {
    editingMenu.value = null;
    form.name = '';
    form.price = 0;
    form.description = '';
    form.imageUrl = '';
    form.categoryId = menuStore.categories[0]?.id || 0;
  }
  showForm.value = true;
}

async function handleSubmit() {
  if (editingMenu.value) {
    await menuStore.updateMenu(editingMenu.value.id, { ...form });
  } else {
    await menuStore.createMenu({ ...form } as any);
  }
  showForm.value = false;
}

async function handleDelete(id: number) {
  if (confirm('이 메뉴를 삭제하시겠습니까?')) {
    await menuStore.deleteMenu(id);
  }
}

async function toggleAvailability(item: MenuItem) {
  const newValue = item.isAvailable ? 0 : 1;
  await menuStore.updateMenu(item.id, { isAvailable: newValue } as any);
}

async function handleCreateCategory() {
  if (newCategoryName.value) {
    await menuStore.createCategory(newCategoryName.value);
    newCategoryName.value = '';
    showCategoryForm.value = false;
  }
}

onMounted(async () => {
  await menuStore.fetchCategories();
  await menuStore.fetchMenus();
});
</script>

<style scoped lang="scss">
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.admin-nav {
  display: flex;
  gap: 16px;
  a { color: var(--primary-color); text-decoration: none; }
}

.actions-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.category-title {
  font-size: 1.1rem;
  margin: 20px 0 12px;
}

.menu-table {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.menu-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;

  &.sold-out {
    opacity: 0.5;
  }
}

.menu-info {
  display: flex;
  gap: 16px;
  align-items: center;
}

.menu-price {
  color: var(--text-secondary);
}

.sold-out-badge {
  background: #fee2e2;
  color: var(--danger-color);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.menu-actions {
  display: flex;
  gap: 8px;
  button { padding: 6px 12px; font-size: 0.85rem; }
}

.btn-warning {
  background-color: var(--warning-color);
  color: white;
  &:hover { background-color: #b45309; }
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
