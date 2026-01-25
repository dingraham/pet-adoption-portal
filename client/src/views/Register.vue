<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: ''
});

const error = ref('');
const loading = ref(false);

const handleSubmit = async () => {
  error.value = '';

  if (form.value.password !== form.value.confirmPassword) {
    error.value = 'Passwords do not match';
    return;
  }

  if (form.value.password.length < 6) {
    error.value = 'Password must be at least 6 characters';
    return;
  }

  loading.value = true;

  try {
    await authStore.register(form.value);
    router.push('/dashboard');
  } catch (err) {
    error.value = err.response?.data?.error || 'Registration failed. Please try again.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center px-4 py-12">
    <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
      <h2 class="text-3xl font-bold text-center mb-6">Create Account</h2>

      <div v-if="error" data-testid="register-error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {{ error }}
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4" data-testid="register-form">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              v-model="form.firstName"
              type="text"
              required
              data-testid="register-firstName"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              v-model="form.lastName"
              type="text"
              required
              data-testid="register-lastName"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            v-model="form.email"
            type="email"
            required
            data-testid="register-email"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            v-model="form.phone"
            type="tel"
            data-testid="register-phone"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            data-testid="register-password"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            v-model="form.confirmPassword"
            type="password"
            required
            data-testid="register-confirmPassword"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          data-testid="register-submit"
          class="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {{ loading ? 'Creating account...' : 'Register' }}
        </button>
      </form>

      <p class="text-center mt-4 text-gray-600">
        Already have an account?
        <RouterLink to="/login" class="text-indigo-600 hover:underline">
          Login here
        </RouterLink>
      </p>
    </div>
  </div>
</template>
