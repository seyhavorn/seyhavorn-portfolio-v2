<template>
  <section id="services" class="relative py-24 lg:py-32 overflow-hidden">
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_right,_rgba(168,85,247,0.04)_0%,_transparent_50%)]"></div>

    <div class="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">

      <!-- Section header -->
      <div class="text-center mb-16">
        <div class="inline-flex items-center gap-3 font-mono text-[11px] tracking-[4px] uppercase text-purple-400 mb-4 font-semibold">
          <span class="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.8)]"></span>
          What I Do
        </div>
        <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
          Services & <span class="text-gradient">Expertise</span>
        </h2>
        <p class="mt-4 text-[var(--text-secondary)] text-[15px] font-light max-w-xl mx-auto leading-relaxed">
          End-to-end engineering capabilities — from intelligent backends to polished frontends.
        </p>
      </div>

      <!-- Cards grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="(service, index) in services"
          :key="index"
          class="service-card group"
          :style="{
            '--c-accent': service.color.accent,
            '--c-soft': service.color.soft,
            '--c-border': service.color.border,
            '--c-glow': service.color.glow,
          }"
        >
          <!-- Ghost number watermark -->
          <div class="absolute top-5 right-6 font-mono text-[56px] font-bold leading-none select-none pointer-events-none text-white/[0.025] group-hover:text-white/[0.05] transition-all duration-500">
            {{ String(index + 1).padStart(2, '0') }}
          </div>

          <!-- Icon -->
          <div class="service-icon-wrap mb-6 group-hover:scale-110 transition-transform duration-400">
            <svg v-if="service.icon === 'server'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>
            <svg v-else-if="service.icon === 'code'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
            <svg v-else-if="service.icon === 'database'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
            <svg v-else-if="service.icon === 'cpu'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 3H7a2 2 0 00-2 2v2M9 3h6M9 3v2m6-2h2a2 2 0 012 2v2M15 3v2M3 9v6M3 9h2m16 0h-2m2 0v6m0 0h-2M3 15h2m14 6H7a2 2 0 01-2-2v-2m14 4h2a2 2 0 002-2v-2m-2 4v-2M9 21v-2m6 2v-2M9 9h6v6H9z" /></svg>
            <svg v-else-if="service.icon === 'cloud'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
          </div>

          <h3 class="service-title text-[18px] font-bold text-white mb-3 tracking-wide leading-snug">
            {{ service.title }}
          </h3>
          <p class="text-[14px] leading-[1.85] text-[var(--text-secondary)] font-light">
            {{ service.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { cvData } from '../../data/cv'

const colorMap: Record<string, { accent: string; soft: string; border: string; glow: string }> = {
  server:   { accent: '#2dd4bf', soft: 'rgba(45,212,191,0.08)',  border: 'rgba(45,212,191,0.3)',  glow: 'rgba(45,212,191,0.12)'  },
  cpu:      { accent: '#a855f7', soft: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.3)', glow: 'rgba(168,85,247,0.12)' },
  code:     { accent: '#3b82f6', soft: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.3)', glow: 'rgba(59,130,246,0.12)' },
  cloud:    { accent: '#38bdf8', soft: 'rgba(56,189,248,0.08)', border: 'rgba(56,189,248,0.3)', glow: 'rgba(56,189,248,0.12)' },
  database: { accent: '#22c55e', soft: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.3)',  glow: 'rgba(34,197,94,0.12)'  },
}

const services = cvData.services.map(s => ({
  ...s,
  color: colorMap[s.icon] ?? colorMap.server,
}))
</script>

<style scoped>
.service-card {
  position: relative;
  overflow: hidden;
  border-radius: 1rem;
  background: rgba(17, 24, 39, 0.5);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(148, 163, 184, 0.1);
  padding: 1.75rem 2rem;
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Top gradient line — slides in on hover */
.service-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--c-accent), transparent);
  opacity: 0;
  transition: opacity 0.4s ease;
}
.service-card:hover::before { opacity: 1; }

/* Inner shimmer */
.service-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.5s ease;
  pointer-events: none;
}
.service-card:hover::after { opacity: 1; }

.service-card:hover {
  border-color: var(--c-border);
  box-shadow: 0 0 40px var(--c-glow), 0 12px 40px rgba(0,0,0,0.3);
  transform: translateY(-4px);
}

.service-icon-wrap {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 0.875rem;
  background: var(--c-soft);
  border: 1px solid var(--c-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-accent);
  box-shadow: 0 0 20px var(--c-soft);
  transition: all 0.4s ease;
}
.service-card:hover .service-icon-wrap {
  background: color-mix(in srgb, var(--c-accent) 15%, transparent);
  box-shadow: 0 0 30px var(--c-glow);
}

.service-title {
  transition: color 0.3s ease;
}
.service-card:hover .service-title {
  color: var(--c-accent);
}
</style>
