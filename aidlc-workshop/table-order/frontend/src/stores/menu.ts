import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../services/api';

export interface Category {
  id: number;
  storeId: string;
  name: string;
  sortOrder: number;
}

export interface MenuItem {
  id: number;
  categoryId: number;
  storeId: string;
  name: string;
  price: number;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isAvailable: number;
}

export const useMenuStore = defineStore('menu', () => {
  const categories = ref<Category[]>([]);
  const menuItems = ref<MenuItem[]>([]);
  const loading = ref(false);

  async function fetchMenus() {
    loading.value = true;
    try {
      const res = await api.get('/menus');
      menuItems.value = res.data.data;
    } finally {
      loading.value = false;
    }
  }

  async function fetchCategories() {
    const res = await api.get('/menus/categories');
    categories.value = res.data.data;
  }

  async function createMenu(data: Partial<MenuItem>) {
    const res = await api.post('/menus', data);
    menuItems.value.push(res.data.data);
    return res.data.data;
  }

  async function updateMenu(id: number, data: Partial<MenuItem>) {
    const res = await api.put(`/menus/${id}`, data);
    const index = menuItems.value.findIndex((m) => m.id === id);
    if (index !== -1) {
      menuItems.value[index] = res.data.data;
    }
    return res.data.data;
  }

  async function deleteMenu(id: number) {
    await api.delete(`/menus/${id}`);
    menuItems.value = menuItems.value.filter((m) => m.id !== id);
  }

  async function createCategory(name: string) {
    const res = await api.post('/menus/categories', { name });
    categories.value.push(res.data.data);
    return res.data.data;
  }

  function getMenusByCategory(categoryId: number): MenuItem[] {
    return menuItems.value.filter((m) => m.categoryId === categoryId);
  }

  return {
    categories,
    menuItems,
    loading,
    fetchMenus,
    fetchCategories,
    createMenu,
    updateMenu,
    deleteMenu,
    createCategory,
    getMenusByCategory,
  };
});
