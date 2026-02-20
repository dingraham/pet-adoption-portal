<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { petsAPI, favoritesAPI, appointmentsAPI } from '../services/api';
import { useAuthStore } from '../stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const pet = ref(null);
const loading = ref(true);
const currentImageIndex = ref(0);
const isFavorite = ref(false);
const showScheduleModal = ref(false);
const error = ref('');
const success = ref('');

const appointmentForm = ref({
  date: '',
  time: '',
  notes: '',
});

const availableSlots = ref([]);

const fetchPet = async () => {
  try {
    const response = await petsAPI.getById(route.params.id);
    pet.value = response.data;

    if (authStore.isAuthenticated) {
      const favResponse = await favoritesAPI.getAll();
      isFavorite.value = favResponse.data.includes(pet.value.id);
    }
  } catch (err) {
    console.error('Failed to load pet');
  } finally {
    loading.value = false;
  }
};

const toggleFavorite = async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }

  try {
    if (isFavorite.value) {
      await favoritesAPI.remove(pet.value.id);
      isFavorite.value = false;
    } else {
      await favoritesAPI.add(pet.value.id);
      isFavorite.value = true;
    }
  } catch (err) {
    console.error('Failed to toggle favorite');
  }
};

const fetchAvailableSlots = async () => {
  if (!appointmentForm.value.date) return;

  try {
    const response = await appointmentsAPI.getAvailableSlots(appointmentForm.value.date);
    availableSlots.value = response.data.availableSlots;
  } catch (err) {
    console.error('Failed to load available slots');
  }
};

const scheduleAppointment = async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }

  error.value = '';
  success.value = '';

  try {
    await appointmentsAPI.schedule({
      petId: pet.value.id,
      ...appointmentForm.value,
    });
    showScheduleModal.value = false;
    success.value = 'Appointment scheduled successfully!';
    setTimeout(() => {
      success.value = '';
    }, 3000);
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to schedule appointment';
  }
};

const startApplication = () => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }
  router.push(`/apply/${pet.value.id}`);
};

onMounted(fetchPet);
</script>

<template>
  <div v-if="loading" class="text-center py-12">
    <div class="text-xl text-gray-600">Loading...</div>
  </div>

  <div v-else-if="pet" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Error/Success Messages -->
    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {{ error }}
    </div>
    <div
      v-if="success"
      class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4"
    >
      {{ success }}
    </div>

    <div class="grid md:grid-cols-2 gap-8">
      <!-- Image Gallery -->
      <div>
        <div class="relative">
          <img
            :src="pet.images[currentImageIndex]"
            :alt="pet.name"
            class="w-full h-96 object-cover rounded-lg shadow-lg"
          />
          <button
            @click="toggleFavorite"
            class="absolute top-4 right-4 bg-white rounded-full p-3 shadow-md hover:bg-gray-100 transition"
          >
            <span class="text-3xl">{{ isFavorite ? '❤️' : '🤍' }}</span>
          </button>
        </div>

        <!-- Thumbnail Gallery -->
        <div class="flex space-x-2 mt-4 overflow-x-auto">
          <img
            v-for="(image, index) in pet.images"
            :key="index"
            :src="image"
            @click="currentImageIndex = index"
            :class="[
              'w-20 h-20 object-cover rounded cursor-pointer',
              currentImageIndex === index ? 'ring-4 ring-indigo-600' : '',
            ]"
          />
        </div>
      </div>

      <!-- Pet Info -->
      <div>
        <h1 class="text-4xl font-bold text-gray-900 mb-4">{{ pet.name }}</h1>

        <div class="bg-gray-100 rounded-lg p-4 mb-6">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-600">Species</p>
              <p class="font-semibold capitalize">{{ pet.species }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Breed</p>
              <p class="font-semibold">{{ pet.breed }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Age</p>
              <p class="font-semibold">{{ pet.age }} years</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Gender</p>
              <p class="font-semibold capitalize">{{ pet.gender }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Size</p>
              <p class="font-semibold capitalize">{{ pet.size }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Weight</p>
              <p class="font-semibold">{{ pet.weight }} lbs</p>
            </div>
          </div>
        </div>

        <div class="mb-6">
          <h2 class="text-xl font-bold mb-2">About {{ pet.name }}</h2>
          <p class="text-gray-700">{{ pet.description }}</p>
        </div>

        <div class="mb-6">
          <h3 class="font-bold mb-2">Personality</h3>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="trait in pet.personality"
              :key="trait"
              class="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full"
            >
              {{ trait }}
            </span>
          </div>
        </div>

        <div v-if="pet.goodWith && pet.goodWith.length > 0" class="mb-6">
          <h3 class="font-bold mb-2">Good With</h3>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="item in pet.goodWith"
              :key="item"
              class="bg-green-100 text-green-800 px-3 py-1 rounded-full capitalize"
            >
              {{ item }}
            </span>
          </div>
        </div>

        <div class="mb-6">
          <h3 class="font-bold mb-2">Medical History</h3>
          <p class="text-gray-700">{{ pet.medicalHistory }}</p>
        </div>

        <div class="mb-6">
          <h3 class="font-bold mb-2">Location</h3>
          <p class="text-gray-700">{{ pet.location }}</p>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-3">
          <button
            @click="startApplication"
            data-testid="start-application-button"
            class="w-full bg-indigo-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition"
          >
            Start Adoption Application
          </button>
          <button
            @click="showScheduleModal = true"
            data-testid="schedule-appointment-button"
            class="w-full bg-green-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition"
          >
            Schedule Meet & Greet
          </button>
        </div>
      </div>
    </div>

    <!-- Schedule Modal -->
    <div
      v-if="showScheduleModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showScheduleModal = false"
    >
      <div class="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 class="text-2xl font-bold mb-4">Schedule Meet & Greet</h2>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              v-model="appointmentForm.date"
              @change="fetchAvailableSlots"
              type="date"
              :min="new Date().toISOString().split('T')[0]"
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div v-if="availableSlots.length > 0">
            <label class="block text-sm font-medium text-gray-700 mb-1">Time</label>
            <select
              v-model="appointmentForm.time"
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Select a time</option>
              <option v-for="slot in availableSlots" :key="slot" :value="slot">
                {{ slot }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea
              v-model="appointmentForm.notes"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Any questions or special requests?"
            ></textarea>
          </div>

          <div class="flex space-x-3">
            <button
              @click="scheduleAppointment"
              :disabled="!appointmentForm.date || !appointmentForm.time"
              class="flex-1 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              Confirm
            </button>
            <button
              @click="showScheduleModal = false"
              class="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
