<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { petsAPI, applicationsAPI } from '../services/api';

const route = useRoute();
const router = useRouter();

const pet = ref(null);
const currentStep = ref(1);
const totalSteps = 5;
const error = ref('');
const success = ref('');

const application = ref({
  petId: route.params.petId,
  // Step 1
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  dateOfBirth: '',
  // Step 2
  housingType: '',
  ownOrRent: '',
  landlordApproval: false,
  hasYard: '',
  householdMembers: '',
  // Step 3
  currentPets: [],
  previousPets: '',
  veterinarianName: '',
  veterinarianPhone: '',
  // Step 4
  whyThisPet: '',
  activityLevel: '',
  hoursAlone: '',
  financiallyPrepared: false,
  // Step 5 - Review
  signature: '',
  agreedToTerms: false
});

const newPet = ref({
  type: '',
  name: '',
  age: ''
});

const fetchPet = async () => {
  try {
    const response = await petsAPI.getById(route.params.petId);
    pet.value = response.data;
  } catch (err) {
    console.error('Failed to load pet');
  }
};

const addCurrentPet = () => {
  if (newPet.value.type && newPet.value.name) {
    application.value.currentPets.push({ ...newPet.value });
    newPet.value = { type: '', name: '', age: '' };
  }
};

const removePet = (index) => {
  application.value.currentPets.splice(index, 1);
};

const nextStep = () => {
  if (validateStep()) {
    currentStep.value++;
  }
};

const previousStep = () => {
  currentStep.value--;
};

const validateStep = () => {
  error.value = '';

  switch (currentStep.value) {
    case 1:
      if (!application.value.firstName || !application.value.lastName ||
          !application.value.email || !application.value.phone ||
          !application.value.address || !application.value.dateOfBirth) {
        error.value = 'Please fill in all required fields';
        return false;
      }
      // Check age 18+
      const birthDate = new Date(application.value.dateOfBirth);
      const age = (new Date() - birthDate) / (365.25 * 24 * 60 * 60 * 1000);
      if (age < 18) {
        error.value = 'You must be 18 or older to adopt';
        return false;
      }
      break;
    case 2:
      if (!application.value.housingType || !application.value.ownOrRent ||
          !application.value.hasYard || !application.value.householdMembers) {
        error.value = 'Please fill in all required fields';
        return false;
      }
      if (application.value.ownOrRent === 'rent' && !application.value.landlordApproval) {
        error.value = 'Landlord approval is required for renters';
        return false;
      }
      break;
    case 3:
      if (!application.value.previousPets) {
        error.value = 'Please describe your previous pet experience';
        return false;
      }
      break;
    case 4:
      if (!application.value.whyThisPet || !application.value.activityLevel ||
          !application.value.hoursAlone || !application.value.financiallyPrepared) {
        error.value = 'Please fill in all required fields';
        return false;
      }
      break;
  }
  return true;
};

const submitApplication = async () => {
  error.value = '';
  success.value = '';

  if (!application.value.signature || !application.value.agreedToTerms) {
    error.value = 'Please sign and agree to terms';
    return;
  }

  try {
    await applicationsAPI.submit(application.value);
    success.value = 'Application submitted successfully!';
    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to submit application';
  }
};

