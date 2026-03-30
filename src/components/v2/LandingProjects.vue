<template>
  <section id="projects" class="relative py-24 lg:py-32 overflow-hidden">
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(168,85,247,0.03)_0%,_transparent_50%)]"></div>

    <div class="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">

      <!-- Section header -->
      <div class="text-center mb-16">
        <div class="inline-flex items-center gap-3 font-mono text-[11px] tracking-[4px] uppercase text-purple-400 mb-4 font-semibold">
          <span class="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.8)]"></span>
          Featured Work
        </div>
        <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
          Recent <span class="text-gradient">Projects</span>
        </h2>
      </div>

      <!-- Projects grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <a
          v-for="(project, index) in cvData.projects"
          :key="index"
          :href="project.link"
          target="_blank"
          class="glass-card p-7 md:p-8 group relative hover:border-purple-500/30 hover:shadow-[0_0_35px_rgba(168,85,247,0.1)] block"
        >
          <!-- Top row: type badge + arrow -->
          <div class="flex items-center justify-between mb-6">
            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-[11px] font-mono text-purple-300 tracking-wide">
              <span class="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
              {{ project.type }}
            </span>
            <div class="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center group-hover:bg-purple-500/15 group-hover:border-purple-500/30 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300">
              <svg class="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-purple-400 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 17L17 7M17 7H7M17 7v10" /></svg>
            </div>
          </div>

          <!-- Title -->
          <h3 class="text-[20px] md:text-[22px] font-bold text-white mb-3 group-hover:text-purple-300 transition-colors duration-300 leading-snug">
            {{ project.title }}
          </h3>

          <!-- Description -->
          <p class="text-[14px] leading-[1.8] text-[var(--text-secondary)] font-light mb-6">
            {{ project.description }}
          </p>

          <!-- Tech stack pills -->
          <div class="flex flex-wrap gap-2 mt-auto">
            <span
              v-for="(tech, ti) in project.techStack"
              :key="ti"
              class="px-3 py-1 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[12px] font-mono text-[var(--text-tertiary)] group-hover:border-teal-500/25 group-hover:text-teal-300/80 transition-all duration-300"
            >
              {{ tech }}
            </span>
          </div>
        </a>
      </div>

    </div>
  </section>
</template>

<script setup lang="ts">
import { cvData } from '../../data/cv'
</script>
