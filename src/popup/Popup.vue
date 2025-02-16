<template>
  <main class="w-[600px] px-4 py-5 text-center text-gray-700">
    <Logo />
    <div>Popup</div>
    <SharedSubtitle />

    <var-button type="primary" round icon-container>
      <var-icon name="plus" />
    </var-button>
    <div v-for="(val, key) in redirectRules" :key="key" class="form-item">
      <var-switch v-model="val.active" variant />
      <var-input v-model="val.urlFilter" variant="outlined" placeholder="请输入要拦截的url" size="small" />
      <var-input v-model="val.redirectUrl" variant="outlined" placeholder="请输入重定向地址" size="small" />
    </div>

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
import { debounce } from 'lodash'
import type { RulesType } from '~/logic/storage'
import { redirectRules } from '~/logic/storage'
import { MessageType } from '~/logic/cont'
import watchOldValue from '~/composables/watchOldValue'

watchOldValue(
  redirectRules,
  debounce((newVal, oldVal) => updateRules(toRaw(newVal), oldVal), 1000),
  { deep: true },
)

async function updateRules(newVal: RulesType, oldVal: RulesType) {
  // console.log('updateRules', newVal, oldVal)
  // console.log(await sendMessage(MessageType.ADD_RULE), await sendMessage(MessageType.DELETE_RULE))
  sendMessage(MessageType.ADD_RULE, JSON.stringify(newVal))
  sendMessage(MessageType.DELETE_RULE, JSON.stringify(oldVal))
}
</script>

<style scoped>
.form-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
</style>
