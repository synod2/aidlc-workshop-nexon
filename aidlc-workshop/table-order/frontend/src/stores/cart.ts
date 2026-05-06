import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';

export interface CartItem {
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
}

const CART_STORAGE_KEY = 'table_order_cart';

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([]);

  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  const itemCount = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  );

  function addItem(menuItem: { id: number; name: string; price: number }) {
    const existing = items.value.find((item) => item.menuItemId === menuItem.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      items.value.push({
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1,
      });
    }
  }

  function removeItem(menuItemId: number) {
    items.value = items.value.filter((item) => item.menuItemId !== menuItemId);
  }

  function updateQuantity(menuItemId: number, quantity: number) {
    if (quantity <= 0) {
      removeItem(menuItemId);
      return;
    }
    const item = items.value.find((item) => item.menuItemId === menuItemId);
    if (item) {
      item.quantity = quantity;
    }
  }

  function clearCart() {
    items.value = [];
  }

  function loadFromStorage() {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      try {
        items.value = JSON.parse(stored);
      } catch {
        items.value = [];
      }
    }
  }

  // Auto-persist to localStorage
  watch(items, (newItems) => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newItems));
  }, { deep: true });

  // Load on init
  loadFromStorage();

  return {
    items,
    totalPrice,
    itemCount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    loadFromStorage,
  };
});
