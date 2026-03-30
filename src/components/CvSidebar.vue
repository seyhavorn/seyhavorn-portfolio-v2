<template>
  <aside class="space-y-6">

    <!-- Categorized Technical Skills -->
    <div class="glass-card px-6 py-8">
      <div class="flex items-center gap-3 font-mono text-[11px] tracking-[4px] uppercase text-teal-400 mb-6 font-semibold">
        <span class="w-1.5 h-1.5 rounded-full bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.8)]"></span> Technical Skills
      </div>

      <div class="space-y-7 relative z-10">
        <div v-for="(cat, ci) in cvData.skillCategories" :key="ci">
          <!-- Category Label -->
          <div class="flex items-center gap-2 mb-3">
            <span class="text-[10px] font-mono tracking-[3px] uppercase text-teal-500/60">{{ cat.label }}</span>
            <div class="flex-1 h-px bg-white/5"></div>
          </div>
          <!-- Skill Bars -->
          <div class="space-y-4">
            <div
              v-for="(skill, si) in cat.skills"
              :key="si"
              class="group"
            >
              <div class="flex justify-between items-center mb-1.5">
                <span class="text-[13px] text-white/80 group-hover:text-teal-300 transition-colors duration-300">{{ skill.name }}</span>
                <span class="font-mono text-[10px] text-teal-500/60">{{ skill.percentage }}%</span>
              </div>
              <div class="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
                <div
                  class="absolute left-0 top-0 bottom-0 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 opacity-80 group-hover:opacity-100 group-hover:shadow-[0_0_10px_rgba(45,212,191,0.6)] transition-all duration-700 ease-out"
                  :style="{ width: skill.percentage + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Current Stack -->
    <div class="glass-card px-6 py-8">
      <div class="flex items-center gap-3 font-mono text-[11px] tracking-[4px] uppercase text-teal-400 mb-6 font-semibold">
        <span class="w-1.5 h-1.5 rounded-full bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.8)]"></span> Current Stack
      </div>
      <div class="flex flex-wrap gap-2.5 relative z-10">
        <span
          v-for="(tech, index) in cvData.stack"
          :key="index"
          class="font-mono text-[12px] px-3 py-1.5 bg-white-[0.02] border border-white/10 rounded-lg text-[var(--text-secondary)] transition-all duration-300 hover:border-teal-400/50 hover:text-white hover:bg-teal-500/10 hover:shadow-[0_0_15px_rgba(45,212,191,0.2)] hover:-translate-y-0.5 cursor-default"
        >
          {{ tech }}
        </span>
      </div>
    </div>

    <!-- Certifications -->
    <div class="glass-card px-6 py-8">
      <div class="flex items-center gap-3 font-mono text-[11px] tracking-[4px] uppercase text-teal-400 mb-6 font-semibold">
        <span class="w-1.5 h-1.5 rounded-full bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.8)]"></span> Certifications
      </div>
      <div class="space-y-4 relative z-10">
        <div
          v-for="(cert, index) in cvData.certifications"
          :key="index"
          class="group flex items-start gap-3 p-3 rounded-xl border border-white/5 hover:border-teal-400/30 hover:bg-teal-500/5 transition-all duration-300"
        >
          <span class="mt-0.5 text-teal-400 text-[18px] leading-none">🏅</span>
          <div>
            <div class="text-[13px] font-semibold text-white/90 group-hover:text-teal-300 transition-colors duration-300">{{ cert.title }}</div>
            <div class="text-[11px] text-[var(--text-secondary)] mt-0.5">{{ cert.issuer }}</div>
            <div class="font-mono text-[10px] text-teal-500/50 mt-0.5">{{ cert.year }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Education -->
    <div class="glass-card px-6 py-8">
      <div class="flex items-center gap-3 font-mono text-[11px] tracking-[4px] uppercase text-teal-400 mb-6 font-semibold">
        <span class="w-1.5 h-1.5 rounded-full bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.8)]"></span> Education
      </div>
      <div class="relative z-10 group">
        <div class="text-[16px] font-bold text-white tracking-wide group-hover:text-teal-300 transition-colors duration-300">{{ cvData.education.degree }}</div>
        <div class="text-[14px] text-[var(--text-secondary)] mt-1.5">{{ cvData.education.school }}</div>
        <div class="font-mono text-[12px] text-teal-500/60 mt-2">{{ cvData.education.year }}</div>
      </div>
    </div>

    <!-- Languages -->
    <div class="glass-card px-6 py-8">
      <div class="flex items-center gap-3 font-mono text-[11px] tracking-[4px] uppercase text-teal-400 mb-6 font-semibold">
        <span class="w-1.5 h-1.5 rounded-full bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.8)]"></span> Languages
      </div>
      <div class="space-y-4 relative z-10">
        <div
          v-for="(lang, index) in cvData.languages"
          :key="index"
          class="flex justify-between items-center text-[14.5px] text-[var(--text-secondary)] group"
        >
          <span class="group-hover:text-white transition-colors duration-300">{{ lang.name }}</span>
          <span class="font-mono text-[11px] text-teal-300 bg-teal-500/10 border border-teal-500/20 px-3 py-1 rounded-full font-medium transition-all duration-300 group-hover:bg-teal-500/20 group-hover:shadow-[0_0_10px_rgba(45,212,191,0.3)]">{{ lang.level }}</span>
        </div>
      </div>
    </div>

  </aside>
</template>

<script setup lang="ts">
import { cvData } from '../data/cv'
</script>
