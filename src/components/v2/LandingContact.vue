<template>
  <section id="contact" class="relative py-24 lg:py-32 overflow-hidden">
    <!-- BG accent -->
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(45,212,191,0.05)_0%,_transparent_50%)]"></div>

    <div class="relative z-10 max-w-4xl mx-auto px-6 lg:px-10">

      <!-- Section header -->
      <div class="text-center mb-14">
        <div class="inline-flex items-center gap-3 font-mono text-[11px] tracking-[4px] uppercase text-teal-400 mb-4 font-semibold">
          <span class="w-1.5 h-1.5 rounded-full bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.8)]"></span>
          Get In Touch
        </div>
        <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
          Let's <span class="text-gradient">Work Together</span>
        </h2>
        <p class="text-[16px] text-[var(--text-secondary)] font-light max-w-xl mx-auto leading-relaxed">
          Have a project in mind or just want to say hello? I'd love to hear from you. Let's build something amazing together.
        </p>
      </div>

      <!-- Contact cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
        <!-- Email -->
        <a
          :href="`mailto:${info.email}`"
          class="glass-card p-6 flex flex-col items-center text-center group hover:border-teal-500/40 hover:shadow-[0_0_30px_rgba(45,212,191,0.1)]"
        >
          <div class="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-teal-500/20 transition-all duration-300 shadow-[0_0_15px_rgba(45,212,191,0.08)]">
            <svg class="w-6 h-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          </div>
          <h3 class="text-[14px] font-semibold text-white mb-1 group-hover:text-teal-300 transition-colors duration-300">Email Me</h3>
          <p class="text-[12px] font-mono text-[var(--text-tertiary)] break-all">{{ info.email }}</p>
        </a>

        <!-- LinkedIn -->
        <a
          :href="info.linkedinUrl"
          target="_blank"
          class="glass-card p-6 flex flex-col items-center text-center group hover:border-blue-500/40 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]"
        >
          <div class="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-300 shadow-[0_0_15px_rgba(59,130,246,0.08)]">
            <svg class="w-6 h-6 text-blue-400 fill-current" viewBox="0 0 20 20">
              <path d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014V8h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.459zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm1.336 9.763H3.667V8h2.674v8.338zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z"/>
            </svg>
          </div>
          <h3 class="text-[14px] font-semibold text-white mb-1 group-hover:text-blue-300 transition-colors duration-300">LinkedIn</h3>
          <p class="text-[12px] font-mono text-[var(--text-tertiary)]">{{ info.linkedin }}</p>
        </a>

        <!-- GitHub -->
        <a
          :href="info.githubUrl"
          target="_blank"
          class="glass-card p-6 flex flex-col items-center text-center group hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.06)]"
        >
          <div class="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-300">
            <svg class="w-6 h-6 text-white/80 fill-current" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clip-rule="evenodd"/>
            </svg>
          </div>
          <h3 class="text-[14px] font-semibold text-white mb-1 group-hover:text-white transition-colors duration-300">GitHub</h3>
          <p class="text-[12px] font-mono text-[var(--text-tertiary)]">{{ info.github }}</p>
        </a>
      </div>

      <!-- Divider -->
      <div class="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-10"></div>

      <!-- Quick Hire CTA -->
      <div class="glass-card p-8 md:p-10 text-center relative overflow-hidden">
        <!-- Accent glow -->
        <div class="absolute -top-20 -right-20 w-60 h-60 bg-teal-500/8 rounded-full blur-[80px] pointer-events-none"></div>
        <div class="absolute -bottom-20 -left-20 w-60 h-60 bg-purple-500/8 rounded-full blur-[80px] pointer-events-none"></div>

        <div class="relative z-10">
          <h3 class="text-2xl md:text-3xl font-bold text-white mb-3">
            Ready to Start a Project?
          </h3>
          <p class="text-[15px] text-[var(--text-secondary)] font-light mb-8 max-w-lg mx-auto">
            I'm currently available for freelance work, full-time roles, or exciting collaborations. Let's bring your ideas to life.
          </p>
          <a
            :href="`mailto:${info.email}`"
            class="inline-flex items-center gap-2.5 px-10 py-4 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white text-[15px] font-bold rounded-2xl shadow-[0_0_35px_rgba(45,212,191,0.3)] hover:shadow-[0_0_50px_rgba(45,212,191,0.5)] transition-all duration-400 hover:-translate-y-1"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            Send Me an Email
          </a>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup lang="ts">
import { cvData } from '../../data/cv'
const info = cvData.personalInfo
</script>
