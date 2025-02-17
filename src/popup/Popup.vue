<template>
  <main class="w-[600px] px-4 py-5 text-center text-gray-700">
    <Logo />
    <div>Popup</div>
    <SharedSubtitle />

    <var-button type="primary" round icon-container>
      <var-icon name="plus" />
    </var-button>
    <div v-for="(rule, index) in redirectRules" :key="index" class="form-item">
      <var-checkbox v-model="rule.active" :disabled="running" />
      <var-input v-model="rule.urlFilter" variant="outlined" placeholder="请输入要拦截的url" size="small" :disabled="running" />
      <var-input v-model="rule.redirectUrl" variant="outlined" placeholder="请输入重定向地址" size="small" :disabled="running" />
    </div>

    <var-switch v-model="running" variant @change="toggleSwitch" />
    <button class="btn mt-2">
      Open Options
    </button>
    <div class="mt-2">
      <span class="opacity-50">Rules:</span>{{ JSON.stringify(redirectRules) }}
    </div>
  </main>
</template>

<script setup lang="ts">
import { sendMessage } from 'webext-bridge/popup'
// import { debounce } from 'lodash'
import { redirectRules } from '~/logic/storage'
import type { RulesType } from '~/logic/storage'
import { MessageType, ResponseType } from '~/logic/cont'

const running = ref(false)

function toggleSwitch(value: boolean) {
  // eslint-disable-next-line no-console
  console.log(value)
}

watch(
  redirectRules,
  async (newRules: RulesType[]) => {
    const res = await sendMessage(MessageType.UPDATE_RULES, JSON.stringify(toRaw(newRules)), 'background')

    if (res === ResponseType.SUCCESS) {
      Snackbar({
        type: 'success',
        duration: 2000,
        content: '更新成功',
      })
    }
    else {
      Snackbar({
        type: 'error',
        duration: 2000,
        content: '更新失败，请重试',
      })
    }
  },
  { deep: true },
)
</script>

<style scoped>
.form-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
</style>
