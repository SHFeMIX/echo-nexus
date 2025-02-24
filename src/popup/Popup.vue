<template>
  <main class="main">
    <var-button
      class="add_rules_button" icon-container :disabled="nonEditable"
      @click="redirectRules.push({ active: false, redirectUrl: '', urlFilter: '' })"
    >
      添加规则 <var-icon name="plus" />
    </var-button>

    <div v-for="(rule, index) in redirectRules" :key="index" class="form-item">
      <var-checkbox v-model="rule.active" :disabled="nonEditable" />

      <var-input
        v-model="rule.urlFilter" class="input" variant="outlined" clearable
        placeholder="请输入请求拦截匹配符" size="small" :disabled="nonEditable"
      />

      <var-input
        v-model="rule.redirectUrl" class="input" variant="outlined" clearable
        placeholder="请输入完整的重定向地址" size="small" :disabled="nonEditable"
      />

      <var-button
        round icon-container :disabled="nonEditable || redirectRules.length === 1"
        @click="redirectRules.splice(index, 1)"
      >
        <var-icon name="trash-can" />
      </var-button>
    </div>

    <var-switch
      v-model="running" class="switch" variant lazy-change
      :loading="updating" @before-change="handleBeforeChange"
    />
  </main>
</template>

<script setup lang="ts">
import { sendMessage } from 'webext-bridge/popup'
import { redirectRules, running } from '~/logic/storage'
import { MessageType, ResponseType } from '~/logic/cont'

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 过滤出所有 active 的规则，转换成能发送的形式
const rulesData = computed(() => {
  const activeRules = redirectRules.value.filter(rule => rule.active)

  return JSON.stringify(activeRules)
})

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
  const { status, data, error } = JSON.parse(res)

  if (status === ResponseType.SUCCESS) {
    console.log('成功添加规则：', data)

    Snackbar({
      type: 'success',
      duration: 1500,
      content: '成功开启拦截',
    })

    return true
  }
  else {
    console.error(error)

    Snackbar({
      type: 'error',
      duration: 1500,
      content: '开启失败，请重试',
    })

    return false
  }
}

// 开关关闭后，删除所有规则以停止拦截，返回结果成功或失败
async function stopRunning() {
  const res = await sendMessage(MessageType.UPDATE_RULES, JSON.stringify([]), 'background')

  const { status, data, error } = JSON.parse(res)

  if (status === ResponseType.SUCCESS) {
    console.log('成功删除所有规则', data)

    Snackbar({
      type: 'success',
      duration: 2000,
      content: '成功停止拦截',
    })
    return true
  }
  else {
    console.error(error)

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
.main {
  width: 600px;
  margin: 30px;
}

.add_rules_button {

}

.form-item {
  margin: 10px 0;
  display: flex;
  align-items: center;

  >.input {
    margin-right: 10px;
    width: 300px;
    --field-decorator-placeholder-size: 14px;
  }
}
</style>
