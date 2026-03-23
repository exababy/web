<template>
  <div class="skins-page">
    <header class="skins-header my-4">
      <div class="skins-header__nav">
        <h1 class="text-xl font-bold px-4">Skins Module Admin Panel</h1>
      </div>
    </header>

    <main class="skins-main">
      <SkinsAdminPanel />
    </main>
  </div>
</template>

<script setup lang="ts">
import SkinsAdminPanel from "~/components/skins/SkinsAdminPanel.vue";

// Minimal page to load the admin panel component
</script>

<style>
@import "~/assets/css/skins.css";
</style>
