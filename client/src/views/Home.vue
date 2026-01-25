<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const features = [
  {
    icon: '🔍',
    title: 'Find Your Match',
    description: 'Browse hundreds of adorable pets waiting for their forever homes',
  },
  {
    icon: '📅',
    title: 'Easy Adoption',
    description: 'Simple application process and scheduling for meet & greets',
  },
  {
    icon: '❤️',
    title: 'Post-Adoption Support',
    description: 'We provide ongoing support to help you and your new pet adjust',
  }
];

const stats = [
  { number: '150+', label: 'Happy Adoptions' },
  { number: '50+', label: 'Pets Available' },
  { number: '100%', label: 'Love Guaranteed' }
];
</script>

<template>
  <div data-testid="home-page" class="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
    <!-- Hero Section -->
    <section data-testid="hero-section" class="relative overflow-hidden pt-16 pb-24">
      <!-- Decorative background elements -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-0 right-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div class="absolute bottom-0 left-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <!-- Left side - Text Content -->
          <div class="space-y-8">
            <!-- Main Heading -->
            <div class="space-y-4">
              <h1 data-testid="hero-heading" class="text-5xl md:text-6xl font-display font-bold text-gray-900 leading-tight">
                Find Your Perfect Pet Today
              </h1>
              <p data-testid="hero-subtitle" class="text-xl text-gray-700 leading-relaxed">
                Discover loving companions waiting for their forever homes. Every pet deserves a family.
              </p>
            </div>

            <!-- CTA Buttons - Side by Side -->
            <div data-testid="cta-buttons" class="flex flex-col sm:flex-row gap-4">
              <button
                @click="router.push('/pets')"
                data-testid="cta-browse-pets"
                class="flex-1 px-8 py-4 rounded-xl font-bold text-lg text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-center"
              >
                Browse Available Pets
              </button>
              <button
                @click="router.push('/quiz')"
                data-testid="cta-take-quiz"
                class="flex-1 px-8 py-4 rounded-xl font-bold text-lg text-indigo-700 bg-white hover:bg-gray-50 border-2 border-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-center"
              >
                Take Matching Quiz
              </button>
            </div>

            <!-- Trust Indicators Box -->
            <div data-testid="trust-indicators" class="bg-white/80 backdrop-blur-sm rounded-xl p-6 border-2 border-purple-200 shadow-lg">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                  <span class="font-semibold text-gray-800">Verified Shelters</span>
                </div>
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                  <span class="font-semibold text-gray-800">Health Checked</span>
                </div>
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                  <span class="font-semibold text-gray-800">Full Support</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Right side - Pet Image -->
          <div class="hidden lg:block">
            <div class="relative">
              <div class="absolute inset-0 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-3xl transform rotate-3"></div>
              <div class="relative bg-white rounded-3xl p-2 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=600&h=600&fit=crop"
                  alt="Happy adopted dog"
                  class="w-full h-[500px] object-cover rounded-2xl"
                />
                <div class="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                  <p class="font-bold text-gray-900 text-lg">Meet Max!</p>
                  <p class="text-gray-600">Just found his forever home ❤️</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section data-testid="features-section" class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 data-testid="features-heading" class="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
            Why Adopt With Us?
          </h2>
          <p data-testid="features-subtitle" class="text-xl text-gray-600 max-w-2xl mx-auto">
            We make the adoption process simple, supportive, and rewarding
          </p>
        </div>

        <div data-testid="features-grid" class="grid md:grid-cols-3 gap-8">
          <div
            v-for="(feature, index) in features"
            :key="index"
            :data-testid="`feature-card-${index}`"
            class="bg-white border-2 border-purple-200 rounded-2xl p-8 hover:border-purple-400 transition-all duration-300 hover:shadow-xl"
          >
            <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-lg">
              {{ feature.icon }}
            </div>
            <h3 class="text-2xl font-display font-bold text-gray-900 mb-3">
              {{ feature.title }}
            </h3>
            <p class="text-gray-600 leading-relaxed">
              {{ feature.description }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section data-testid="stats-section" class="py-20 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 relative overflow-hidden">
      <!-- Decorative pattern -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute inset-0" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 50px 50px;"></div>
      </div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid md:grid-cols-3 gap-8">
          <div data-testid="stat-adoptions" class="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border-2 border-white/20 text-center">
            <div data-testid="stat-adoptions-value" class="text-5xl md:text-6xl font-display font-bold text-white mb-2">
              150+
            </div>
            <div data-testid="stat-adoptions-label" class="text-xl text-white/95 font-semibold">
              Happy Adoptions
            </div>
          </div>
          <div data-testid="stat-available" class="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border-2 border-white/20 text-center">
            <div data-testid="stat-available-value" class="text-5xl md:text-6xl font-display font-bold text-white mb-2">
              50+
            </div>
            <div data-testid="stat-available-label" class="text-xl text-white/95 font-semibold">
              Pets Available
            </div>
          </div>
          <div data-testid="stat-guarantee" class="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border-2 border-white/20 text-center">
            <div data-testid="stat-guarantee-value" class="text-5xl md:text-6xl font-display font-bold text-white mb-2">
              100%
            </div>
            <div data-testid="stat-guarantee-label" class="text-xl text-white/95 font-semibold">
              Love Guaranteed
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section data-testid="final-cta-section" class="py-24 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white border-2 border-purple-200 rounded-3xl p-12 text-center shadow-xl">
          <h2 data-testid="final-cta-heading" class="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
            Ready to Meet Your New Best Friend?
          </h2>
          <p data-testid="final-cta-text" class="text-xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
            Start your adoption journey today and give a loving pet the forever home they deserve
          </p>
          <button
            @click="router.push('/pets')"
            data-testid="final-cta-button"
            class="px-12 py-5 rounded-xl font-bold text-lg text-white bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            View All Available Pets →
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 0.2;
  }
  50% {
    opacity: 0.3;
  }
}

.animation-delay-2000 {
  animation-delay: 2s;
}
</style>
