<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { quizAPI, petsAPI } from '../services/api';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const currentQuestion = ref(0);
const showResults = ref(false);
const matchResults = ref([]);
const matchedPets = ref([]);

const answers = ref({
  speciesPreference: '',
  sizePreference: [],
  activityLevel: '',
  experience: '',
  housingType: '',
  hasYard: false,
  hasKids: false,
  hasOtherPets: false,
  timeCommitment: ''
});

const questions = [
  {
    id: 'speciesPreference',
    question: 'What type of pet are you looking for?',
    type: 'single',
    options: [
      { value: 'dog', label: 'Dog', emoji: '🐕' },
      { value: 'cat', label: 'Cat', emoji: '🐈' },
      { value: 'rabbit', label: 'Rabbit', emoji: '🐰' },
      { value: 'any', label: "I'm open to any!", emoji: '❤️' }
    ]
  },
  {
    id: 'sizePreference',
    question: 'What size pet would work best for you? (Select all that apply)',
    type: 'multiple',
    options: [
      { value: 'small', label: 'Small (under 25 lbs)', emoji: '🐕‍🦺' },
      { value: 'medium', label: 'Medium (25-60 lbs)', emoji: '🐕' },
      { value: 'large', label: 'Large (over 60 lbs)', emoji: '🦮' }
    ]
  },
  {
    id: 'activityLevel',
    question: 'How active are you?',
    type: 'single',
    options: [
      { value: 'low', label: 'Low - I prefer quiet, relaxed activities', emoji: '🛋️' },
      { value: 'moderate', label: 'Moderate - Daily walks and some playtime', emoji: '🚶' },
      { value: 'high', label: 'High - Long walks, running, lots of activity', emoji: '🏃' }
    ]
  },
  {
    id: 'experience',
    question: 'What is your experience level with pets?',
    type: 'single',
    options: [
      { value: 'first-time', label: 'First-time pet owner', emoji: '🆕' },
      { value: 'some', label: 'Some experience', emoji: '👍' },
      { value: 'experienced', label: 'Very experienced', emoji: '⭐' }
    ]
  },
  {
    id: 'housingType',
    question: 'What type of home do you have?',
    type: 'single',
    options: [
      { value: 'apartment', label: 'Apartment', emoji: '🏢' },
      { value: 'condo', label: 'Condo/Townhouse', emoji: '🏘️' },
      { value: 'house', label: 'House', emoji: '🏡' }
    ]
  },
  {
    id: 'hasYard',
    question: 'Do you have a yard?',
    type: 'boolean',
    options: [
      { value: true, label: 'Yes', emoji: '✅' },
      { value: false, label: 'No', emoji: '❌' }
    ]
  },
  {
    id: 'hasKids',
    question: 'Do you have children in your household?',
    type: 'boolean',
    options: [
      { value: true, label: 'Yes', emoji: '👶' },
      { value: false, label: 'No', emoji: '❌' }
    ]
  },
  {
    id: 'hasOtherPets',
    question: 'Do you have other pets?',
    type: 'boolean',
    options: [
      { value: true, label: 'Yes', emoji: '🐾' },
      { value: false, label: 'No', emoji: '❌' }
    ]
  },
  {
    id: 'timeCommitment',
    question: 'How much time can you dedicate to pet care daily?',
    type: 'single',
    options: [
      { value: 'low', label: '1-2 hours', emoji: '⏰' },
      { value: 'moderate', label: '2-4 hours', emoji: '⏱️' },
      { value: 'high', label: '4+ hours', emoji: '⏳' }
    ]
  }
];

const currentQ = computed(() => questions[currentQuestion.value]);
const progress = computed(() => ((currentQuestion.value + 1) / questions.length) * 100);

const selectAnswer = (questionId, value) => {
  if (currentQ.value.type === 'multiple') {
    if (!Array.isArray(answers.value[questionId])) {
      answers.value[questionId] = [];
    }
    const index = answers.value[questionId].indexOf(value);
    if (index > -1) {
      answers.value[questionId].splice(index, 1);
    } else {
      answers.value[questionId].push(value);
    }
  } else {
    answers.value[questionId] = value;
  }
};

const isSelected = (questionId, value) => {
  if (Array.isArray(answers.value[questionId])) {
    return answers.value[questionId].includes(value);
  }
  return answers.value[questionId] === value;
};

const canProceed = computed(() => {
  const answer = answers.value[currentQ.value.id];
  if (Array.isArray(answer)) {
    return answer.length > 0;
  }
  return answer !== '' && answer !== undefined && answer !== null;
});

