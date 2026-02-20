<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  authStore.logout();
  router.push('/');
};
</script>

<template>
  <nav data-testid="navbar" class="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <!-- Logo and Brand -->
        <div class="flex items-center space-x-8">
          <RouterLink to="/" data-testid="logo-link" class="flex items-center space-x-3 group">
            <div
              class="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center shadow-soft group-hover:bg-primary-600 transition-colors"
            >
              <span class="text-2xl">🐾</span>
            </div>
            <div class="flex flex-col">
              <span data-testid="brand-name" class="font-display font-bold text-xl text-gray-900">
                PawMatch
              </span>
            </div>
          </RouterLink>

          <!-- Main Navigation -->
          <div class="hidden md:flex space-x-1">
            <RouterLink
              to="/pets"
              data-testid="nav-browse-pets"
              class="px-4 py-2 rounded-lg font-semibold text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-colors"
            >
              Browse Pets
            </RouterLink>
            <RouterLink
              to="/quiz"
              data-testid="nav-pet-matcher"
              class="px-4 py-2 rounded-lg font-semibold text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-colors"
            >
              Pet Matcher
            </RouterLink>
          </div>
        </div>

        <!-- User Actions -->
        <div class="flex items-center space-x-3">
          <template v-if="authStore.isAuthenticated">
            <RouterLink
              to="/dashboard"
              data-testid="nav-dashboard"
              class="px-4 py-2 rounded-lg font-semibold text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-colors"
            >
              Dashboard
            </RouterLink>
            <RouterLink
              v-if="authStore.isAdmin"
              to="/admin"
              data-testid="nav-admin"
              class="px-4 py-2 rounded-lg font-semibold text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-colors"
            >
              Admin
            </RouterLink>
            <button
              @click="handleLogout"
              data-testid="logout-button"
              class="px-4 py-2 rounded-lg font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              Logout
            </button>
          </template>
          <template v-else>
            <RouterLink
              to="/login"
              data-testid="nav-login"
              class="px-4 py-2 rounded-lg font-semibold text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-colors"
            >
              Login
            </RouterLink>
            <RouterLink
              to="/register"
              data-testid="nav-register"
              class="px-6 py-2.5 rounded-lg font-bold text-white bg-primary-500 hover:bg-primary-600 transition-colors shadow-soft"
            >
              Get Started
            </RouterLink>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>
