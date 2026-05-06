import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../services/api';

export interface TableInfo {
  id: number;
  storeId: string;
  tableNumber: number;
  createdAt: string;
}

export interface SessionHistory {
  session: {
    id: string;
    tableId: number;
    storeId: string;
    startedAt: string;
    completedAt: string;
  };
  orders: any[];
}

export const useTableStore = defineStore('table', () => {
  const tables = ref<TableInfo[]>([]);
  const loading = ref(false);

  async function fetchTables() {
    loading.value = true;
    try {
      const res = await api.get('/tables');
      tables.value = res.data.data;
    } finally {
      loading.value = false;
    }
  }

  async function createTable(tableNumber: number, password: string) {
    const res = await api.post('/tables', { tableNumber, password });
    tables.value.push(res.data.data);
    return res.data.data;
  }

  async function completeSession(tableId: number) {
    const res = await api.post(`/tables/${tableId}/complete`);
    return res.data.data;
  }

  async function fetchHistory(tableId: number, startDate?: string, endDate?: string) {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const res = await api.get(`/tables/${tableId}/history`, { params });
    return res.data.data as SessionHistory[];
  }

  return {
    tables,
    loading,
    fetchTables,
    createTable,
    completeSession,
    fetchHistory,
  };
});