const nextQuestion = () => {
  if (currentQuestion.value < questions.length - 1) {
    currentQuestion.value++;
  } else {
    submitQuiz();
  }
};

const previousQuestion = () => {
  if (currentQuestion.value > 0) {
    currentQuestion.value--;
  }
};

const submitQuiz = async () => {
  if (!authStore.isAuthenticated) {
    if (confirm('Please login to save your quiz results and see matches!')) {
      router.push('/login');
    }
    return;
  }

  try {
    const response = await quizAPI.submit(answers.value);
    matchResults.value = response.data.matches;

    // Fetch pet details for top matches
    const topMatches = matchResults.value.slice(0, 9);
    const petPromises = topMatches.map(match => petsAPI.getById(match.petId));
    const pets = await Promise.all(petPromises);

    matchedPets.value = pets.map((petResponse, index) => ({
      ...petResponse.data,
      matchScore: topMatches[index].score
    }));

    showResults.value = true;
  } catch (err) {
    console.error('Failed to submit quiz', err);
    alert('Failed to submit quiz');
  }
};

const restartQuiz = () => {
  currentQuestion.value = 0;
  showResults.value = false;
  answers.value = {
    speciesPreference: '',
    sizePreference: [],
    activityLevel: '',
    experience: '',
    housingType: '',
    hasYard: false,
    hasKids: false,
    hasOtherPets: false,
    timeCommitment: ''
  };
};
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Quiz Questions -->
    <div v-if="!showResults" class="bg-white rounded-lg shadow-lg p-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-6">Pet Matcher Quiz</h1>

      <!-- Progress Bar -->
      <div class="mb-8">
        <div class="flex justify-between mb-2">
          <span class="text-sm font-medium">
            Question {{ currentQuestion + 1 }} of {{ questions.length }}
          </span>
          <span class="text-sm font-medium">{{ Math.round(progress) }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="bg-indigo-600 h-2 rounded-full transition-all"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
      </div>

      <!-- Question -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">
          {{ currentQ.question }}
        </h2>

        <div class="space-y-3">
          <button
            v-for="option in currentQ.options"
            :key="option.value"
            @click="selectAnswer(currentQ.id, option.value)"
            :class="[
              'w-full p-4 rounded-lg border-2 text-left transition flex items-center space-x-4',
              isSelected(currentQ.id, option.value)
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-gray-300 hover:border-indigo-400'
            ]"
          >
            <span class="text-3xl">{{ option.emoji }}</span>
            <span class="text-lg font-medium">{{ option.label }}</span>
            <span v-if="isSelected(currentQ.id, option.value)" class="ml-auto text-indigo-600">
              ✓
            </span>
          </button>
        </div>
      </div>

      <!-- Navigation -->
      <div class="flex justify-between">
        <button
          v-if="currentQuestion > 0"
          @click="previousQuestion"
          class="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
        >
          Previous
        </button>
        <div v-else></div>

        <button
          @click="nextQuestion"
          :disabled="!canProceed"
          class="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ currentQuestion === questions.length - 1 ? 'See Results' : 'Next' }}
        </button>
      </div>
    </div>

    <!-- Results -->
    <div v-else class="bg-white rounded-lg shadow-lg p-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Your Perfect Matches!</h1>
      <p class="text-gray-600 mb-8">
        Based on your answers, here are the pets that match your lifestyle best:
      </p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div
          v-for="pet in matchedPets"
          :key="pet.id"
          class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer"
          @click="router.push(`/pets/${pet.id}`)"
        >
          <div class="relative">
            <img
              :src="pet.images[0]"
              :alt="pet.name"
              class="w-full h-48 object-cover"
            />
            <div class="absolute top-4 right-4 bg-white rounded-full px-3 py-1 shadow-md">
              <span class="font-bold text-indigo-600">{{ pet.matchScore }}%</span>
            </div>
          </div>

          <div class="p-4">
            <h3 class="text-xl font-bold mb-2">{{ pet.name }}</h3>
            <p class="text-gray-600 mb-4">{{ pet.breed }} • {{ pet.age }} years</p>

            <div class="mb-4">
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="bg-indigo-600 h-2 rounded-full"
                  :style="{ width: `${pet.matchScore}%` }"
                ></div>
              </div>
            </div>

            <button
              class="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition"
            >
              View Profile
            </button>
          </div>
        </div>
      </div>

      <div class="flex justify-center space-x-4">
        <button
          @click="restartQuiz"
          class="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
        >
          Retake Quiz
        </button>
        <button
          @click="router.push('/pets')"
          class="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
        >
          Browse All Pets
        </button>
      </div>
    </div>
  </div>
</template>
