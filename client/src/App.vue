<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth';
import Navbar from './components/Navbar.vue';

const authStore = useAuthStore();

onMounted(() => {
  authStore.loadUser();
});
</script>

<template>
  <div class="min-h-screen">
    <Navbar />
    <main>
      <RouterView />
    </main>
  </div>
</template>
