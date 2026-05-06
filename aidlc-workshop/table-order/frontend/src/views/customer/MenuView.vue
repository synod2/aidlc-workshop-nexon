<template>
  <div class="menu-page container">
    <header class="menu-header">
      <h1 class="page-title">메뉴</h1>
      <nav class="nav-links">
        <router-link to="/customer/orders" data-testid="nav-orders">주문내역</router-link>
      </nav>
    </header>

    <CategoryTabs
      :categories="menuStore.categories"
      :active-id="activeCategory"
      @select="scrollToCategory"
    />

    <div v-if="menuStore.loading" class="empty-state">메뉴를 불러오는 중...</div>

    <div v-else class="menu-sections">
      <section
        v-for="category in menuStore.categories"
        :key="category.id"
        :ref="(el) => setCategoryRef(category.id, el)"
        class="category-section"
      >
        <h2 class="category-title">{{ category.name }}</h2>
        <div class="menu-grid">
          <MenuCard
            v-for="item in menuStore.getMenusByCategory(category.id)"
            :key="item.id"
            :item="item"
            @add="addToCart"
          />
        </div>
      </section>
    </div>

    <CartFloatingButton
      :item-count="cartStore.itemCount"
      @click="router.push('/customer/cart')"
    />

    <!-- Service Request Buttons -->
    <div class="service-request-bar">
      <button class="service-btn" @click="sendRequest('call_staff')" data-testid="call-staff-btn">
        🙋 직원호출
      </button>
      <button class="service-btn" @click="sendRequest('wet_tissue')" data-testid="request-tissue-btn">
        🧻 물티슈
      </button>
      <button class="service-btn" @click="sendRequest('water')" data-testid="request-water-btn">
        💧 물
      </button>
      <button class="service-btn" @click="sendRequest('utensils')" data-testid="request-utensils-btn">
        🍴 수저/포크
      </button>
    </div>

    <div v-if="toast" class="toast">{{ toast }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useMenuStore, type MenuItem } from '../../stores/menu';
import { useCartStore } from '../../stores/cart';
import api from '../../services/api';
import CategoryTabs from '../../components/customer/CategoryTabs.vue';
import MenuCard from '../../components/customer/MenuCard.vue';
import CartFloatingButton from '../../components/customer/CartFloatingButton.vue';

const router = useRouter();
const menuStore = useMenuStore();
const cartStore = useCartStore();

const activeCategory = ref<number | null>(null);
const toast = ref('');
const categoryRefs = new Map<number, Element>();

function setCategoryRef(id: number, el: any) {
  if (el) categoryRefs.set(id, el as Element);
}

function scrollToCategory(id: number) {
  activeCategory.value = id;
  const el = categoryRefs.get(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function addToCart(item: MenuItem) {
  cartStore.addItem({ id: item.id, name: item.name, price: item.price });
  toast.value = `${item.name} 추가됨`;
  setTimeout(() => { toast.value = ''; }, 2000);
}

async function sendRequest(requestType: string) {
  try {
    await api.post('/tables/request', { requestType });
    const labels: Record<string, string> = {
      call_staff: '직원 호출',
      wet_tissue: '물티슈 요청',
      water: '물 요청',
      utensils: '수저/포크 요청',
    };
    toast.value = `✅ ${labels[requestType] || requestType} 완료`;
    setTimeout(() => { toast.value = ''; }, 3000);
  } catch {
    toast.value = '요청에 실패했습니다';
    setTimeout(() => { toast.value = ''; }, 3000);
  }
}

onMounted(async () => {
  await Promise.all([menuStore.fetchCategories(), menuStore.fetchMenus()]);
  if (menuStore.categories.length > 0) {
    activeCategory.value = menuStore.categories[0].id;
  }
});
</script>

<style scoped lang="scss">
.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-links a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
}

.category-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 20px 0 12px;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.service-request-bar {
  display: flex;
  gap: 8px;
  padding: 12px 0;
  margin-top: 20px;
  border-top: 1px solid var(--border-color);
  overflow-x: auto;
  padding-bottom: 80px; /* space for floating cart button */
}

.service-btn {
  white-space: nowrap;
  padding: 10px 16px;
  border-radius: var(--radius);
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  font-size: 0.875rem;
  min-height: 44px;
  transition: background-color 0.2s;

  &:hover {
    background: #f1f5f9;
  }

  &:active {
    background: #e2e8f0;
  }
}
</style>
