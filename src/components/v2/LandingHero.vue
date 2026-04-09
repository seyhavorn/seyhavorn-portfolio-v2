<template>
  <section id="hero" class="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-[72px]">

    <!-- Animated orbs -->
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

    <!-- Main two-column layout -->
    <div class="relative z-10 w-full max-w-6xl mx-auto px-6 flex-1 flex items-center">
      <div class="w-full grid lg:grid-cols-2 gap-10 lg:gap-16 items-center py-10">

        <!-- LEFT: Text content -->
        <div class="text-center lg:text-left">

          <!-- Availability badge -->
          <div class="hero-fade-up inline-flex items-center gap-2.5 px-5 py-2 bg-teal-500/10 border border-teal-500/20 rounded-full mb-8 backdrop-blur-sm">
            <span class="w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,1)] animate-[pulse_2s_infinite]"></span>
            <span class="font-mono text-[12px] text-teal-300 tracking-wider">Available for new opportunities</span>
          </div>

          <!-- Headline -->
          <h1 class="hero-fade-up font-serif text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.05] tracking-tight text-white mb-4" style="animation-delay: 0.1s">
            Hi, I'm
            <span class="italic text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-blue-400 to-purple-400 animate-gradient-x block sm:inline">
              {{ info.firstName }}
            </span>
          </h1>

          <!-- Title -->
          <p class="hero-fade-up text-lg sm:text-xl text-[var(--text-secondary)] font-light mb-3 leading-relaxed" style="animation-delay: 0.2s">
            {{ info.title }}
          </p>

          <!-- Location -->
          <p class="hero-fade-up text-[13px] text-[var(--text-tertiary)] font-mono mb-8 flex items-center gap-1.5 justify-center lg:justify-start" style="animation-delay: 0.25s">
            <svg class="w-3.5 h-3.5 text-teal-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            {{ info.location }}
          </p>

          <!-- Stats row -->
          <div class="hero-fade-up flex items-center justify-center lg:justify-start gap-6 mb-9" style="animation-delay: 0.3s">
            <div class="text-center lg:text-left">
              <p class="text-xl font-bold text-white leading-tight">{{ info.experienceDuration }}</p>
              <p class="text-[10px] font-mono text-[var(--text-tertiary)] tracking-wider uppercase mt-0.5">Experience</p>
            </div>
            <div class="w-px h-10 bg-white/10"></div>
            <div class="text-center lg:text-left">
              <p class="text-xl font-bold text-white leading-tight">{{ projects.length }}+</p>
              <p class="text-[10px] font-mono text-[var(--text-tertiary)] tracking-wider uppercase mt-0.5">Projects</p>
            </div>
            <div class="w-px h-10 bg-white/10"></div>
            <div class="text-center lg:text-left">
              <p class="text-xl font-bold text-white leading-tight">{{ stack.length }}+</p>
              <p class="text-[10px] font-mono text-[var(--text-tertiary)] tracking-wider uppercase mt-0.5">Technologies</p>
            </div>
          </div>

          <!-- CTAs + social icons -->
          <div class="hero-fade-up flex flex-wrap items-center justify-center lg:justify-start gap-3" style="animation-delay: 0.35s">
            <a
              href="#projects"
              @click.prevent="scrollTo('projects')"
              class="group inline-flex items-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white text-[14px] font-semibold rounded-2xl shadow-[0_0_30px_rgba(45,212,191,0.3)] hover:shadow-[0_0_50px_rgba(45,212,191,0.5)] transition-all duration-300 hover:-translate-y-1"
            >
              View My Work
              <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </a>
            <a
              href="#contact"
              @click.prevent="scrollTo('contact')"
              class="inline-flex items-center gap-2.5 px-7 py-3.5 bg-white/[0.05] border border-white/15 hover:border-white/30 hover:bg-white/10 text-white text-[14px] font-semibold rounded-2xl backdrop-blur-sm transition-all duration-300 hover:-translate-y-1"
            >
              Get In Touch
            </a>

            <!-- Social icon buttons -->
            <div class="flex items-center gap-2">
              <a
                :href="info.githubUrl" target="_blank" rel="noopener"
                class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[var(--text-secondary)] hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                aria-label="GitHub"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
              </a>
              <a
                :href="info.linkedinUrl" target="_blank" rel="noopener"
                class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[var(--text-secondary)] hover:text-[#0A66C2] hover:bg-[#0A66C2]/10 hover:border-[#0A66C2]/30 transition-all duration-300"
                aria-label="LinkedIn"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <!-- RIGHT: Profile photo -->
        <div class="hero-fade-up flex justify-center lg:justify-end order-first lg:order-last" style="animation-delay: 0.15s">
          <div class="relative">
            <!-- Soft glow behind photo -->
            <div class="absolute inset-0 bg-gradient-to-br from-teal-500/20 via-blue-500/20 to-purple-600/20 rounded-3xl blur-3xl scale-110"></div>

            <!-- Gradient border frame -->
            <div class="relative p-[2px] rounded-3xl bg-gradient-to-br from-teal-400 via-blue-500 to-purple-600">
              <div class="rounded-[22px] overflow-hidden bg-[#030712]">
                <img
                  :src="info.photoUrl"
                  :alt="`${info.firstName} ${info.lastName}`"
                  class="w-56 sm:w-64 lg:w-72 xl:w-80 aspect-[3/4] object-cover object-top"
                  loading="eager"
                />
              </div>
            </div>

            <!-- Floating badge: Spring Boot -->
            <div class="absolute -left-5 top-10 hidden sm:flex items-center gap-2 px-3 py-2 bg-[#0d1117]/90 border border-green-500/30 rounded-xl backdrop-blur-sm shadow-xl">
              <span class="w-2 h-2 rounded-full bg-green-400 shrink-0"></span>
              <span class="text-[11px] font-mono text-green-300 whitespace-nowrap">Spring Boot</span>
            </div>

            <!-- Floating badge: Vue.js -->
            <div class="absolute -right-5 top-1/3 hidden sm:flex items-center gap-2 px-3 py-2 bg-[#0d1117]/90 border border-teal-500/30 rounded-xl backdrop-blur-sm shadow-xl">
              <span class="w-2 h-2 rounded-full bg-teal-400 shrink-0"></span>
              <span class="text-[11px] font-mono text-teal-300 whitespace-nowrap">Vue.js</span>
            </div>

            <!-- Floating badge: AI / LLM -->
            <div class="absolute -left-4 bottom-14 hidden sm:flex items-center gap-2 px-3 py-2 bg-[#0d1117]/90 border border-purple-500/30 rounded-xl backdrop-blur-sm shadow-xl">
              <span class="w-2 h-2 rounded-full bg-purple-400 shrink-0"></span>
              <span class="text-[11px] font-mono text-purple-300 whitespace-nowrap">AI / LLM</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tech stack (full width, below grid) -->
    <div class="relative z-10 w-full max-w-6xl mx-auto px-6 pb-16">
      <div class="hero-fade-up pt-10 border-t border-white/[0.06]" style="animation-delay: 0.5s">
        <p class="font-mono text-[10px] tracking-[5px] uppercase text-[var(--text-tertiary)] mb-5 text-center">Tech Stack</p>
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
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
      </svg>
    </div>
  </section>
</template>

<script setup lang="ts">
import { cvData } from '../../data/cv'

const info = cvData.personalInfo
const stack = cvData.stack
const projects = cvData.projects

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<style scoped>
.hero-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  animation: hero-float 25s infinite alternate ease-in-out;
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;
}

@media (max-width: 768px) {
  .hero-orb {
    filter: blur(50px);
    opacity: 0.5;
    animation-duration: 40s;
  }
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
