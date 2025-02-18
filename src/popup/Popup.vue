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
import { redirectRules } from '~/logic/storage'
import { MessageType, ResponseType } from '~/logic/cont'

const running = ref(false)

// 过滤出所有 active 的规则，转换成能发送的形式
const rulesData = computed(() => {
  const activeRules = redirectRules.value.filter(rule => rule.active)

  return JSON.stringify(activeRules)
})
// 开关打开后，更新规则，如果失败就再关上
async function startRunning() {
  const res = await sendMessage(MessageType.UPDATE_RULES, rulesData.value, 'background')
  const { status } = JSON.parse(res)

  // console.log(data)

  if (status === ResponseType.SUCCESS) {
    Snackbar({
      type: 'success',
      duration: 2000,
      content: '成功开启拦截',
    })
  }
  else {
    Snackbar({
      type: 'error',
      duration: 2000,
      content: '开启失败，请重试',
    })
    running.value = false
  }
}

// 开关关闭后，删除所有规则以停止拦截，如果失败就再打开
async function stopRunning() {
  const res = await sendMessage(MessageType.UPDATE_RULES, JSON.stringify([]), 'background')

  const { status } = JSON.parse(res)

  // console.log(data)

  if (status === ResponseType.SUCCESS) {
    Snackbar({
      type: 'success',
      duration: 2000,
      content: '成功停止拦截',
    })
  }
  else {
    Snackbar({
      type: 'error',
      duration: 2000,
      content: '停止失败，请重试',
    })
    running.value = true
  }
}

function debounceSwitch(switchCallback: (newState: boolean) => void, delay: number) {
  // 记录点击前的初始状态
  let initSwtichValue: boolean | null = null

  let timer: NodeJS.Timeout
  return function (newState: boolean) {
    clearTimeout(timer)

    // 第一次点击后的状态取反，就是未点击时的状态
    if (initSwtichValue === null) {
      initSwtichValue = !newState
    }
    // 之后如果点击后状态等于未点击状态，不执行回调
    else if (newState === initSwtichValue) {
      return
    }

    timer = setTimeout(() => {
      switchCallback(newState)
      initSwtichValue = null
    }, delay)
  }
}

// 开关加防抖，并且连续点击之后如果结果未改变也不执行回调
const toggleSwitch = debounceSwitch(
  (newState: boolean) => newState ? startRunning() : stopRunning(),
  1500,
)
</script>

<style scoped>
.form-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
</style>
