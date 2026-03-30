<template>
  <header class="relative glass-card mb-10 overflow-hidden group">

    <!-- Top gradient bar -->
    <div class="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-teal-400 via-blue-500 to-purple-600 animate-gradient-x opacity-90 z-20"></div>

    <!-- Subtle grid pattern overlay -->
    <div class="absolute inset-0 z-0 opacity-[0.03]"
      style="background-image: linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px); background-size: 40px 40px;">
    </div>

    <!-- Glow orbs -->
    <div class="absolute -top-24 -left-24 w-72 h-72 bg-teal-500/10 rounded-full blur-[80px] pointer-events-none z-0 group-hover:bg-teal-500/20 transition-all duration-700"></div>
    <div class="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-600/10 rounded-full blur-[80px] pointer-events-none z-0 group-hover:bg-purple-600/20 transition-all duration-700"></div>

    <!-- Main content -->
    <div class="relative z-10 flex flex-col md:flex-row items-center md:items-center gap-10 px-8 md:px-12 py-10 md:py-12">

      <!-- === Photo === -->
      <div class="shrink-0 relative">
        <!-- Rotating gradient ring -->
        <div class="absolute inset-0 rounded-full p-[3px] bg-gradient-to-br from-teal-400 via-blue-500 to-purple-600 animate-spin-slow z-0"></div>
        <!-- Static ring background -->
        <div class="relative w-36 h-36 md:w-44 md:h-44 rounded-full p-[3px] bg-gradient-to-br from-teal-400 via-blue-500 to-purple-600 shadow-[0_0_40px_rgba(45,212,191,0.4)] z-10 group-hover:shadow-[0_0_60px_rgba(45,212,191,0.6)] transition-all duration-600">
          <div class="w-full h-full rounded-full overflow-hidden bg-[var(--bg)] border-2 border-[var(--bg)]">
            <img
              :src="info.photoUrl"
              :alt="`${info.firstName} ${info.lastName}`"
              class="w-full h-full object-cover object-center scale-110 group-hover:scale-100 transition-transform duration-700"
            />
          </div>
        </div>
        <!-- Online badge -->
        <div class="absolute bottom-1 right-1 z-20 flex items-center gap-1.5 bg-[#030712]/80 backdrop-blur-sm border border-teal-500/40 rounded-full px-2.5 py-1 shadow-lg">
          <span class="w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_6px_rgba(45,212,191,1)] animate-[pulse_2s_infinite]"></span>
          <span class="font-mono text-[10px] text-teal-300 tracking-wider">Open to work</span>
        </div>
      </div>

      <!-- === Name + Title + Info === -->
      <div class="flex-1 flex flex-col items-center md:items-start gap-4 text-center md:text-left min-w-0">

        <!-- Name -->
        <div>
          <div class="font-mono text-[11px] tracking-[4px] uppercase text-teal-500/70 mb-2">
            — Full Stack Engineer —
          </div>
          <h1 class="font-serif text-5xl md:text-[58px] lg:text-[64px] font-bold leading-[1.05] tracking-tight text-white drop-shadow-lg">
            {{ info.firstName }}
            <span class="italic text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-blue-400 to-purple-400 animate-gradient-x">
              {{ info.lastName }}
            </span>
          </h1>
        </div>

        <!-- Title pill -->
        <div class="flex flex-wrap justify-center md:justify-start gap-2.5">
          <span class="inline-flex items-center gap-2 px-4 py-1.5 bg-teal-500/10 border border-teal-500/30 rounded-full font-mono text-[12px] text-teal-300 tracking-wide backdrop-blur-sm shadow-[0_0_15px_rgba(45,212,191,0.1)]">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
            {{ info.title }}
          </span>
          <span class="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-full font-mono text-[12px] text-purple-300 tracking-wide backdrop-blur-sm">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            {{ info.experienceDuration }}
          </span>
          <span class="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-full font-mono text-[12px] text-blue-300 tracking-wide backdrop-blur-sm">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            {{ info.location }}
          </span>
        </div>

        <!-- Divider -->
        <div class="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-1"></div>

        <!-- Contact links row -->
        <div class="flex flex-wrap justify-center md:justify-start gap-3">

          <!-- Email -->
          <a :href="`mailto:${info.email}`"
            class="group/link flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 hover:border-teal-400/50 hover:bg-teal-500/10 transition-all duration-300 hover:shadow-[0_0_20px_rgba(45,212,191,0.15)] hover:-translate-y-0.5">
            <span class="w-7 h-7 rounded-lg bg-teal-500/10 flex items-center justify-center shrink-0 group-hover/link:bg-teal-500/20 transition-all duration-300">
              <svg class="w-3.5 h-3.5 text-teal-400 fill-current" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
              </svg>
            </span>
            <span class="text-[13px] text-[var(--text-secondary)] group-hover/link:text-teal-300 transition-colors duration-300 font-mono">{{ info.email }}</span>
          </a>

          <!-- LinkedIn -->
          <a :href="info.linkedinUrl" target="_blank"
            class="group/link flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 hover:border-blue-400/50 hover:bg-blue-500/10 transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:-translate-y-0.5">
            <span class="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 group-hover/link:bg-blue-500/20 transition-all duration-300">
              <svg class="w-3.5 h-3.5 text-blue-400 fill-current" viewBox="0 0 20 20">
                <path d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014V8h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.459zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm1.336 9.763H3.667V8h2.674v8.338zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z"/>
              </svg>
            </span>
            <span class="text-[13px] text-[var(--text-secondary)] group-hover/link:text-blue-300 transition-colors duration-300 font-mono">{{ info.linkedin }}</span>
          </a>

          <!-- GitHub -->
          <a :href="info.githubUrl" target="_blank"
            class="group/link flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/40 hover:bg-white/10 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:-translate-y-0.5">
            <span class="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0 group-hover/link:bg-white/10 transition-all duration-300">
              <svg class="w-3.5 h-3.5 text-white/80 fill-current" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clip-rule="evenodd"/>
              </svg>
            </span>
            <span class="text-[13px] text-[var(--text-secondary)] group-hover/link:text-white transition-colors duration-300 font-mono">{{ info.github }}</span>
          </a>

        </div>
      </div>
    </div>

    <!-- Bottom shimmer line -->
    <div class="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-teal-500/20 to-transparent"></div>
  </header>
</template>

<script setup lang="ts">
import { cvData } from '../data/cv'
const info = cvData.personalInfo
</script>