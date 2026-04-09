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
        <p class="mt-4 text-[var(--text-secondary)] text-[15px] font-light max-w-xl mx-auto leading-relaxed">
          A selection of production systems I've built and shipped.
        </p>
      </div>

      <!-- Featured project (first) -->
      <a
        v-if="projects[0]"
        :href="projects[0].link"
        target="_blank"
        rel="noopener"
        class="featured-card group block mb-6 relative rounded-2xl p-[1px] bg-gradient-to-br from-purple-500/30 via-blue-500/10 to-transparent hover:from-purple-500/50 hover:via-blue-500/25 transition-all duration-500"
      >
        <div class="relative rounded-[15px] bg-[rgba(17,24,39,0.85)] backdrop-blur-xl overflow-hidden">
          <!-- Top gradient line -->
          <div class="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-400"></div>

          <div class="p-7 md:p-10 flex flex-col md:flex-row gap-8 md:gap-12 md:items-center">
            <!-- Left: content -->
            <div class="flex-1 min-w-0">
              <!-- Badge row -->
              <div class="flex items-center gap-3 mb-5">
                <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/15 border border-purple-500/30 rounded-full text-[10px] font-mono text-purple-300 tracking-wider font-semibold uppercase">
                  Featured
                </span>
                <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-white/[0.04] border border-white/[0.08] rounded-full text-[11px] font-mono text-[var(--text-tertiary)] tracking-wide">
                  {{ projects[0].type }}
                </span>
              </div>

              <h3 class="text-[22px] md:text-[28px] font-bold text-white mb-3 group-hover:text-purple-300 transition-colors duration-300 leading-snug">
                {{ projects[0].title }}
              </h3>
              <p class="text-[14px] md:text-[15px] leading-[1.85] text-[var(--text-secondary)] font-light mb-6 max-w-2xl">
                {{ projects[0].description }}
              </p>

              <div class="flex flex-wrap gap-2">
                <span
                  v-for="(tech, ti) in projects[0].techStack"
                  :key="ti"
                  class="px-3 py-1 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[12px] font-mono text-[var(--text-tertiary)] group-hover:border-purple-500/25 group-hover:text-purple-300/80 transition-all duration-300"
                >
                  {{ tech }}
                </span>
              </div>
            </div>

            <!-- Right: arrow indicator -->
            <div class="shrink-0 self-center">
              <div class="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center group-hover:bg-purple-500/20 group-hover:border-purple-500/40 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-400 shadow-[0_0_20px_rgba(168,85,247,0.08)] group-hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                <svg class="w-6 h-6 text-[var(--text-tertiary)] group-hover:text-purple-400 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 17L17 7M17 7H7M17 7v10"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </a>

      <!-- Remaining projects grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <a
          v-for="(project, index) in projects.slice(1)"
          :key="index"
          :href="project.link"
          target="_blank"
          rel="noopener"
          class="glass-card p-7 md:p-8 group relative hover:border-purple-500/30 hover:shadow-[0_0_35px_rgba(168,85,247,0.1)] block"
        >
          <!-- Top accent line on hover -->
          <div class="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-400 rounded-t-2xl"></div>

          <!-- Top row: badge + index + arrow -->
          <div class="flex items-start justify-between mb-5">
            <div class="flex items-center gap-2.5">
              <span class="font-mono text-[11px] font-bold text-[var(--text-tertiary)]/50 tracking-wider">
                {{ String(index + 2).padStart(2, '0') }}
              </span>
              <span class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-[11px] font-mono text-purple-300 tracking-wide">
                <span class="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                {{ project.type }}
              </span>
            </div>
            <div class="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center group-hover:bg-purple-500/15 group-hover:border-purple-500/30 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300 shrink-0">
              <svg class="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-purple-400 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 17L17 7M17 7H7M17 7v10"/>
              </svg>
            </div>
          </div>

          <h3 class="text-[19px] md:text-[21px] font-bold text-white mb-3 group-hover:text-purple-300 transition-colors duration-300 leading-snug">
            {{ project.title }}
          </h3>

          <p class="text-[14px] leading-[1.8] text-[var(--text-secondary)] font-light mb-6 line-clamp-3">
            {{ project.description }}
          </p>

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

const projects = cvData.projects
</script>
