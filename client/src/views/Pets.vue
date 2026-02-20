<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { petsAPI, favoritesAPI } from '../services/api';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const pets = ref([]);
const favorites = ref([]);
const loading = ref(true);
const error = ref('');
const showFilters = ref(false);

const filters = ref({
  species: '',
  age: '',
  size: '',
  gender: '',
  search: '',
  sortBy: 'dateAdded',
  sortOrder: 'desc',
});

const currentPage = ref(1);
const totalPages = ref(1);
const totalCount = ref(0);

const fetchPets = async () => {
  loading.value = true;
  try {
    const response = await petsAPI.getAll({
      ...filters.value,
      page: currentPage.value,
    });
    pets.value = response.data.pets;
    totalPages.value = response.data.totalPages;
    totalCount.value = response.data.totalCount;
  } catch (err) {
    error.value = 'Failed to load pets';
  } finally {
    loading.value = false;
  }
};

const fetchFavorites = async () => {
  if (!authStore.isAuthenticated) return;
  try {
    const response = await favoritesAPI.getAll();
    favorites.value = response.data;
  } catch (err) {
    console.error('Failed to load favorites');
  }
};

const isFavorite = (petId) => favorites.value.includes(petId);

const toggleFavorite = async (petId) => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }

  try {
    if (isFavorite(petId)) {
      await favoritesAPI.remove(petId);
      favorites.value = favorites.value.filter((id) => id !== petId);
    } else {
      await favoritesAPI.add(petId);
      favorites.value.push(petId);
    }
  } catch (err) {
    console.error('Failed to toggle favorite');
  }
};

const applyFilters = () => {
  currentPage.value = 1;
  fetchPets();
};

const resetFilters = () => {
  filters.value = {
    species: '',
    age: '',
    size: '',
    gender: '',
    search: '',
    sortBy: 'dateAdded',
    sortOrder: 'desc',
  };
  fetchPets();
};

onMounted(() => {
  fetchPets();
  fetchFavorites();
});
</script>

