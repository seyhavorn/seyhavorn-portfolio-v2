<template>
  <section id="about" class="relative py-24 lg:py-32 overflow-hidden">
    <!-- Section bg accent -->
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_left,_rgba(45,212,191,0.04)_0%,_transparent_50%)]"></div>

    <div class="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">

      <!-- Section header -->
      <div class="flex items-center gap-3 font-mono text-[11px] tracking-[4px] uppercase text-teal-400 mb-4 font-semibold">
        <span class="w-1.5 h-1.5 rounded-full bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.8)]"></span>
        About Me
      </div>
      <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-16 leading-tight">
        Crafting <span class="text-gradient">Scalable</span> & <span class="text-gradient">Intelligent</span> Systems
      </h2>

      <div class="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 lg:gap-16 items-center">

        <!-- Left: Text content -->
        <div>
          <p class="text-[16px] md:text-[17px] leading-[1.9] text-[var(--text-secondary)] font-light mb-8">
            {{ profile.summary }}
          </p>

          <!-- Quick stats -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            <div
              v-for="(stat, i) in stats"
              :key="i"
              class="glass-card p-5 text-center group hover:border-teal-500/40"
            >
              <div class="text-2xl md:text-3xl font-bold text-gradient mb-1 group-hover:scale-110 transition-transform duration-300">
                {{ stat.value }}
              </div>
              <div class="font-mono text-[11px] tracking-wider text-[var(--text-tertiary)] uppercase">
                {{ stat.label }}
              </div>
            </div>
          </div>

          <!-- Education + Languages -->
          <div class="flex flex-wrap gap-4">
            <div class="glass-card px-5 py-4 flex items-center gap-3 group hover:border-purple-500/40">
              <div class="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                <svg class="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 14l9-5-9-5-9 5 9 5z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>
              </div>
              <div>
                <p class="text-[13px] font-semibold text-white">{{ education.degree }}</p>
                <p class="text-[12px] text-[var(--text-tertiary)] font-mono">{{ education.school }} · {{ education.year }}</p>
              </div>
            </div>

            <div
              v-for="(lang, i) in languages"
              :key="i"
              class="glass-card px-5 py-4 flex items-center gap-3 group hover:border-blue-500/40"
            >
              <div class="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <svg class="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/></svg>
              </div>
              <div>
                <p class="text-[13px] font-semibold text-white">{{ lang.name }}</p>
                <p class="text-[12px] text-[var(--text-tertiary)] font-mono capitalize">{{ lang.level }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Photo card -->
        <div class="relative mx-auto lg:mx-0">
          <div class="relative group">
            <!-- Glowing border card -->
            <div class="absolute -inset-[2px] bg-gradient-to-br from-teal-400 via-blue-500 to-purple-600 rounded-3xl opacity-60 group-hover:opacity-100 blur-sm transition-all duration-500"></div>
            <div class="relative bg-[var(--bg)] rounded-3xl p-[3px]">
              <img
                :src="info.photoUrl"
                :alt="`${info.firstName} ${info.lastName}`"
                loading="lazy"
                width="380"
                height="507"
                class="w-full max-w-[380px] aspect-[3/4] object-cover object-center rounded-[21px] grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
              />
            </div>
            <!-- Floating badge -->
            <div class="absolute -bottom-4 -right-4 glass-card px-4 py-3 flex items-center gap-2 shadow-2xl border-teal-500/30">
              <span class="w-3 h-3 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.8)]"></span>
              <span class="font-mono text-[12px] text-teal-300 tracking-wide">{{ info.experienceDuration }} exp</span>
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
  cvData.experiences.flatMap(e => e.jobs.flatMap(j => j.tags.map(t => t.name)))
).size

const stats = [
  { value: info.experienceDuration, label: 'Experience' },
  { value: `${cvData.projects.length}+`, label: 'Projects' },
  { value: `${totalSkills}+`, label: 'Skills' },
  { value: `${cvData.certifications.length}`, label: 'Certs' },
]
</script>
