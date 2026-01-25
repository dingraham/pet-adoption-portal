<script setup>
import { ref, onMounted } from 'vue';
import { petsAPI, applicationsAPI } from '../services/api';

const activeTab = ref('pets');
const pets = ref([]);
const applications = ref([]);
const loading = ref(true);

const showPetModal = ref(false);
const editingPet = ref(null);

const petForm = ref({
  name: '',
  species: 'dog',
  breed: '',
  age: '',
  ageCategory: 'adult',
  gender: 'male',
  size: 'medium',
  weight: '',
  color: '',
  description: '',
  personality: [],
  medicalHistory: '',
  specialNeeds: false,
  goodWith: [],
  goodForFirstTime: true,
  activityLevel: 'moderate',
  needsYard: false,
  needsExperienced: false,
  timeRequirement: 'moderate',
  location: 'Main Shelter',
  images: ['https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800'],
  status: 'available'
});

const newPersonalityTrait = ref('');
const stats = ref({
  totalPets: 0,
  availablePets: 0,
  pendingApplications: 0,
  approvedApplications: 0
});

const fetchPets = async () => {
  try {
    const response = await petsAPI.getAll({ limit: 100 });
    pets.value = response.data.pets;
    stats.value.totalPets = pets.value.length;
    stats.value.availablePets = pets.value.filter(p => p.status === 'available').length;
  } catch (err) {
    console.error('Failed to load pets');
  }
};

const fetchApplications = async () => {
  try {
    const response = await applicationsAPI.getAll();
    applications.value = response.data;

    // Fetch pet details for each application
    for (const app of applications.value) {
      const petResponse = await petsAPI.getById(app.petId);
      app.pet = petResponse.data;
    }

    stats.value.pendingApplications = applications.value.filter(a => a.status === 'pending' || a.status === 'under_review').length;
    stats.value.approvedApplications = applications.value.filter(a => a.status === 'approved').length;
  } catch (err) {
    console.error('Failed to load applications');
  }
};

const openPetModal = (pet = null) => {
  if (pet) {
    editingPet.value = pet;
    petForm.value = { ...pet };
  } else {
    editingPet.value = null;
    petForm.value = {
      name: '',
      species: 'dog',
      breed: '',
      age: '',
      ageCategory: 'adult',
      gender: 'male',
      size: 'medium',
      weight: '',
      color: '',
      description: '',
      personality: [],
      medicalHistory: '',
      specialNeeds: false,
      goodWith: [],
      goodForFirstTime: true,
      activityLevel: 'moderate',
      needsYard: false,
      needsExperienced: false,
      timeRequirement: 'moderate',
      location: 'Main Shelter',
      images: ['https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800'],
      status: 'available'
    };
  }
  showPetModal.value = true;
};

const savePet = async () => {
  try {
    if (editingPet.value) {
      await petsAPI.update(editingPet.value.id, petForm.value);
    } else {
      await petsAPI.create(petForm.value);
    }
    showPetModal.value = false;
    await fetchPets();
  } catch (err) {
    alert('Failed to save pet');
  }
};

const deletePet = async (petId) => {
  if (!confirm('Are you sure you want to delete this pet?')) return;

  try {
    await petsAPI.delete(petId);
    await fetchPets();
  } catch (err) {
    alert('Failed to delete pet');
  }
};

const updateApplicationStatus = async (appId, status) => {
  const notes = prompt('Add notes (optional):');

  try {
    await applicationsAPI.updateStatus(appId, status, notes);
    await fetchApplications();
    await fetchPets(); // Refresh pets to update status
  } catch (err) {
    alert('Failed to update application');
  }
};

const addPersonalityTrait = () => {
  if (newPersonalityTrait.value.trim()) {
    petForm.value.personality.push(newPersonalityTrait.value.trim());
    newPersonalityTrait.value = '';
  }
};

const removePersonalityTrait = (index) => {
  petForm.value.personality.splice(index, 1);
};

const toggleGoodWith = (value) => {
  const index = petForm.value.goodWith.indexOf(value);
  if (index > -1) {
    petForm.value.goodWith.splice(index, 1);
  } else {
    petForm.value.goodWith.push(value);
  }
};