<template>
  <div data-testid="pets-page" class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div data-testid="page-header" class="text-center mb-12">
        <h1
          data-testid="page-title"
          class="text-5xl md:text-6xl font-display font-bold text-gray-900 mb-4"
        >
          Adopt a Pet
        </h1>
        <p data-testid="page-subtitle" class="text-xl text-gray-600 max-w-2xl mx-auto">
          Find your perfect companion from our available pets
        </p>
      </div>

      <!-- Search and Filter Bar -->
      <div data-testid="search-filter-bar" class="bg-white rounded-xl shadow-soft p-6 mb-8">
        <div class="flex flex-col lg:flex-row gap-4 mb-4">
          <!-- Search -->
          <div class="flex-1">
            <input
              v-model="filters.search"
              @input="applyFilters"
              data-testid="search-input"
              type="text"
              placeholder="Search by name, breed, or description..."
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
            />
          </div>

          <!-- Quick Filters -->
          <div class="flex flex-wrap gap-3">
            <select
              v-model="filters.species"
              @change="applyFilters"
              data-testid="filter-species"
              class="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-base font-medium"
            >
              <option value="">All Species</option>
              <option value="dog">Dogs</option>
              <option value="cat">Cats</option>
              <option value="rabbit">Rabbits</option>
            </select>

            <select
              v-model="filters.size"
              @change="applyFilters"
              data-testid="filter-size"
              class="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-base font-medium"
            >
              <option value="">All Sizes</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>

            <button
              @click="showFilters = !showFilters"
              data-testid="toggle-filters-button"
              class="px-5 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold text-gray-700 transition text-base"
            >
              {{ showFilters ? 'Hide Filters' : 'More Filters' }}
            </button>
          </div>
        </div>

        <!-- Expanded Filters -->
        <div
          v-if="showFilters"
          data-testid="expanded-filters"
          class="pt-6 border-t border-gray-200"
        >
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Age</label>
              <select
                v-model="filters.age"
                @change="applyFilters"
                data-testid="filter-age"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="">All Ages</option>
                <option value="puppy">Puppy/Kitten</option>
                <option value="young">Young</option>
                <option value="adult">Adult</option>
                <option value="senior">Senior</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Gender</label>
              <select
                v-model="filters.gender"
                @change="applyFilters"
                data-testid="filter-gender"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="">All</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Sort By</label>
              <select
                v-model="filters.sortBy"
                @change="applyFilters"
                data-testid="filter-sort"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="dateAdded">Newest First</option>
                <option value="name">Name (A-Z)</option>
                <option value="age">Age</option>
              </select>
            </div>

            <div class="flex items-end">
              <button
                @click="resetFilters"
                data-testid="reset-filters-button"
                class="w-full px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-bold transition"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Results Count -->
      <div data-testid="results-count" class="mb-6">
        <p class="text-gray-700 text-lg font-medium">
          <span data-testid="pet-count" class="font-bold text-gray-900">{{ totalCount }}</span> pets
          available for adoption
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="grid md:grid-cols-2 gap-6">
        <div v-for="n in 6" :key="n" class="bg-white rounded-xl p-6 shadow-soft animate-pulse">
          <div class="flex gap-5">
            <div class="w-48 h-48 bg-gray-200 rounded-xl flex-shrink-0"></div>
            <div class="flex-1 space-y-4">
              <div class="h-7 bg-gray-200 rounded w-3/4"></div>
              <div class="h-5 bg-gray-200 rounded w-1/2"></div>
              <div class="h-4 bg-gray-200 rounded"></div>
              <div class="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-20 bg-white rounded-xl shadow-soft">
        <div class="text-xl text-red-600 font-semibold">{{ error }}</div>
      </div>

      <!-- Pets Grid (2 columns) -->
      <div v-else-if="pets.length > 0" data-testid="pets-grid" class="grid md:grid-cols-2 gap-6">
        <div
          v-for="pet in pets"
          :key="pet.id"
          :data-testid="`pet-card-${pet.id}`"
          class="group bg-white rounded-xl shadow-soft hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100"
          @click="router.push(`/pets/${pet.id}`)"
        >
          <div class="p-6">
            <div class="flex gap-5">
              <!-- Pet Image - Square with rounded corners -->
              <div class="relative flex-shrink-0">
                <div class="w-48 h-48 rounded-xl overflow-hidden">
                  <img
                    :src="pet.images[0]"
                    :alt="pet.name"
                    :data-testid="`pet-image-${pet.id}`"
                    class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <button
                  @click.stop="toggleFavorite(pet.id)"
                  :data-testid="`favorite-button-${pet.id}`"
                  class="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-all hover:scale-110"
                >
                  <span class="text-2xl">{{ isFavorite(pet.id) ? '❤️' : '🤍' }}</span>
                </button>
              </div>

              <!-- Pet Info -->
              <div class="flex-1 flex flex-col min-w-0">
                <div class="flex-1">
                  <h3
                    :data-testid="`pet-name-${pet.id}`"
                    class="text-2xl font-display font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors"
                  >
                    {{ pet.name }}
                  </h3>
                  <p
                    :data-testid="`pet-breed-${pet.id}`"
                    class="text-gray-600 mb-3 font-semibold capitalize"
                  >
                    {{ pet.breed }}
                  </p>
                  <p
                    :data-testid="`pet-details-${pet.id}`"
                    class="text-sm text-gray-500 mb-3 font-medium"
                  >
                    {{ pet.age }} years old • {{ pet.gender }}
                  </p>
                  <p
                    :data-testid="`pet-description-${pet.id}`"
                    class="text-gray-700 mb-4 line-clamp-3 text-sm leading-relaxed"
                  >
                    {{ pet.description }}
                  </p>

                  <!-- Badges -->
                  <div :data-testid="`pet-traits-${pet.id}`" class="flex flex-wrap gap-2 mb-4">
                    <span
                      v-for="trait in pet.personality.slice(0, 3)"
                      :key="trait"
                      class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-primary-100 text-primary-700"
                    >
                      {{ trait }}
                    </span>
                  </div>
                </div>

                <!-- CTA Button -->
                <button
                  :data-testid="`view-details-button-${pet.id}`"
                  class="w-full py-3 rounded-lg font-bold transition-colors shadow-sm hover:shadow-md"
                  style="background-color: #2ea3f2; color: #ffffff; font-size: 16px"
                  @mouseover="$event.target.style.backgroundColor = '#1890ff'"
                  @mouseout="$event.target.style.backgroundColor = '#2ea3f2'"
                >
                  View Details →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-20 bg-white rounded-xl shadow-soft">
        <div
          class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <span class="text-5xl">🔍</span>
        </div>
        <h3 class="text-3xl font-bold text-gray-900 mb-3">No pets found</h3>
        <p class="text-gray-600 mb-8 text-lg">Try adjusting your filters to see more results</p>
        <button
          @click="resetFilters"
          class="px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-bold transition-colors shadow-sm"
        >
          Clear All Filters
        </button>
      </div>

      <!-- Pagination -->
      <div
        v-if="totalPages > 1 && pets.length > 0"
        data-testid="pagination"
        class="flex justify-center items-center gap-4 mt-12"
      >
        <button
          @click="
            currentPage--;
            fetchPets();
          "
          :disabled="currentPage === 1"
          data-testid="pagination-previous"
          class="px-6 py-3 bg-white border-2 border-gray-300 rounded-lg font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50 transition-all shadow-sm"
          style="color: #374151; font-size: 16px"
        >
          ← Previous
        </button>

        <div
          class="flex items-center gap-3 bg-white px-6 py-3 rounded-lg shadow-sm border border-gray-200"
        >
          <span class="text-gray-600 font-medium" style="color: #4b5563">Page</span>
          <span
            data-testid="current-page"
            class="px-4 py-1.5 bg-primary-500 text-white rounded-md font-bold"
            style="font-size: 14px; color: #ffffff; background-color: #2ea3f2"
            >{{ currentPage }}</span
          >
          <span class="text-gray-600 font-medium" style="color: #4b5563">of</span>
          <span data-testid="total-pages" class="font-bold text-gray-900" style="color: #111827">{{
            totalPages
          }}</span>
        </div>

        <button
          @click="
            currentPage++;
            fetchPets();
          "
          :disabled="currentPage === totalPages"
          data-testid="pagination-next"
          class="px-6 py-3 bg-white border-2 border-gray-300 rounded-lg font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50 transition-all shadow-sm"
          style="color: #374151; font-size: 16px"
        >
          Next →
        </button>
      </div>
    </div>
  </div>
</template>
