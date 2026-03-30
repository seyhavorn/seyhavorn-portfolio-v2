<script setup lang="ts">
import LandingNavbar from '../components/v2/LandingNavbar.vue'
import LandingHero from '../components/v2/LandingHero.vue'
import LandingAbout from '../components/v2/LandingAbout.vue'
import LandingServices from '../components/v2/LandingServices.vue'
import LandingSkills from '../components/v2/LandingSkills.vue'
import LandingExperience from '../components/v2/LandingExperience.vue'
import LandingProjects from '../components/v2/LandingProjects.vue'
import LandingContact from '../components/v2/LandingContact.vue'
import LandingFooter from '../components/v2/LandingFooter.vue'
</script>

<template>
  <!-- Sticky Navbar -->
  <LandingNavbar />

  <!-- Main Content -->
  <main class="relative z-10">
    <LandingHero />
    <LandingAbout />
    <LandingServices />
    <LandingSkills />
    <LandingExperience />
    <LandingProjects />
    <LandingContact />
  </main>

  <LandingFooter />
</template>
