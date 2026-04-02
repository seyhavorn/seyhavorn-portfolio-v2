<template>
  <section id="experience" class="relative py-24 lg:py-32 overflow-hidden">
    <!-- Background ambient effects -->
    <div class="exp-bg-glow exp-bg-glow--1"></div>
    <div class="exp-bg-glow exp-bg-glow--2"></div>

    <div class="relative z-10 max-w-6xl mx-auto px-6 lg:px-10">

      <!-- Section header -->
      <div class="text-center mb-20">
        <div class="inline-flex items-center gap-3 font-mono text-[11px] tracking-[4px] uppercase text-teal-400 mb-4 font-semibold">
          <span class="w-1.5 h-1.5 rounded-full bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.8)]"></span>
          Career Journey
        </div>
        <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
          Work <span class="text-gradient">Experience</span>
        </h2>
        <p class="max-w-xl mx-auto text-[var(--text-tertiary)] text-[15px] leading-relaxed">
          A progressive career path from intern to senior engineer, building scalable systems and leading teams.
        </p>
      </div>

      <!-- Company sections -->
      <div
        v-for="(exp, cIndex) in experiences"
        :key="cIndex"
        :class="['relative', cIndex > 0 ? 'mt-24' : '']"
      >

        <!-- Company hero card -->
        <div class="exp-company-card">
          <div class="exp-company-card__inner">
            <div class="flex flex-col md:flex-row items-center gap-6">
              <!-- Company icon -->
              <div class="exp-company-icon">
                <svg class="w-7 h-7 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              <!-- Company info -->
              <div class="flex-1 text-center md:text-left">
                <h3 class="text-xl md:text-2xl font-bold text-white mb-2">{{ exp.company }}</h3>
                <div class="flex flex-wrap items-center justify-center md:justify-start gap-3 text-[13px] text-[var(--text-tertiary)] font-mono">
                  <span class="exp-meta-pill">
                    <svg class="w-3.5 h-3.5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    {{ exp.totalDuration }}
                  </span>
                  <span class="exp-meta-pill">
                    <svg class="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    {{ exp.location }}
                  </span>
                  <span class="exp-type-badge">
                    {{ exp.type }}
                  </span>
                </div>
              </div>
              <!-- Roles stats -->
              <div class="exp-roles-stat">
                <span class="text-3xl font-bold text-teal-400 font-mono leading-none">{{ exp.jobs.length }}</span>
                <span class="text-[10px] font-mono text-[var(--text-tertiary)] tracking-[3px] uppercase mt-1">Roles</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Timeline -->
        <div class="relative mt-8">
          <!-- Vertical timeline track -->
          <div class="exp-timeline-track">
            <div class="exp-timeline-track__fill"></div>
          </div>

          <!-- Job cards -->
          <div
            v-for="(job, index) in exp.jobs"
            :key="index"
            :class="[
              'exp-timeline-item',
              index % 2 === 0 ? 'exp-timeline-item--left' : 'exp-timeline-item--right'
            ]"
            :style="{ animationDelay: `${0.3 + index * 0.2}s` }"
          >
            <!-- Timeline node -->
            <div class="exp-timeline-node">
              <!-- Pulse animation for current role -->
              <div v-if="index === 0" class="exp-timeline-node__pulse"></div>
              <div :class="[
                'exp-timeline-node__dot',
                index === 0 ? 'exp-timeline-node__dot--active' : 'exp-timeline-node__dot--past'
              ]">
                <div class="exp-timeline-node__inner" v-if="index !== 0"></div>
              </div>
            </div>

            <!-- Empty spacer for alternating -->
            <div class="hidden md:block md:w-1/2"></div>

            <!-- Job Card -->
            <div :class="['exp-card-wrapper', index % 2 === 0 ? 'md:pr-12' : 'md:pl-12']">
              <div :class="[
                'exp-job-card group',
                index === 0 ? 'exp-job-card--current' : 'exp-job-card--past'
              ]">

                <!-- Current role ribbon -->
                <div v-if="index === 0" class="exp-current-ribbon">
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  Current
                </div>

                <!-- Step number -->
                <div class="exp-step-number">
                  <span :class="[
                    'exp-step-badge',
                    index === 0 ? 'exp-step-badge--active' : ''
                  ]">
                    {{ String(index + 1).padStart(2, '0') }}
                  </span>
                </div>

                <!-- Card content -->
                <div class="exp-card-content">
                  <!-- Period -->
                  <div class="exp-period" :class="index === 0 ? 'exp-period--active' : ''">
                    <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    <span>{{ job.period }}</span>
                  </div>

                  <!-- Title -->
                  <h3 :class="[
                    'exp-job-title',
                    index === 0 ? 'exp-job-title--active' : ''
                  ]">
                    {{ job.title }}
                  </h3>

                  <!-- Location -->
                  <p class="exp-job-location">
                    <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    {{ job.location }}
                  </p>

                  <!-- Description -->
                  <p class="exp-job-description">
                    {{ job.description }}
                  </p>

                  <!-- Responsibilities (if present) -->
                  <ul v-if="'responsibilities' in job && job.responsibilities" class="exp-responsibilities">
                    <li v-for="(item, ri) in job.responsibilities" :key="ri">
                      {{ item }}
                    </li>
                  </ul>

                  <!-- Achievements (if present) -->
                  <div v-if="'achievements' in job && job.achievements" class="exp-achievements">
                    <div class="exp-achievements__header">
                      <svg class="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>
                      <span>Key Achievements</span>
                    </div>
                    <ul class="exp-achievements__list">
                      <li v-for="(item, ai) in job.achievements" :key="ai">
                        {{ item }}
                      </li>
                    </ul>
                  </div>

                  <!-- Tags (original format) -->
                  <div v-if="'tags' in job && job.tags" class="exp-tags">
                    <span
                      v-for="(tag, ti) in job.tags"
                      :key="ti"
                      :class="tagClass(tag.type)"
                    >
                      {{ tag.name }}
                    </span>
                  </div>

                  <!-- Tech Stack (new format) -->
                  <div v-else-if="'techStack' in job && job.techStack" class="exp-tags">
                    <span
                      v-for="(tech, ti) in job.techStack"
                      :key="ti"
                      class="exp-tag exp-tag--blue"
                    >
                      {{ tech }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup lang="ts">
import { cvData } from '../../data/cv'

const experiences = cvData.experiences

function tagClass(type: string): string {
  const base = 'exp-tag'
  const map: Record<string, string> = {
    green: `${base} exp-tag--green`,
    blue: `${base} exp-tag--blue`,
    amber: `${base} exp-tag--amber`,
    purple: `${base} exp-tag--purple`,
  }
  return map[type] || `${base} exp-tag--default`
}
</script>

<style scoped>
/* ── Background Ambient Glows ───────────────────────────────────── */
.exp-bg-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  pointer-events: none;
  opacity: 0.06;
}
.exp-bg-glow--1 {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(45, 212, 191, 0.6), transparent 70%);
  top: 10%;
  left: -10%;
}
.exp-bg-glow--2 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.5), transparent 70%);
  bottom: 10%;
  right: -8%;
}

