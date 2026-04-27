<template>
  <section id="about" class="relative py-24 lg:py-32 overflow-hidden">
    <!-- Subtle atmospheric glow -->
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(45,212,191,0.03)_0%,_transparent_70%)]"></div>

    <div class="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">

      <!-- Header: Minimalist & Elegant -->
      <div class="flex flex-col gap-6 mb-16 max-w-3xl">
        <div class="flex items-center gap-3 font-mono text-[10px] tracking-[5px] uppercase text-teal-500/80 font-medium">
          <span class="w-1 h-1 rounded-full bg-teal-400"></span>
          About Me
        </div>
        <h2 class="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-[1.1] tracking-tight">
          Crafting <span class="text-gradient">Scalable</span> & <span class="text-gradient">Intelligent</span> Systems
        </h2>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <!-- Summary: Increased readability and refined typography -->
        <div class="lg:col-span-7">
          <p class="text-lg md:text-xl leading-relaxed text-[var(--text-secondary)] font-light mb-12">
            {{ profile.summary }}
          </p>

          <!-- Education & Languages: Integrated as a subtle list -->
          <div class="flex flex-wrap gap-3">
            <div class="glass-card px-4 py-2 flex items-center gap-3 transition-all duration-300 hover:bg-white/5 hover:border-teal-500/30">
              <div class="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center shrink-0">
                <svg class="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 14l9-5-9-5-9 5 9 5z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>
              </div>
              <div class="text-left">
                <p class="text-xs font-medium text-white">{{ education.degree }}</p>
                <p class="text-[10px] text-[var(--text-tertiary)] font-mono">{{ education.school }}</p>
              </div>
            </div>

            <div
              v-for="(lang, i) in languages"
              :key="i"
              class="glass-card px-4 py-2 flex items-center gap-3 transition-all duration-300 hover:bg-white/5 hover:border-blue-500/30"
            >
              <div class="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                <svg class="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/></svg>
              </div>
              <div class="text-left">
                <p class="text-xs font-medium text-white">{{ lang.name }}</p>
                <p class="text-[10px] text-[var(--text-tertiary)] font-mono capitalize">{{ lang.level }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats: Refined as a side-panel layout on large screens -->
        <div class="lg:col-span-5 grid grid-cols-2 gap-4">
          <div
            v-for="(stat, i) in stats"
            :key="i"
            class="glass-card p-6 transition-all duration-300 hover:border-teal-500/40 group"
          >
            <div class="text-3xl font-bold text-white group-hover:text-teal-400 transition-colors duration-300 mb-1">
              {{ stat.value }}
            </div>
            <div class="font-mono text-[10px] tracking-widest text-[var(--text-tertiary)] uppercase">
              {{ stat.label }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>


<script setup lang="ts">
import { cvData } from '../../data/cv'

const info = cvData.personalInfo
const profile = cvData.profile
const education = cvData.education
const languages = cvData.languages

const totalSkills = new Set(
  cvData.experiences.flatMap(e => e.jobs.flatMap(j => 'tags' in j ? j.tags.map((t: any) => t.name) : (j as any).techStack ?? []))
).size

const stats = [
  { value: info.experienceDuration, label: 'Experience' },
  { value: `${cvData.projects.length}+`, label: 'Projects' },
  { value: `${totalSkills}+`, label: 'Skills' },
  { value: `${cvData.certifications.length}`, label: 'Certs' },
]
</script>
