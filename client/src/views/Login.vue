<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const form = ref({
  email: '',
  password: ''
});

const error = ref('');
const loading = ref(false);

const handleSubmit = async () => {
  error.value = '';
  loading.value = true;

  try {
    await authStore.login(form.value);
    const redirect = route.query.redirect || '/dashboard';
    router.push(redirect);
  } catch (err) {
    error.value = err.response?.data?.error || 'Login failed. Please try again.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center px-4">
    <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
      <h2 class="text-3xl font-bold text-center mb-6">Login</h2>

      <div v-if="error" data-testid="login-error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {{ error }}
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4" data-testid="login-form">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            v-model="form.email"
            type="email"
            required
            data-testid="login-email"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            v-model="form.password"
            type="password"
            required
            data-testid="login-password"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          data-testid="login-submit"
          class="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>

      <p class="text-center mt-4 text-gray-600">
        Don't have an account?
        <RouterLink to="/register" class="text-indigo-600 hover:underline">
          Register here
        </RouterLink>
      </p>

      <div class="mt-6 p-4 bg-gray-100 rounded">
        <p class="text-sm text-gray-600 font-semibold mb-2">Demo Credentials:</p>
        <p class="text-xs text-gray-600 mb-1">Admin: admin@petadoption.com / admin123</p>
        <p class="text-xs text-gray-600">User: user@petadoption.com / user123</p>
      </div>
    </div>
  </div>
</template>
