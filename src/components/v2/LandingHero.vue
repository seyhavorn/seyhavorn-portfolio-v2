<template>
  <section id="hero" class="relative min-h-screen flex items-center justify-center overflow-hidden pt-[72px]">

    <!-- Animated particles / orbs -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div class="hero-orb w-[600px] h-[600px] bg-teal-500/10 -top-40 -left-40" style="animation-delay: 0s"></div>
      <div class="hero-orb w-[500px] h-[500px] bg-purple-600/10 -bottom-40 -right-40" style="animation-delay: -7s"></div>
      <div class="hero-orb w-[350px] h-[350px] bg-blue-500/8 top-1/3 right-1/4" style="animation-delay: -14s"></div>
    </div>

    <!-- Grid background -->
    <div class="absolute inset-0 opacity-[0.03]"
      style="background-image: linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px); background-size: 60px 60px;">
    </div>

    <!-- Radial spotlight -->
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(45,212,191,0.08)_0%,_transparent_70%)]"></div>

    <div class="relative z-10 max-w-5xl mx-auto px-6 text-center">

      <!-- Micro-label -->
      <div class="hero-fade-up inline-flex items-center gap-2.5 px-5 py-2 bg-teal-500/10 border border-teal-500/20 rounded-full mb-8 backdrop-blur-sm">
        <span class="w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,1)] animate-[pulse_2s_infinite]"></span>
        <span class="font-mono text-[12px] text-teal-300 tracking-wider">Available for new opportunities</span>
      </div>

      <!-- Main headline -->
      <h1 class="hero-fade-up font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-tight text-white mb-6" style="animation-delay: 0.1s">
        Hi, I'm
        <span class="italic text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-blue-400 to-purple-400 animate-gradient-x">
          {{ info.firstName }}
        </span>
      </h1>

      <!-- Subtitle -->
      <p class="hero-fade-up text-lg sm:text-xl md:text-2xl text-[var(--text-secondary)] font-light max-w-2xl mx-auto mb-4 leading-relaxed" style="animation-delay: 0.2s">
        {{ info.title }}
      </p>

      <!-- Location pill -->
      <p class="hero-fade-up text-[14px] text-[var(--text-tertiary)] font-mono mb-10" style="animation-delay: 0.25s">
        <svg class="w-4 h-4 inline-block mr-1 -mt-0.5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
        {{ info.location }}
      </p>

      <!-- CTA Buttons -->
      <div class="hero-fade-up flex flex-wrap items-center justify-center gap-4" style="animation-delay: 0.35s">
        <a
          href="#projects"
          @click.prevent="scrollTo('projects')"
          class="group inline-flex items-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white text-[15px] font-semibold rounded-2xl shadow-[0_0_30px_rgba(45,212,191,0.3)] hover:shadow-[0_0_50px_rgba(45,212,191,0.5)] transition-all duration-400 hover:-translate-y-1"
        >
          View My Work
          <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
        </a>
        <a
          href="#contact"
          @click.prevent="scrollTo('contact')"
          class="inline-flex items-center gap-2.5 px-8 py-3.5 bg-white/[0.05] border border-white/15 hover:border-white/30 hover:bg-white/10 text-white text-[15px] font-semibold rounded-2xl backdrop-blur-sm transition-all duration-400 hover:-translate-y-1"
        >
          Get In Touch
        </a>
      </div>

      <!-- Tech stack ticker -->
      <div class="hero-fade-up mt-16 pt-10 border-t border-white/[0.06]" style="animation-delay: 0.5s">
        <p class="font-mono text-[10px] tracking-[5px] uppercase text-[var(--text-tertiary)] mb-5">Tech Stack</p>
        <div class="flex flex-wrap justify-center gap-3">
          <span
            v-for="(tech, i) in stack"
            :key="i"
            class="px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-[13px] text-[var(--text-secondary)] font-mono hover:border-teal-500/30 hover:text-teal-300 hover:bg-teal-500/5 transition-all duration-300 cursor-default"
          >
            {{ tech }}
          </span>
        </div>
      </div>

    </div>

    <!-- Scroll indicator -->
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[var(--text-tertiary)] animate-bounce">
      <span class="text-[10px] font-mono tracking-widest uppercase">Scroll</span>
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
    </div>
  </section>
</template>

<script setup lang="ts">
import { cvData } from '../../data/cv'

const info = cvData.personalInfo
const stack = cvData.stack

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<style scoped>
.hero-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  animation: hero-float 25s infinite alternate ease-in-out;
}

@keyframes hero-float {
  0% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(40px, -60px) scale(1.1); }
  50% { transform: translate(-30px, 30px) scale(0.95); }
  75% { transform: translate(20px, -20px) scale(1.05); }
  100% { transform: translate(0, 0) scale(1); }
}

.hero-fade-up {
  animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
