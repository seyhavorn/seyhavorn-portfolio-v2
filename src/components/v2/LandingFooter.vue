<template>
  <footer class="relative pt-12 pb-8 border-t border-white/[0.06]">
    <!-- Top gradient line -->
    <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-500/40 to-transparent"></div>

    <div class="max-w-7xl mx-auto px-6 lg:px-10">

      <!-- Main footer row -->
      <div class="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">

        <!-- Logo + tagline -->
        <div class="flex flex-col items-center md:items-start gap-2">
          <div class="flex items-center gap-2.5">
            <span class="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 via-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-[13px] shadow-[0_0_15px_rgba(45,212,191,0.2)]">
              SV
            </span>
            <span class="text-[15px] font-semibold text-white">
              Seyha<span class="text-teal-400"> VORN</span>
            </span>
          </div>
          <p class="text-[12px] text-[var(--text-tertiary)] font-mono max-w-[200px] text-center md:text-left leading-relaxed">
            Senior Engineer · Full Stack · AI
          </p>
        </div>

        <!-- Nav links -->
        <nav class="flex flex-wrap items-center justify-center gap-1">
          <a
            v-for="link in navLinks"
            :key="link.id"
            :href="`#${link.id}`"
            @click.prevent="scrollTo(link.id)"
            class="px-3 py-1.5 text-[12px] font-mono text-[var(--text-tertiary)] hover:text-teal-400 transition-colors duration-300 rounded-lg hover:bg-teal-500/5"
          >
            {{ link.label }}
          </a>
        </nav>

        <!-- Social + back-to-top -->
        <div class="flex items-center gap-2">
          <a
            :href="info.linkedinUrl"
            target="_blank"
            rel="noopener"
            class="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center hover:bg-blue-500/10 hover:border-blue-500/30 transition-all duration-300 group"
            aria-label="LinkedIn"
          >
            <svg class="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-blue-400 fill-current transition-colors duration-300" viewBox="0 0 20 20">
              <path d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014V8h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.459zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm1.336 9.763H3.667V8h2.674v8.338zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z"/>
            </svg>
          </a>
          <a
            :href="info.githubUrl"
            target="_blank"
            rel="noopener"
            class="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
            aria-label="GitHub"
          >
            <svg class="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-white fill-current transition-colors duration-300" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clip-rule="evenodd"/>
            </svg>
          </a>
          <a
            :href="`mailto:${info.email}`"
            class="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center hover:bg-teal-500/10 hover:border-teal-500/30 transition-all duration-300 group"
            aria-label="Email"
          >
            <svg class="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-teal-400 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          </a>

          <!-- Separator -->
          <div class="w-px h-6 bg-white/10 mx-1"></div>

          <!-- Back to top -->
          <button
            @click="scrollToTop"
            class="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center hover:bg-teal-500/10 hover:border-teal-500/30 transition-all duration-300 group"
            aria-label="Back to top"
          >
            <svg class="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-teal-400 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Bottom divider -->
      <div class="w-full h-px bg-white/[0.05] mb-6"></div>

      <!-- Copyright row -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-2">
        <p class="text-[11px] text-[var(--text-tertiary)] font-mono tracking-wider">
          © {{ new Date().getFullYear() }} Seyha Vorn. All rights reserved.
        </p>
        <p class="text-[11px] text-[var(--text-tertiary)]/60 font-mono tracking-wider">
          Built with Vue 3 · TypeScript · Tailwind CSS
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { cvData } from '../../data/cv'

const info = cvData.personalInfo

const navLinks = [
  { id: 'about',      label: 'About'      },
  { id: 'services',   label: 'Services'   },
  { id: 'skills',     label: 'Skills'     },
  { id: 'experience', label: 'Experience' },
  { id: 'projects',   label: 'Projects'   },
  { id: 'contact',    label: 'Contact'    },
]

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>
