<template>
  <nav
    :class="[
      'fixed top-0 inset-x-0 z-50 transition-all duration-500',
      scrolled
        ? 'bg-[#030712]/80 backdrop-blur-2xl border-b border-white/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.3)]'
        : 'bg-transparent'
    ]"
  >
    <div class="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between h-[72px]">
      <!-- Logo -->
      <a href="#hero" @click.prevent="scrollTo('hero')" class="group flex items-center gap-2.5 select-none">
        <span class="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 via-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-[15px] shadow-[0_0_20px_rgba(45,212,191,0.3)] group-hover:shadow-[0_0_30px_rgba(45,212,191,0.5)] transition-all duration-300">
          SV
        </span>
        <span class="text-[15px] font-semibold text-white tracking-wide hidden sm:block">
          Seyha<span class="text-teal-400">Vorn</span>
        </span>
      </a>

      <!-- Desktop nav links -->
      <div class="hidden md:flex items-center gap-1">
        <a
          v-for="link in navLinks"
          :key="link.id"
          :href="`#${link.id}`"
          @click.prevent="scrollTo(link.id)"
          :class="[
            'px-4 py-2 rounded-xl text-[13px] font-medium tracking-wide transition-all duration-300',
            activeSection === link.id
              ? 'text-teal-400 bg-teal-500/10'
              : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'
          ]"
        >
          {{ link.label }}
        </a>
      </div>

      <!-- CTA + Mobile toggle -->
      <div class="flex items-center gap-3">
        <a
          href="#contact"
          @click.prevent="scrollTo('contact')"
          class="hidden md:inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white text-[13px] font-semibold rounded-xl shadow-[0_0_20px_rgba(45,212,191,0.25)] hover:shadow-[0_0_30px_rgba(45,212,191,0.4)] transition-all duration-300 hover:-translate-y-0.5"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          Let's Talk
        </a>

        <!-- Mobile hamburger -->
        <button
          class="md:hidden w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all duration-300"
          @click="mobileOpen = !mobileOpen"
          aria-label="Toggle menu"
        >
          <svg v-if="!mobileOpen" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
    </div>

    <!-- Mobile Dropdown -->
    <transition name="slide-down">
      <div
        v-if="mobileOpen"
        class="md:hidden bg-[#030712]/95 backdrop-blur-2xl border-b border-white/[0.06] px-6 pb-6 pt-2"
      >
        <a
          v-for="link in navLinks"
          :key="link.id"
          :href="`#${link.id}`"
          @click.prevent="scrollTo(link.id); mobileOpen = false"
          :class="[
            'block px-4 py-3 rounded-xl text-[14px] font-medium transition-all duration-300 mb-1',
            activeSection === link.id
              ? 'text-teal-400 bg-teal-500/10'
              : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'
          ]"
        >
          {{ link.label }}
        </a>
        <a
          href="#contact"
          @click.prevent="scrollTo('contact'); mobileOpen = false"
          class="mt-3 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white text-[14px] font-semibold rounded-xl w-full"
        >
          Let's Talk
        </a>
      </div>
    </transition>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const navLinks = [
  { id: 'about', label: 'About' },
  { id: 'services', label: 'Services' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
]

const scrolled = ref(false)
const mobileOpen = ref(false)
const activeSection = ref('hero')

function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function onScroll() {
  scrolled.value = window.scrollY > 50

  // Determine active section
  const sections = ['contact', 'projects', 'experience', 'skills', 'services', 'about', 'hero']
  for (const id of sections) {
    const el = document.getElementById(id)
    if (el) {
      const rect = el.getBoundingClientRect()
      if (rect.top <= 150) {
        activeSection.value = id
        break
      }
    }
  }
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
