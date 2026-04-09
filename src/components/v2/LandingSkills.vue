<template>
  <section id="skills" ref="sectionRef" class="relative py-24 lg:py-32 overflow-hidden">
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(59,130,246,0.04)_0%,_transparent_50%)]"></div>

    <div class="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">

      <!-- Section header -->
      <div class="text-center mb-16">
        <div class="inline-flex items-center gap-3 font-mono text-[11px] tracking-[4px] uppercase text-blue-400 mb-4 font-semibold">
          <span class="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></span>
          Skills & Technologies
        </div>
        <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
          My <span class="text-gradient">Technical</span> Arsenal
        </h2>
        <p class="mt-4 text-[var(--text-secondary)] text-[15px] font-light max-w-xl mx-auto leading-relaxed">
          A broad toolkit across backend, frontend, cloud, and AI — built through years of production work.
        </p>
      </div>

      <!-- Skill categories grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="(cat, ci) in cvData.skillCategories"
          :key="ci"
          class="glass-card p-6 md:p-7 group hover:border-blue-500/30"
        >
          <!-- Category header -->
          <div class="flex items-center gap-3 mb-6">
            <div class="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-300">
              <svg v-if="cat.icon === 'server'" class="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>
              <svg v-else-if="cat.icon === 'code'" class="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
              <svg v-else-if="cat.icon === 'database'" class="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
              <svg v-else-if="cat.icon === 'cloud'" class="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
              <svg v-else-if="cat.icon === 'cpu'" class="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 3H7a2 2 0 00-2 2v2M9 3h6M9 3v2m6-2h2a2 2 0 012 2v2M15 3v2M3 9v6M3 9h2m16 0h-2m2 0v6m0 0h-2M3 15h2m14 6H7a2 2 0 01-2-2v-2m14 4h2a2 2 0 002-2v-2m-2 4v-2M9 21v-2m6 2v-2M9 9h6v6H9z" /></svg>
              <svg v-else-if="cat.icon === 'check-circle'" class="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 class="text-[16px] font-bold text-white group-hover:text-blue-300 transition-colors duration-300">
              {{ cat.label }}
            </h3>
          </div>

          <!-- Skills list with animated bars -->
          <div class="space-y-4">
            <div v-for="(skill, si) in cat.skills" :key="si">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-[13px] text-[var(--text-secondary)] font-medium">{{ skill.name }}</span>
                <span class="font-mono text-[11px] text-teal-400/80">{{ skill.percentage }}%</span>
              </div>
              <div class="w-full h-[6px] bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full bg-gradient-to-r from-teal-500 to-blue-500 transition-all duration-1000 ease-out"
                  :class="visible ? 'skill-bar' : ''"
                  :style="{ '--target-width': skill.percentage + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Certifications -->
      <div class="mt-16">
        <div class="flex items-center gap-3 font-mono text-[11px] tracking-[4px] uppercase text-amber-400 mb-6 font-semibold">
          <span class="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.8)]"></span>
          Certifications
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="(cert, ci) in cvData.certifications"
            :key="ci"
            class="glass-card px-6 py-5 flex items-center gap-4 group hover:border-amber-500/40 hover:shadow-[0_0_25px_rgba(245,158,11,0.1)]"
          >
            <div class="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-amber-500/20 transition-all duration-300">
              <svg v-if="cert.icon === 'cloud'" class="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
              <svg v-else-if="cert.icon === 'leaf'" class="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
              <svg v-else-if="cert.icon === 'box'" class="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
            <div class="min-w-0">
              <h4 class="text-[14px] font-semibold text-white group-hover:text-amber-300 transition-colors duration-300 truncate">{{ cert.title }}</h4>
              <p class="text-[12px] text-[var(--text-tertiary)] font-mono mt-0.5">{{ cert.issuer }} · {{ cert.year }}</p>
            </div>
            <!-- Verified badge -->
            <div class="ml-auto shrink-0">
              <svg class="w-5 h-5 text-amber-400/60 group-hover:text-amber-400 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { cvData } from '../../data/cv'

const sectionRef = ref<HTMLElement | null>(null)
const visible = ref(false)

onMounted(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        visible.value = true
        observer.disconnect()
      }
    },
    { threshold: 0.1 }
  )
  if (sectionRef.value) observer.observe(sectionRef.value)
})
</script>

<style scoped>
.skill-bar {
  width: 0;
  animation: fillBar 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: 0.3s;
}

@keyframes fillBar {
  to { width: var(--target-width); }
}
</style>
