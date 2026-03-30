<template>
  <section class="glass-card mb-10 overflow-visible relative group">
    <!-- Glowing Accent Border Left -->
    <div class="absolute left-0 top-0 bottom-0 w-[4px] bg-gradient-to-b from-teal-400 via-blue-500 to-purple-500 rounded-l-2xl opacity-80 group-hover:opacity-100 transition-opacity duration-500 shadow-[0_0_15px_rgba(45,212,191,0.5)]"></div>
    
    <div class="p-8 md:p-10 pl-10 md:pl-12">
      <div class="flex items-center gap-3 font-mono text-[11px] tracking-[4px] uppercase text-teal-400 mb-6 font-semibold">
        <span class="w-1.5 h-1.5 rounded-full bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.8)]"></span> Profile
      </div>
      <p class="text-[16px] md:text-[17px] leading-[1.9] text-[var(--text-primary)] font-light">
        {{ profile.summary }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { cvData } from '../data/cv'
const profile = cvData.profile
</script>
