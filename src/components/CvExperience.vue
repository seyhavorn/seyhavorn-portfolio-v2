<template>
  <section class="mb-8">
    <div
      class="flex items-center gap-3 font-mono text-[11px] tracking-[4px] uppercase text-teal-400 mb-8 font-semibold pl-2">
      <span class="w-1.5 h-1.5 rounded-full bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.8)]"></span> Experience
    </div>

    <div v-for="(experience, cIndex) in experiences" :key="cIndex" class="mb-10 relative">
      <!-- Glow Line Background -->
      <div
        class="absolute left-[20px] top-6 bottom-0 w-[2px] bg-gradient-to-b from-teal-500/50 via-blue-500/20 to-transparent z-0">
      </div>

      <!-- Company Header -->
      <div class="relative z-10 pl-16 mb-6 group">
        <div
          class="absolute left-[16px] top-1.5 w-[10px] h-[10px] rounded-full bg-teal-400 border-[3px] border-[var(--bg)] shadow-[0_0_12px_rgba(45,212,191,0.8)] group-hover:scale-125 transition-transform duration-300">
        </div>
        <div class="flex flex-wrap items-center gap-3 mb-1">
          <span class="text-[18px] md:text-[20px] font-semibold text-white tracking-wide">{{ experience.company
            }}</span>
          <span
            class="font-mono text-[11px] text-teal-300 bg-teal-900/40 border border-teal-500/30 px-3 py-1 rounded-full font-medium shadow-[0_0_10px_rgba(45,212,191,0.1)]">{{
              experience.totalDuration }}</span>
        </div>
        <div class="text-[13px] text-[var(--text-tertiary)] font-mono flex items-center gap-2">
          <span>{{ experience.location }}</span>
          <span class="w-1 h-1 rounded-full bg-white/20"></span>
          <span>{{ experience.type }}</span>
        </div>
      </div>

      <!-- Job Cards Timeline -->
      <div class="space-y-6 relative z-10 pl-12">
        <div v-for="(job, index) in experience.jobs" :key="index" class="glass-card p-6 md:p-8 relative group">
          <!-- Timeline Connection Dot on Card hover -->
          <div
            class="absolute -left-[30px] top-8 w-[6px] h-[6px] rounded-full bg-teal-500/50 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-[0_0_8px_rgba(45,212,191,0.8)]">
          </div>

          <div class="flex flex-wrap justify-between items-baseline mb-3 gap-3">
            <h3 class="text-[17px] font-bold text-white tracking-wide">{{ job.title }}</h3>
            <span class="font-mono text-[12px] text-teal-400/80">{{ job.period }}</span>
          </div>

          <div class="text-[13px] text-[var(--text-tertiary)] mb-4 flex items-center gap-2">
            <svg class="w-3.5 h-3.5 fill-current text-blue-400/80" viewBox="0 0 20 20">
              <path fill-rule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clip-rule="evenodd" />
            </svg>
            {{ job.location }}
          </div>

          <p class="text-[14px] md:text-[15px] leading-[1.8] text-[var(--text-secondary)] font-light mb-6">
            {{ job.description }}
          </p>

          <div class="flex flex-wrap gap-2">
            <span v-for="(tag, tIndex) in job.tags" :key="tIndex" :class="getTagClass(tag.type)">
              {{ tag.name }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { cvData } from '../data/cv'
const experiences = cvData.experiences

const getTagClass = (type: string) => {
  const base = "font-mono text-[11px] px-3 py-1 rounded-md font-medium border backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5"
  switch (type) {
    case 'blue': return `${base} bg-blue-500/10 text-blue-300 border-blue-500/20 hover:border-blue-400/50 hover:bg-blue-500/20 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]`
    case 'purple': return `${base} bg-purple-500/10 text-purple-300 border-purple-500/20 hover:border-purple-400/50 hover:bg-purple-500/20 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]`
    case 'amber': return `${base} bg-orange-500/10 text-orange-300 border-orange-500/20 hover:border-orange-400/50 hover:bg-orange-500/20 hover:shadow-[0_0_15px_rgba(249,115,22,0.3)]`
    case 'green':
    default: return `${base} bg-teal-500/10 text-teal-300 border-teal-500/20 hover:border-teal-400/50 hover:bg-teal-500/20 hover:shadow-[0_0_15px_rgba(45,212,191,0.3)]`
  }
}
</script>