/* ── Company Hero Card ──────────────────────────────────────────── */
.exp-company-card {
  position: relative;
  padding: 2px;
  border-radius: 1.25rem;
  background: linear-gradient(135deg, rgba(45, 212, 191, 0.3), rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.1));
}
.exp-company-card__inner {
  background: rgba(17, 24, 39, 0.85);
  backdrop-filter: blur(20px);
  border-radius: calc(1.25rem - 2px);
  padding: 1.75rem 2rem;
}
@media (min-width: 768px) {
  .exp-company-card__inner {
    padding: 2rem 2.5rem;
  }
}

.exp-company-icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 1rem;
  background: linear-gradient(135deg, rgba(45, 212, 191, 0.15), rgba(59, 130, 246, 0.15));
  border: 1px solid rgba(45, 212, 191, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.exp-meta-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.25rem 0.6rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 12px;
}

.exp-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.2rem 0.75rem;
  border-radius: 9999px;
  background: rgba(45, 212, 191, 0.1);
  border: 1px solid rgba(45, 212, 191, 0.2);
  color: #5eead4;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.exp-roles-stat {
  display: none;
  flex-direction: column;
  align-items: center;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 1rem;
}
@media (min-width: 768px) {
  .exp-roles-stat {
    display: flex;
  }
}

