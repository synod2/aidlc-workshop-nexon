import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface AppNotification {
  id: number;
  icon: string;
  message: string;
  timestamp: Date;
}

let nextId = 1;

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<AppNotification[]>([]);
  const showModal = ref(false);

  const unreadCount = computed(() => notifications.value.length);

  function add(icon: string, message: string) {
    notifications.value.unshift({
      id: nextId++,
      icon,
      message,
      timestamp: new Date(),
    });
  }

  function dismiss(id: number) {
    notifications.value = notifications.value.filter((n) => n.id !== id);
  }

  function dismissAll() {
    notifications.value = [];
  }

  return {
    notifications,
    showModal,
    unreadCount,
    add,
    dismiss,
    dismissAll,
  };
});
