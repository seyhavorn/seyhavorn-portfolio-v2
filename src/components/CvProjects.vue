<template>
  <section class="mb-10">
    <div class="flex items-center gap-3 font-mono text-[11px] tracking-[4px] uppercase text-teal-400 mb-8 font-semibold pl-2">
      <span class="w-1.5 h-1.5 rounded-full bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.8)]"></span> Featured Projects
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
      <div 
        v-for="(project, index) in cvData.projects" 
        :key="index"
        class="glass-card p-6 md:p-8 relative group flex flex-col h-full"
      >
        <div class="flex justify-between items-start mb-4">
          <div class="font-mono text-[10px] text-teal-300 bg-teal-900/40 border border-teal-500/30 px-2.5 py-1 rounded-md font-medium shadow-[0_0_10px_rgba(45,212,191,0.1)]">
            {{ project.type }}
          </div>
          <a :href="project.link" target="_blank" class="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-teal-500/20 group-hover:border-teal-500/50 transition-all duration-300 text-[var(--text-secondary)] hover:text-teal-300">
            <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/></svg>
          </a>
        </div>
        
        <h3 class="text-[18px] font-bold text-white tracking-wide mb-3 group-hover:text-teal-400 transition-colors duration-300">{{ project.title }}</h3>
        
        <p class="text-[14px] leading-[1.7] text-[var(--text-secondary)] font-light flex-1 mb-6">
          {{ project.description }}
        </p>
        
        <div class="flex flex-wrap gap-2 mt-auto">
          <span 
            v-for="(tech, tIndex) in project.techStack" 
            :key="tIndex"
            class="font-mono text-[10.5px] px-2.5 py-1 bg-white/5 border border-white/10 rounded text-[var(--text-tertiary)] transition-colors duration-300 group-hover:border-teal-500/30 group-hover:text-teal-200"
          >
            {{ tech }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { cvData } from '../data/cv'
</script>