/* ── Timeline Track ─────────────────────────────────────────────── */
.exp-timeline-track {
  position: absolute;
  left: 23px;
  top: 0;
  bottom: 0;
  width: 2px;
  overflow: hidden;
}
@media (min-width: 768px) {
  .exp-timeline-track {
    left: 50%;
    transform: translateX(-1px);
  }
}
.exp-timeline-track__fill {
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg,
    rgba(45, 212, 191, 0.5) 0%,
    rgba(59, 130, 246, 0.35) 40%,
    rgba(139, 92, 246, 0.2) 80%,
    transparent 100%
  );
  transform-origin: top;
  animation: exp-grow-line 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes exp-grow-line {
  from { transform: scaleY(0); }
  to { transform: scaleY(1); }
}

/* ── Timeline Item — CSS-only staggered fade-in ─────────────────── */
@keyframes exp-card-reveal {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes exp-card-reveal-left {
  from {
    opacity: 0;
    transform: translateX(-40px) translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateX(0) translateY(0);
  }
}

@keyframes exp-card-reveal-right {
  from {
    opacity: 0;
    transform: translateX(40px) translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateX(0) translateY(0);
  }
}

.exp-timeline-item {
  position: relative;
  margin-bottom: 3.5rem;
  /* CSS-only animation — no JS needed */
  opacity: 0;
  animation: exp-card-reveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.exp-timeline-item:last-child {
  margin-bottom: 0;
}

@media (min-width: 768px) {
  .exp-timeline-item {
    display: flex;
  }
  .exp-timeline-item--left {
    flex-direction: row;
    animation-name: exp-card-reveal-left;
  }
  .exp-timeline-item--right {
    flex-direction: row-reverse;
    animation-name: exp-card-reveal-right;
  }
}

/* ── Timeline Node (dot on line) ────────────────────────────────── */
.exp-timeline-node {
  position: absolute;
  left: 23px;
  top: 2rem;
  transform: translateX(-50%);
  z-index: 20;
}
@media (min-width: 768px) {
  .exp-timeline-node {
    left: 50%;
  }
}

.exp-timeline-node__pulse {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: rgba(45, 212, 191, 0.25);
  animation: exp-pulse 2.5s ease-in-out infinite;
}
@keyframes exp-pulse {
  0%, 100% { transform: scale(1); opacity: 0.4; }
  50% { transform: scale(1.8); opacity: 0; }
}

.exp-timeline-node__dot {
  position: relative;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  box-shadow: 0 0 0 4px var(--bg);
}
.exp-timeline-node__dot--active {
  background: linear-gradient(135deg, #2dd4bf, #34d399);
  box-shadow: 0 0 0 4px var(--bg), 0 0 24px rgba(45, 212, 191, 0.6);
}
.exp-timeline-node__dot--past {
  background: linear-gradient(135deg, #60a5fa, #a78bfa);
  box-shadow: 0 0 0 4px var(--bg), 0 0 14px rgba(99, 102, 241, 0.3);
}
.exp-timeline-node__inner {
  position: absolute;
  inset: 5px;
  border-radius: 50%;
  background: var(--bg);
}

/* ── Card Wrapper ───────────────────────────────────────────────── */
.exp-card-wrapper {
  margin-left: 3.5rem;
  width: 100%;
}
@media (min-width: 768px) {
  .exp-card-wrapper {
    margin-left: 0;
    width: 50%;
  }
}

/* ── Job Card ───────────────────────────────────────────────────── */
.exp-job-card {
  position: relative;
  overflow: hidden;
  border-radius: 1.25rem;
  background: rgba(17, 24, 39, 0.55);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(148, 163, 184, 0.1);
  padding: 1.75rem;
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
@media (min-width: 768px) {
  .exp-job-card {
    padding: 2rem;
  }
}

/* Inner shimmer on hover */
.exp-job-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, transparent 50%);
  opacity: 0;
  transition: opacity 0.5s ease;
  pointer-events: none;
}
.exp-job-card:hover::before {
  opacity: 1;
}

/* Top edge gradient glow */
.exp-job-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  opacity: 0;
  transition: opacity 0.5s ease;
  pointer-events: none;
}

.exp-job-card--current::after {
  background: linear-gradient(90deg, transparent, #2dd4bf, #34d399, transparent);
}
.exp-job-card--past::after {
  background: linear-gradient(90deg, transparent, #60a5fa, #a78bfa, transparent);
}

.exp-job-card:hover::after {
  opacity: 1;
}

.exp-job-card--current:hover {
  border-color: rgba(45, 212, 191, 0.3);
  box-shadow: 0 8px 40px rgba(45, 212, 191, 0.1),
              0 0 0 1px rgba(45, 212, 191, 0.1);
  transform: translateY(-4px);
}

.exp-job-card--past:hover {
  border-color: rgba(99, 102, 241, 0.2);
  box-shadow: 0 8px 35px rgba(99, 102, 241, 0.08),
              0 0 0 1px rgba(99, 102, 241, 0.08);
  transform: translateY(-4px);
}

/* ── Current Role Ribbon ────────────────────────────────────────── */
.exp-current-ribbon {
  position: absolute;
  top: 0;
  right: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.35rem 0.85rem;
  background: linear-gradient(135deg, #0d9488, #14b8a6);
  color: white;
  font-size: 10px;
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border-bottom-left-radius: 0.75rem;
  border-top-right-radius: calc(1.25rem - 1px);
}

/* ── Step Number ────────────────────────────────────────────────── */
.exp-step-number {
  position: absolute;
  top: -0.30rem;
  left: 1.5rem;
}
.exp-step-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.5rem;
  font-size: 11px;
  font-weight: 700;
  font-family: ui-monospace, SFMono-Regular, monospace;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--text-tertiary);
}
.exp-step-badge--active {
  background: rgba(45, 212, 191, 0.15);
  border-color: rgba(45, 212, 191, 0.3);
  color: #5eead4;
}

/* ── Card Content ───────────────────────────────────────────────── */
.exp-card-content {
  position: relative;
}

.exp-period {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.8rem;
  border-radius: 9999px;
  border: 1px solid rgba(59, 130, 246, 0.15);
  background: rgba(59, 130, 246, 0.06);
  color: #93c5fd;
  font-size: 11px;
  font-family: ui-monospace, SFMono-Regular, monospace;
  letter-spacing: 0.03em;
  margin-bottom: 1rem;
  margin-top: 0.5rem;
}
.exp-period--active {
  border-color: rgba(45, 212, 191, 0.2);
  background: rgba(45, 212, 191, 0.08);
  color: #5eead4;
}

.exp-job-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.92);
  margin-bottom: 0.5rem;
  letter-spacing: 0.01em;
  transition: color 0.3s ease;
}
@media (min-width: 768px) {
  .exp-job-title {
    font-size: 1.375rem;
  }
}
.group:hover .exp-job-title {
  color: #93c5fd;
}
.group:hover .exp-job-title--active {
  color: #5eead4;
}

.exp-job-location {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 12px;
  font-family: ui-monospace, SFMono-Regular, monospace;
  color: var(--text-tertiary);
  margin-bottom: 1.25rem;
}

.exp-job-description {
  font-size: 14px;
  line-height: 1.85;
  color: var(--text-secondary);
  font-weight: 300;
  margin-bottom: 1.5rem;
  position: relative;
  padding-left: 0.75rem;
  border-left: 2px solid rgba(45, 212, 191, 0.12);
}

/* ── Responsibilities ───────────────────────────────────────────── */
.exp-responsibilities {
  list-style: none;
  padding: 0;
  margin: 0 0 1.25rem 0;
}
.exp-responsibilities li {
  position: relative;
  padding-left: 1.25rem;
  margin-bottom: 0.5rem;
  font-size: 13px;
  line-height: 1.75;
  color: var(--text-secondary);
  font-weight: 300;
}
.exp-responsibilities li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.55rem;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(45, 212, 191, 0.4);
}

