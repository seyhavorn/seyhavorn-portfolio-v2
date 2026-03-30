<template>
  <section id="experience" class="relative py-24 lg:py-32 overflow-hidden">
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_left,_rgba(45,212,191,0.03)_0%,_transparent_50%)]"></div>

    <div class="relative z-10 max-w-5xl mx-auto px-6 lg:px-10">

      <!-- Section header -->
      <div class="text-center mb-16">
        <div class="inline-flex items-center gap-3 font-mono text-[11px] tracking-[4px] uppercase text-teal-400 mb-4 font-semibold">
          <span class="w-1.5 h-1.5 rounded-full bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.8)]"></span>
          Career Journey
        </div>
        <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
          Work <span class="text-gradient">Experience</span>
        </h2>
        <p class="mt-4 text-[15px] text-[var(--text-tertiary)] font-light">
          {{ exp.company }} · {{ exp.totalDuration }} · {{ exp.type }}
        </p>
      </div>

      <!-- Timeline -->
      <div class="relative">
        <!-- Timeline line -->
        <div class="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-teal-500/50 via-blue-500/30 to-purple-500/50 md:-translate-x-px"></div>

        <div
          v-for="(job, index) in exp.jobs"
          :key="index"
          :class="[
            'relative mb-12 last:mb-0 md:flex',
            index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
          ]"
        >
          <!-- Timeline dot -->
          <div class="absolute left-6 md:left-1/2 top-8 -translate-x-1/2 z-20">
            <div class="w-4 h-4 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 shadow-[0_0_15px_rgba(45,212,191,0.5)] ring-4 ring-[var(--bg)]"></div>
          </div>

          <!-- Empty spacer for alternating layout -->
          <div class="hidden md:block md:w-1/2"></div>

          <!-- Card -->
          <div :class="['ml-14 md:ml-0 md:w-1/2', index % 2 === 0 ? 'md:pr-12' : 'md:pl-12']">
            <div class="glass-card p-6 md:p-8 group hover:border-teal-500/30 hover:shadow-[0_0_35px_rgba(45,212,191,0.08)]">

              <!-- Period badge -->
              <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-500/10 border border-teal-500/20 rounded-full mb-4">
                <svg class="w-3.5 h-3.5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <span class="font-mono text-[11px] text-teal-300 tracking-wide">{{ job.period }}</span>
              </div>

              <h3 class="text-[20px] font-bold text-white mb-2 group-hover:text-teal-300 transition-colors duration-300 tracking-wide">
                {{ job.title }}
              </h3>

              <p class="text-[12px] font-mono text-[var(--text-tertiary)] mb-4 flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                {{ job.location }}
              </p>

              <p class="text-[14px] leading-[1.8] text-[var(--text-secondary)] font-light mb-5">
                {{ job.description }}
              </p>

              <!-- Tags -->
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="(tag, ti) in job.tags"
                  :key="ti"
                  :class="tagClass(tag.type)"
                >
                  {{ tag.name }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup lang="ts">
import { cvData } from '../../data/cv'

const exp = cvData.experience

function tagClass(type: string): string {
  const base = 'px-2.5 py-1 rounded-md text-[11px] font-mono tracking-wide border'
  const map: Record<string, string> = {
    green: `${base} bg-emerald-500/10 border-emerald-500/20 text-emerald-400`,
    blue: `${base} bg-blue-500/10 border-blue-500/20 text-blue-400`,
    amber: `${base} bg-amber-500/10 border-amber-500/20 text-amber-400`,
    purple: `${base} bg-purple-500/10 border-purple-500/20 text-purple-400`,
  }
  return map[type] || `${base} bg-white/5 border-white/10 text-white/70`
}
</script>
