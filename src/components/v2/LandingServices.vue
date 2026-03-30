<template>
  <section id="services" class="relative py-24 lg:py-32 overflow-hidden">
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_right,_rgba(168,85,247,0.04)_0%,_transparent_50%)]"></div>

    <div class="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">

      <!-- Section header -->
      <div class="text-center mb-16">
        <div class="inline-flex items-center gap-3 font-mono text-[11px] tracking-[4px] uppercase text-purple-400 mb-4 font-semibold">
          <span class="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.8)]"></span>
          What I Do
        </div>
        <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
          Services & <span class="text-gradient">Expertise</span>
        </h2>
      </div>

      <!-- Cards grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="(service, index) in cvData.services"
          :key="index"
          class="glass-card p-7 md:p-8 group relative hover:border-purple-500/40 hover:shadow-[0_0_40px_rgba(168,85,247,0.12)]"
        >
          <!-- Number -->
          <div class="absolute top-6 right-6 font-mono text-[48px] font-bold text-white/[0.03] leading-none select-none group-hover:text-white/[0.06] transition-all duration-500">
            {{ String(index + 1).padStart(2, '0') }}
          </div>

          <!-- Icon -->
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/15 to-purple-600/5 border border-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:from-purple-500/25 group-hover:to-purple-600/10 transition-all duration-400 shadow-[0_0_20px_rgba(168,85,247,0.08)] group-hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]">
            <!-- Server -->
            <svg v-if="service.icon === 'server'" class="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>
            <!-- Code -->
            <svg v-else-if="service.icon === 'code'" class="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
            <!-- Database -->
            <svg v-else-if="service.icon === 'database'" class="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
            <!-- CPU / AI -->
            <svg v-else-if="service.icon === 'cpu'" class="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 3H7a2 2 0 00-2 2v2M9 3h6M9 3v2m6-2h2a2 2 0 012 2v2M15 3v2M3 9v6M3 9h2m16 0h-2m2 0v6m0 0h-2M3 15h2m14 6H7a2 2 0 01-2-2v-2m14 4h2a2 2 0 002-2v-2m-2 4v-2M9 21v-2m6 2v-2M9 9h6v6H9z" /></svg>
            <!-- Cloud -->
            <svg v-else-if="service.icon === 'cloud'" class="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
          </div>

          <h3 class="text-[18px] font-bold text-white mb-3 group-hover:text-purple-300 transition-colors duration-300 tracking-wide">
            {{ service.title }}
          </h3>
          <p class="text-[14px] leading-[1.8] text-[var(--text-secondary)] font-light">
            {{ service.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { cvData } from '../../data/cv'
</script>