/* ── Achievements ───────────────────────────────────────────────── */
.exp-achievements {
  margin-bottom: 1.25rem;
  padding: 0.85rem 1rem;
  border-radius: 0.75rem;
  background: rgba(245, 158, 11, 0.04);
  border: 1px solid rgba(245, 158, 11, 0.1);
}
.exp-achievements__header {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 11px;
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-weight: 600;
  color: #fbbf24;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.6rem;
}
.exp-achievements__list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.exp-achievements__list li {
  position: relative;
  padding-left: 1.1rem;
  margin-bottom: 0.35rem;
  font-size: 12.5px;
  line-height: 1.7;
  color: var(--text-secondary);
  font-weight: 300;
}
.exp-achievements__list li::before {
  content: '→';
  position: absolute;
  left: 0;
  color: #fbbf24;
  font-size: 11px;
}

/* ── Tags ───────────────────────────────────────────────────────── */
.exp-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.exp-tag {
  padding: 0.3rem 0.65rem;
  border-radius: 0.4rem;
  font-size: 11px;
  font-family: ui-monospace, SFMono-Regular, monospace;
  letter-spacing: 0.02em;
  border: 1px solid;
  transition: all 0.3s ease;
  cursor: default;
}
.exp-tag:hover {
  transform: translateY(-1px);
}