onMounted(fetchPet);
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="bg-white rounded-lg shadow-lg p-8">
      <div v-if="pet" class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          Adoption Application for {{ pet.name }}
        </h1>
        <p class="text-gray-600">{{ pet.breed }} • {{ pet.species }}</p>
      </div>

      <!-- Error/Success Messages -->
      <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {{ error }}
      </div>
      <div v-if="success" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
        {{ success }}
      </div>

      <!-- Progress Bar -->
      <div class="mb-8">
        <div class="flex justify-between mb-2">
          <span class="text-sm font-medium">Step {{ currentStep }} of {{ totalSteps }}</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="bg-indigo-600 h-2 rounded-full transition-all"
            :style="{ width: `${(currentStep / totalSteps) * 100}%` }"
          ></div>
        </div>
      </div>

      <!-- Step 1: Personal Information -->
      <div v-if="currentStep === 1" class="space-y-4">
        <h2 class="text-2xl font-bold mb-4">Personal Information</h2>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              v-model="application.firstName"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              v-model="application.lastName"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            v-model="application.email"
            type="email"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Phone *
          </label>
          <input
            v-model="application.phone"
            type="tel"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Address *
          </label>
          <input
            v-model="application.address"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Date of Birth * (Must be 18+)
          </label>
          <input
            v-model="application.dateOfBirth"
            type="date"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <!-- Step 2: Living Situation -->
      <div v-if="currentStep === 2" class="space-y-4">
        <h2 class="text-2xl font-bold mb-4">Living Situation</h2>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Housing Type *
          </label>
          <select
            v-model="application.housingType"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select...</option>
            <option value="house">House</option>
            <option value="apartment">Apartment</option>
            <option value="condo">Condo</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Do you own or rent? *
          </label>
          <select
            v-model="application.ownOrRent"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select...</option>
            <option value="own">Own</option>
            <option value="rent">Rent</option>
          </select>
        </div>

        <div v-if="application.ownOrRent === 'rent'" class="flex items-center">
          <input
            v-model="application.landlordApproval"
            type="checkbox"
            id="landlordApproval"
            class="mr-2"
          />
          <label for="landlordApproval" class="text-sm text-gray-700">
            I have landlord approval to have pets *
          </label>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Do you have a yard? *
          </label>
          <select
            v-model="application.hasYard"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select...</option>
            <option value="fenced">Yes, fenced</option>
            <option value="unfenced">Yes, unfenced</option>
            <option value="none">No</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Number of household members *
          </label>
          <input
            v-model.number="application.householdMembers"
            type="number"
            min="1"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <!-- Step 3: Pet Experience -->
      <div v-if="currentStep === 3" class="space-y-4">
        <h2 class="text-2xl font-bold mb-4">Pet Experience</h2>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Current Pets
          </label>

          <div class="bg-gray-50 p-4 rounded-md mb-4">
            <div class="grid grid-cols-3 gap-2 mb-2">
              <input
                v-model="newPet.type"
                type="text"
                placeholder="Type (e.g. Dog)"
                class="px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                v-model="newPet.name"
                type="text"
                placeholder="Name"
                class="px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                v-model="newPet.age"
                type="text"
                placeholder="Age"
                class="px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <button
              @click="addCurrentPet"
              type="button"
              class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Add Pet
            </button>
          </div>

          <div v-if="application.currentPets.length > 0" class="space-y-2">
            <div
              v-for="(pet, index) in application.currentPets"
              :key="index"
              class="flex justify-between items-center bg-white p-3 rounded border"
            >
              <span>{{ pet.type }} - {{ pet.name }} ({{ pet.age }})</span>
              <button
                @click="removePet(index)"
                class="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Previous Pet Experience * (What happened to previous pets?)
          </label>
          <textarea
            v-model="application.previousPets"
            rows="4"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
            placeholder="Describe your experience with previous pets..."
          ></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Veterinarian Name
            </label>
            <input
              v-model="application.veterinarianName"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Veterinarian Phone
            </label>
            <input
              v-model="application.veterinarianPhone"
              type="tel"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      <!-- Step 4: Commitment -->
      <div v-if="currentStep === 4" class="space-y-4">
        <h2 class="text-2xl font-bold mb-4">Commitment & Lifestyle</h2>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Why do you want to adopt {{ pet?.name }}? *
          </label>
          <textarea
            v-model="application.whyThisPet"
            rows="4"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Activity Level You Can Provide *
          </label>
          <select
            v-model="application.activityLevel"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select...</option>
            <option value="low">Low (Short walks, mostly indoor)</option>
            <option value="moderate">Moderate (Daily walks, some playtime)</option>
            <option value="high">High (Long walks, lots of exercise)</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Hours pet would be alone daily *
          </label>
          <input
            v-model="application.hoursAlone"
            type="text"
            placeholder="e.g. 4-6 hours"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div class="flex items-center">
          <input
            v-model="application.financiallyPrepared"
            type="checkbox"
            id="financiallyPrepared"
            class="mr-2"
          />
          <label for="financiallyPrepared" class="text-sm text-gray-700">
            I am financially prepared for veterinary care, food, and other pet expenses *
          </label>
        </div>
      </div>

      <!-- Step 5: Review & Submit -->
      <div v-if="currentStep === 5" class="space-y-4">
        <h2 class="text-2xl font-bold mb-4">Review & Submit</h2>

        <div class="bg-gray-50 p-6 rounded-md space-y-3">
          <div>
            <h3 class="font-bold text-gray-700">Personal Information</h3>
            <p class="text-sm text-gray-600">
              {{ application.firstName }} {{ application.lastName }}<br />
              {{ application.email }} • {{ application.phone }}<br />
              {{ application.address }}
            </p>
          </div>

          <div>
            <h3 class="font-bold text-gray-700">Living Situation</h3>
            <p class="text-sm text-gray-600 capitalize">
              {{ application.housingType }} • {{ application.ownOrRent }}<br />
              Yard: {{ application.hasYard }}<br />
              Household members: {{ application.householdMembers }}
            </p>
          </div>

          <div>
            <h3 class="font-bold text-gray-700">Activity Level</h3>
            <p class="text-sm text-gray-600 capitalize">
              {{ application.activityLevel }}
            </p>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Digital Signature * (Type your full name)
          </label>
          <input
            v-model="application.signature"
            type="text"
            placeholder="Your Full Name"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 font-cursive"
          />
        </div>

        <div class="flex items-start">
          <input
            v-model="application.agreedToTerms"
            type="checkbox"
            id="terms"
            class="mr-2 mt-1"
          />
          <label for="terms" class="text-sm text-gray-700">
            I agree that all information provided is accurate and I understand that
            false information may result in denial of adoption. I agree to the shelter's
            terms and conditions. *
          </label>
        </div>
      </div>

      <!-- Navigation Buttons -->
      <div class="flex justify-between mt-8">
        <button
          v-if="currentStep > 1"
          @click="previousStep"
          class="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
        >
          Previous
        </button>
        <div v-else></div>

        <button
          v-if="currentStep < totalSteps"
          @click="nextStep"
          class="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
        >
          Next
        </button>
        <button
          v-else
          @click="submitApplication"
          data-testid="submit-application-button"
          class="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
        >
          Submit Application
        </button>
      </div>
    </div>
  </div>
</template>
