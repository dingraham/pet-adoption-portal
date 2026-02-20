<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { favoritesAPI, applicationsAPI, appointmentsAPI, petsAPI } from '../services/api';

const router = useRouter();

const activeTab = ref('favorites');
const favorites = ref([]);
const favoritePets = ref([]);
const applications = ref([]);
const appointments = ref([]);
const loading = ref(true);

const fetchFavorites = async () => {
  try {
    const favResponse = await favoritesAPI.getAll();
    favorites.value = favResponse.data;

    // Fetch pet details for each favorite
    const petPromises = favorites.value.map((id) => petsAPI.getById(id));
    const pets = await Promise.all(petPromises);
    favoritePets.value = pets.map((p) => p.data);
  } catch (err) {
    console.error('Failed to load favorites');
  }
};

const fetchApplications = async () => {
  try {
    const response = await applicationsAPI.getMyApplications();
    applications.value = response.data;

    // Fetch pet details for each application
    for (const app of applications.value) {
      const petResponse = await petsAPI.getById(app.petId);
      app.pet = petResponse.data;
    }
  } catch (err) {
    console.error('Failed to load applications');
  }
};

const fetchAppointments = async () => {
  try {
    const response = await appointmentsAPI.getMyAppointments();
    appointments.value = response.data;

    // Fetch pet details for each appointment
    for (const apt of appointments.value) {
      const petResponse = await petsAPI.getById(apt.petId);
      apt.pet = petResponse.data;
    }
  } catch (err) {
    console.error('Failed to load appointments');
  }
};

const removeFavorite = async (petId) => {
  try {
    await favoritesAPI.remove(petId);
    favoritePets.value = favoritePets.value.filter((p) => p.id !== petId);
    favorites.value = favorites.value.filter((id) => id !== petId);
  } catch (err) {
    console.error('Failed to remove favorite');
  }
};

const cancelAppointment = async (appointmentId) => {
  if (!confirm('Are you sure you want to cancel this appointment?')) return;

  try {
    await appointmentsAPI.cancel(appointmentId);
    const apt = appointments.value.find((a) => a.id === appointmentId);
    if (apt) apt.status = 'cancelled';
  } catch (err) {
    console.error('Failed to cancel appointment');
  }
};

const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    under_review: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    scheduled: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

onMounted(async () => {
  await Promise.all([fetchFavorites(), fetchApplications(), fetchAppointments()]);
  loading.value = false;
});
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-4xl font-bold text-gray-900 mb-8">My Dashboard</h1>

    <!-- Tabs -->
    <div class="border-b border-gray-200 mb-6">
      <nav class="flex space-x-8">
        <button
          @click="activeTab = 'favorites'"
          :class="[
            'py-4 px-1 border-b-2 font-medium text-sm',
            activeTab === 'favorites'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
          ]"
        >
          Favorites ({{ favoritePets.length }})
        </button>
        <button
          @click="activeTab = 'applications'"
          :class="[
            'py-4 px-1 border-b-2 font-medium text-sm',
            activeTab === 'applications'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
          ]"
        >
          Applications ({{ applications.length }})
        </button>
        <button
          @click="activeTab = 'appointments'"
          :class="[
            'py-4 px-1 border-b-2 font-medium text-sm',
            activeTab === 'appointments'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
          ]"
        >
          Appointments ({{ appointments.length }})
        </button>
      </nav>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="text-xl text-gray-600">Loading...</div>
    </div>

    <!-- Favorites Tab -->
    <div v-else-if="activeTab === 'favorites'">
      <div v-if="favoritePets.length === 0" class="text-center py-12">
        <p class="text-xl text-gray-600 mb-4">You haven't favorited any pets yet.</p>
        <button @click="router.push('/pets')" class="text-indigo-600 hover:underline">
          Browse available pets
        </button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          v-for="pet in favoritePets"
          :key="pet.id"
          :data-testid="`favorite-pet-${pet.id}`"
          class="bg-white rounded-lg shadow-lg overflow-hidden"
        >
          <img
            :src="pet.images[0]"
            :alt="pet.name"
            class="w-full h-48 object-cover cursor-pointer"
            @click="router.push(`/pets/${pet.id}`)"
          />
          <div class="p-4">
            <h3 class="text-xl font-bold mb-2">{{ pet.name }}</h3>
            <p class="text-gray-600 mb-4">{{ pet.breed }} • {{ pet.age }} years</p>
            <div class="flex space-x-2">
              <button
                @click="router.push(`/pets/${pet.id}`)"
                class="flex-1 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700"
              >
                View
              </button>
              <button
                @click="removeFavorite(pet.id)"
                class="flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Applications Tab -->
    <div v-else-if="activeTab === 'applications'">
      <div v-if="applications.length === 0" class="text-center py-12">
        <p class="text-xl text-gray-600">You haven't submitted any applications yet.</p>
      </div>

      <div v-else class="space-y-4">
        <div v-for="app in applications" :key="app.id" class="bg-white rounded-lg shadow p-6">
          <div class="flex justify-between items-start mb-4">
            <div class="flex items-center space-x-4">
              <img
                v-if="app.pet"
                :src="app.pet.images[0]"
                :alt="app.pet.name"
                class="w-20 h-20 object-cover rounded"
              />
              <div>
                <h3 class="text-xl font-bold">{{ app.pet?.name }}</h3>
                <p class="text-gray-600">{{ app.pet?.breed }}</p>
                <p class="text-sm text-gray-500">
                  Submitted: {{ new Date(app.submittedAt).toLocaleDateString() }}
                </p>
              </div>
            </div>
            <span
              :class="[
                'px-3 py-1 rounded-full text-sm font-medium capitalize',
                getStatusColor(app.status),
              ]"
            >
              {{ app.status.replace('_', ' ') }}
            </span>
          </div>

          <div v-if="app.adminNotes" class="bg-gray-50 p-4 rounded">
            <p class="text-sm font-medium text-gray-700">Admin Notes:</p>
            <p class="text-sm text-gray-600">{{ app.adminNotes }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Appointments Tab -->
    <div v-else-if="activeTab === 'appointments'">
      <div v-if="appointments.length === 0" class="text-center py-12">
        <p class="text-xl text-gray-600">You don't have any appointments scheduled.</p>
      </div>

      <div v-else class="space-y-4">
        <div v-for="apt in appointments" :key="apt.id" class="bg-white rounded-lg shadow p-6">
          <div class="flex justify-between items-start">
            <div class="flex items-center space-x-4">
              <img
                v-if="apt.pet"
                :src="apt.pet.images[0]"
                :alt="apt.pet.name"
                class="w-20 h-20 object-cover rounded"
              />
              <div>
                <h3 class="text-xl font-bold">{{ apt.pet?.name }}</h3>
                <p class="text-gray-600">
                  📅 {{ new Date(apt.date).toLocaleDateString() }} at {{ apt.time }}
                </p>
                <p class="text-gray-600">📍 {{ apt.pet?.location }}</p>
                <p v-if="apt.notes" class="text-sm text-gray-500 mt-1">Note: {{ apt.notes }}</p>
              </div>
            </div>
            <div class="flex flex-col items-end space-y-2">
              <span
                :class="[
                  'px-3 py-1 rounded-full text-sm font-medium capitalize',
                  getStatusColor(apt.status),
                ]"
              >
                {{ apt.status }}
              </span>
              <button
                v-if="apt.status === 'scheduled'"
                @click="cancelAppointment(apt.id)"
                class="text-red-600 hover:underline text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
