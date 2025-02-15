<template>
  <main class="px-4 py-10 text-center text-gray-700 dark:text-gray-200">
    {{ JSON.stringify(redirectRules) }}
  </main>
</template>

<script setup lang="ts">
import { redirectRules } from '~/logic/storage'
</script>
