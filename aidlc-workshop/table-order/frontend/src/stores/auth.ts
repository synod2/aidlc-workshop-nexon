import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../services/api';

interface UserInfo {
  id: number;
  storeId: string;
  role: 'admin' | 'table';
  username?: string;
  tableNumber?: number;
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null);
  const userInfo = ref<UserInfo | null>(null);

  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => userInfo.value?.role === 'admin');
  const isTable = computed(() => userInfo.value?.role === 'table');

  function setAdminAuth(adminToken: string, admin: any) {
    token.value = adminToken;
    userInfo.value = {
      id: admin.id,
      storeId: admin.storeId,
      role: 'admin',
      username: admin.username,
    };
    localStorage.setItem('admin_token', adminToken);
    localStorage.setItem('admin_info', JSON.stringify(userInfo.value));
  }

  function setTableAuth(tableToken: string, table: any) {
    token.value = tableToken;
    userInfo.value = {
      id: table.id,
      storeId: table.storeId,
      role: 'table',
      tableNumber: table.tableNumber,
    };
    localStorage.setItem('table_token', tableToken);
    localStorage.setItem('table_info', JSON.stringify(userInfo.value));
  }

  async function login(storeId: string, username: string, password: string) {
    const res = await api.post('/auth/login', { storeId, username, password });
    setAdminAuth(res.data.data.token, res.data.data.admin);
  }

  async function register(storeId: string, username: string, password: string) {
    const res = await api.post('/auth/register', { storeId, username, password });
    setAdminAuth(res.data.data.token, res.data.data.admin);
  }

  async function tableLogin(storeId: string, tableNumber: number, password: string) {
    const res = await api.post('/auth/tables/login', { storeId, tableNumber, password });
    setTableAuth(res.data.data.token, res.data.data.table);
  }

  function logout() {
    token.value = null;
    userInfo.value = null;
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_info');
    localStorage.removeItem('table_token');
    localStorage.removeItem('table_info');
  }

  function checkAuth() {
    const adminToken = localStorage.getItem('admin_token');
    const adminInfo = localStorage.getItem('admin_info');
    const tableToken = localStorage.getItem('table_token');
    const tableInfo = localStorage.getItem('table_info');

    // Choose based on current path
    const path = window.location.pathname;

    if (path.startsWith('/customer')) {
      // Customer pages: prefer table token
      if (tableToken && tableInfo) {
        token.value = tableToken;
        userInfo.value = JSON.parse(tableInfo);
      }
    } else if (path.startsWith('/admin')) {
      // Admin pages: prefer admin token
      if (adminToken && adminInfo) {
        token.value = adminToken;
        userInfo.value = JSON.parse(adminInfo);
      }
    } else {
      // Default: try admin first, then table
      if (adminToken && adminInfo) {
        token.value = adminToken;
        userInfo.value = JSON.parse(adminInfo);
      } else if (tableToken && tableInfo) {
        token.value = tableToken;
        userInfo.value = JSON.parse(tableInfo);
      }
    }
  }

  return {
    token,
    userInfo,
    isAuthenticated,
    isAdmin,
    isTable,
    login,
    register,
    tableLogin,
    logout,
    checkAuth,
  };
});
