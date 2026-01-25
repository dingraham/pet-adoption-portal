import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authAPI } from '../services/api';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const token = ref(localStorage.getItem('token') || null);

  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === 'admin');

  async function login(credentials) {
    const response = await authAPI.login(credentials);
    user.value = response.data.user;
    token.value = response.data.token;
    localStorage.setItem('token', response.data.token);
  }

  async function register(userData) {
    const response = await authAPI.register(userData);
    user.value = response.data.user;
    token.value = response.data.token;
    localStorage.setItem('token', response.data.token);
  }

  async function loadUser() {
    if (!token.value) return;

    try {
      const response = await authAPI.getCurrentUser();
      user.value = response.data;
    } catch (error) {
      logout();
    }
  }

  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem('token');
  }

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    login,
    register,
    loadUser,
    logout
  };
});