.exp-tag--green {
  background: rgba(16, 185, 129, 0.08);
  border-color: rgba(16, 185, 129, 0.18);
  color: #6ee7b7;
}
.exp-tag--green:hover {
  background: rgba(16, 185, 129, 0.16);
  box-shadow: 0 2px 12px rgba(16, 185, 129, 0.12);
}

.exp-tag--blue {
  background: rgba(59, 130, 246, 0.08);
  border-color: rgba(59, 130, 246, 0.18);
  color: #93c5fd;
}
.exp-tag--blue:hover {
  background: rgba(59, 130, 246, 0.16);
  box-shadow: 0 2px 12px rgba(59, 130, 246, 0.12);
}

.exp-tag--amber {
  background: rgba(245, 158, 11, 0.08);
  border-color: rgba(245, 158, 11, 0.18);
  color: #fcd34d;
}
.exp-tag--amber:hover {
  background: rgba(245, 158, 11, 0.16);
  box-shadow: 0 2px 12px rgba(245, 158, 11, 0.12);
}

.exp-tag--purple {
  background: rgba(139, 92, 246, 0.08);
  border-color: rgba(139, 92, 246, 0.18);
  color: #c4b5fd;
}
.exp-tag--purple:hover {
  background: rgba(139, 92, 246, 0.16);
  box-shadow: 0 2px 12px rgba(139, 92, 246, 0.12);
}

.exp-tag--default {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.6);
}
.exp-tag--default:hover {
  background: rgba(255, 255, 255, 0.08);
}
</style>
