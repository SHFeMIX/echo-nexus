<template>
  <main class="w-[600px] px-4 py-5 text-center text-gray-700">
    <Logo />
    <div>Popup</div>
    <SharedSubtitle />

    <template v-for="(rule, index) in redirectRules" :key="rule.id + index">
      <var-switch v-model="test" />
    </template>

    <button class="btn mt-2" @click="openOptionsPage">
      Open Options
    </button>
    <div class="mt-2">
      <span class="opacity-50">Storage:</span> {{ JSON.stringify(redirectRules) }}
    </div>
  </main>
</template>

<script setup lang="ts">
import { redirectRules } from '~/logic/storage'

const test = ref(false)
function openOptionsPage() {
  browser.runtime.openOptionsPage()
}
</script>

<style scoped>
</style>