const getStatusColor = (status) => {
  const colors = {
    available: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    adopted: 'bg-blue-100 text-blue-800',
    under_review: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

onMounted(async () => {
  await Promise.all([fetchPets(), fetchApplications()]);
  loading.value = false;
});
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-4xl font-bold text-gray-900 mb-8">Admin Panel</h1>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-3xl font-bold text-indigo-600">{{ stats.totalPets }}</div>
        <div class="text-gray-600">Total Pets</div>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-3xl font-bold text-green-600">{{ stats.availablePets }}</div>
        <div class="text-gray-600">Available</div>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-3xl font-bold text-yellow-600">{{ stats.pendingApplications }}</div>
        <div class="text-gray-600">Pending Apps</div>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <div class="text-3xl font-bold text-blue-600">{{ stats.approvedApplications }}</div>
        <div class="text-gray-600">Approved</div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="border-b border-gray-200 mb-6">
      <nav class="flex space-x-8">
        <button
          @click="activeTab = 'pets'"
          :class="[
            'py-4 px-1 border-b-2 font-medium text-sm',
            activeTab === 'pets'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          ]"
        >
          Manage Pets
        </button>
        <button
          @click="activeTab = 'applications'"
          :class="[
            'py-4 px-1 border-b-2 font-medium text-sm',
            activeTab === 'applications'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          ]"
        >
          Review Applications
        </button>
      </nav>
    </div>

    <!-- Pets Tab -->
    <div v-if="activeTab === 'pets'">
      <div class="mb-6">
        <button
          @click="openPetModal()"
          class="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
        >
          + Add New Pet
        </button>
      </div>

      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Pet
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Species
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Age
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="pet in pets" :key="pet.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <img :src="pet.images[0]" :alt="pet.name" class="w-12 h-12 rounded object-cover" />
                  <div class="ml-4">
                    <div class="font-medium">{{ pet.name }}</div>
                    <div class="text-sm text-gray-500">{{ pet.breed }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap capitalize">
                {{ pet.species }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ pet.age }} years
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="['px-2 py-1 text-xs rounded-full capitalize', getStatusColor(pet.status)]"
                >
                  {{ pet.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <button
                  @click="openPetModal(pet)"
                  class="text-indigo-600 hover:underline mr-4"
                >
                  Edit
                </button>
                <button
                  @click="deletePet(pet.id)"
                  class="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Applications Tab -->
    <div v-else-if="activeTab === 'applications'">
      <div class="space-y-4">
        <div
          v-for="app in applications"
          :key="app.id"
          class="bg-white rounded-lg shadow p-6"
        >
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-xl font-bold">{{ app.firstName }} {{ app.lastName }}</h3>
              <p class="text-gray-600">{{ app.email }} • {{ app.phone }}</p>
              <p class="text-sm text-gray-500 mt-1">
                Applied for: <span class="font-medium">{{ app.pet?.name }}</span>
              </p>
              <p class="text-sm text-gray-500">
                Submitted: {{ new Date(app.submittedAt).toLocaleString() }}
              </p>
            </div>
            <span
              :class="['px-3 py-1 rounded-full text-sm font-medium capitalize', getStatusColor(app.status)]"
            >
              {{ app.status.replace('_', ' ') }}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <span class="font-medium">Housing:</span> {{ app.housingType }} ({{ app.ownOrRent }})
            </div>
            <div>
              <span class="font-medium">Yard:</span> {{ app.hasYard }}
            </div>
            <div>
              <span class="font-medium">Household:</span> {{ app.householdMembers }} members
            </div>
            <div>
              <span class="font-medium">Activity Level:</span> {{ app.activityLevel }}
            </div>
          </div>

          <div class="mb-4">
            <p class="font-medium text-sm mb-1">Why they want this pet:</p>
            <p class="text-sm text-gray-600">{{ app.whyThisPet }}</p>
          </div>

          <div v-if="app.status === 'pending' || app.status === 'under_review'" class="flex space-x-3">
            <button
              @click="updateApplicationStatus(app.id, 'under_review')"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Mark Under Review
            </button>
            <button
              @click="updateApplicationStatus(app.id, 'approved')"
              class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Approve
            </button>
            <button
              @click="updateApplicationStatus(app.id, 'rejected')"
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pet Modal -->
    <div
      v-if="showPetModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      @click.self="showPetModal = false"
    >
      <div class="bg-white rounded-lg p-8 max-w-2xl w-full my-8">
        <h2 class="text-2xl font-bold mb-6">
          {{ editingPet ? 'Edit Pet' : 'Add New Pet' }}
        </h2>

        <div class="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Name *</label>
              <input
                v-model="petForm.name"
                type="text"
                class="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Species *</label>
              <select v-model="petForm.species" class="w-full px-3 py-2 border rounded-md">
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
                <option value="rabbit">Rabbit</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Breed *</label>
              <input
                v-model="petForm.breed"
                type="text"
                class="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Age *</label>
              <input
                v-model.number="petForm.age"
                type="number"
                class="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Gender</label>
              <select v-model="petForm.gender" class="w-full px-3 py-2 border rounded-md">
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Size</label>
              <select v-model="petForm.size" class="w-full px-3 py-2 border rounded-md">
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Weight (lbs)</label>
              <input
                v-model.number="petForm.weight"
                type="number"
                class="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Description</label>
            <textarea
              v-model="petForm.description"
              rows="3"
              class="w-full px-3 py-2 border rounded-md"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Personality Traits</label>
            <div class="flex space-x-2 mb-2">
              <input
                v-model="newPersonalityTrait"
                type="text"
                placeholder="Add trait..."
                class="flex-1 px-3 py-2 border rounded-md"
                @keyup.enter="addPersonalityTrait"
              />
              <button
                @click="addPersonalityTrait"
                type="button"
                class="px-4 py-2 bg-indigo-600 text-white rounded-md"
              >
                Add
              </button>
            </div>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(trait, index) in petForm.personality"
                :key="index"
                class="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm flex items-center"
              >
                {{ trait }}
                <button
                  @click="removePersonalityTrait(index)"
                  class="ml-2 text-indigo-600 hover:text-indigo-800"
                >
                  ×
                </button>
              </span>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Good With</label>
            <div class="flex space-x-4">
              <label class="flex items-center">
                <input
                  type="checkbox"
                  :checked="petForm.goodWith.includes('kids')"
                  @change="toggleGoodWith('kids')"
                  class="mr-2"
                />
                Kids
              </label>
              <label class="flex items-center">
                <input
                  type="checkbox"
                  :checked="petForm.goodWith.includes('pets')"
                  @change="toggleGoodWith('pets')"
                  class="mr-2"
                />
                Other Pets
              </label>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Activity Level</label>
              <select v-model="petForm.activityLevel" class="w-full px-3 py-2 border rounded-md">
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Status</label>
              <select v-model="petForm.status" class="w-full px-3 py-2 border rounded-md">
                <option value="available">Available</option>
                <option value="pending">Pending</option>
                <option value="adopted">Adopted</option>
              </select>
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-3 mt-6">
          <button
            @click="showPetModal = false"
            class="px-6 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            @click="savePet"
            class="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            {{ editingPet ? 'Update' : 'Create' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
