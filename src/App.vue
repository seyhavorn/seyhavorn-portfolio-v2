<script setup lang="ts">
import { Analytics } from "@vercel/analytics/vue"
</script>

<template>
  <div class="relative min-h-screen">
    <!-- Animated Background Blobs -->
    <div class="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <div class="blob bg-teal-600/15 w-[700px] h-[700px] top-[-150px] left-[-250px]"></div>
      <div class="blob bg-purple-600/15 w-[550px] h-[550px] bottom-[-150px] right-[-150px]" style="animation-delay: -5s"></div>
      <div class="blob bg-blue-600/12 w-[450px] h-[450px] top-[40%] left-[60%]" style="animation-delay: -10s"></div>
      <div class="blob bg-indigo-500/10 w-[350px] h-[350px] top-[70%] left-[20%]" style="animation-delay: -15s"></div>
    </div>

    <!-- Router View -->
    <router-view />

    <!-- Vercel Analytics -->
    <Analytics />
  </div>
</template>
