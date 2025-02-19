<template>
  <main class="w-[600px] px-4 py-5 text-center text-gray-700">
    <Logo />
    <div>Popup</div>
    <SharedSubtitle />

    <var-button type="primary" round icon-container>
      <var-icon name="plus" />
    </var-button>
    <div v-for="(rule, index) in redirectRules" :key="index" class="form-item">
      <var-checkbox v-model="rule.active" :disabled="nonEditable" />
      <var-input v-model="rule.urlFilter" variant="outlined" placeholder="请输入要拦截的url" size="small" :disabled="nonEditable" />
      <var-input v-model="rule.redirectUrl" variant="outlined" placeholder="请输入重定向地址" size="small" :disabled="nonEditable" />
    </div>

    <var-switch v-model="running" variant lazy-change :loading="updating" @before-change="handleBeforeChange" />
  </main>
</template>

<script setup lang="ts">
import { sendMessage } from 'webext-bridge/popup'
import { redirectRules } from '~/logic/storage'
import { MessageType, ResponseType } from '~/logic/cont'

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 过滤出所有 active 的规则，转换成能发送的形式
const rulesData = computed(() => {
  const activeRules = redirectRules.value.filter(rule => rule.active)

  return JSON.stringify(activeRules)
})

// 是否正在拦截中
const running = ref(false)

// 开关是否正在切换中
const updating = ref(false)

// 表单是否禁用，正在拦截中或开关正在切换中都禁用
const nonEditable = computed(() => running.value || updating.value)

// 开关切换前，先做对应的异步更新操作，成功则更改开关状态，失败不更改
async function handleBeforeChange(value: boolean, change: (value: boolean) => void) {
  updating.value = true
  await sleep(1000)

  let result: boolean | null = null
  if (value === true) {
    result = await startRunning()
  }
  else {
    result = await stopRunning()
  }

  result && change(value)

  updating.value = false
}

// 开关打开后，更新规则，返回结果成功或失败
async function startRunning() {
  const res = await sendMessage(MessageType.UPDATE_RULES, rulesData.value, 'background')
  const { status } = JSON.parse(res)

  if (status === ResponseType.SUCCESS) {
    Snackbar({
      type: 'success',
      duration: 2000,
      content: '成功开启拦截',
    })

    return true
  }
  else {
    Snackbar({
      type: 'error',
      duration: 2000,
      content: '开启失败，请重试',
    })

    return false
  }
}

// 开关关闭后，删除所有规则以停止拦截，返回结果成功或失败
async function stopRunning() {
  const res = await sendMessage(MessageType.UPDATE_RULES, JSON.stringify([]), 'background')

  const { status } = JSON.parse(res)

  if (status === ResponseType.SUCCESS) {
    Snackbar({
      type: 'success',
      duration: 2000,
      content: '成功停止拦截',
    })
    return true
  }
  else {
    Snackbar({
      type: 'error',
      duration: 2000,
      content: '停止失败，请重试',
    })
    return false
  }
}
</script>

<style scoped>
.form-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
</style>
