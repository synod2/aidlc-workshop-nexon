import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Customer routes
    {
      path: '/customer/login',
      name: 'customer-login',
      component: () => import('../views/customer/TableLoginView.vue'),
    },
    {
      path: '/customer/menu',
      name: 'customer-menu',
      component: () => import('../views/customer/MenuView.vue'),
    },
    {
      path: '/customer/cart',
      name: 'customer-cart',
      component: () => import('../views/customer/CartView.vue'),
    },
    {
      path: '/customer/order/confirm',
      name: 'customer-order-confirm',
      component: () => import('../views/customer/OrderConfirmView.vue'),
    },
    {
      path: '/customer/order/success/:id',
      name: 'customer-order-success',
      component: () => import('../views/customer/OrderSuccessView.vue'),
    },
    {
      path: '/customer/orders',
      name: 'customer-orders',
      component: () => import('../views/customer/OrderHistoryView.vue'),
    },
    // Admin routes
    {
      path: '/admin/login',
      name: 'admin-login',
      component: () => import('../views/admin/LoginView.vue'),
    },
    {
      path: '/admin/register',
      name: 'admin-register',
      component: () => import('../views/admin/RegisterView.vue'),
    },
    {
      path: '/admin/dashboard',
      name: 'admin-dashboard',
      component: () => import('../views/admin/DashboardView.vue'),
    },
    {
      path: '/admin/menus',
      name: 'admin-menus',
      component: () => import('../views/admin/MenuManageView.vue'),
    },
    {
      path: '/admin/tables',
      name: 'admin-tables',
      component: () => import('../views/admin/TableManageView.vue'),
    },
    // Default redirect
    {
      path: '/',
      redirect: '/customer/login',
    },
  ],
});

export default router;
