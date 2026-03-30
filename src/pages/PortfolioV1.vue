<script setup lang="ts">
import CvHeader from '../components/CvHeader.vue'
import CvProfile from '../components/CvProfile.vue'
import CvServices from '../components/CvServices.vue'
import CvProjects from '../components/CvProjects.vue'
import CvExperience from '../components/CvExperience.vue'
import CvSidebar from '../components/CvSidebar.vue'
</script>

<template>
  <div class="relative z-10 max-w-[1100px] mx-auto px-6 py-12 md:py-20 lg:py-24">
    <CvHeader />
    <CvProfile />
    <CvServices />
    <CvProjects />

    <div class="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 lg:gap-12 mt-12">
      <CvExperience />
      <CvSidebar />
    </div>

    <footer class="mt-20 pt-8 border-t border-[var(--border)] text-center text-[11px] text-[var(--text-tertiary)] tracking-widest uppercase font-mono relative">
      <div class="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-teal-500/30 to-transparent"></div>
      © {{ new Date().getFullYear() }} Seyha Vorn
    </footer>
  </div>
</template>
