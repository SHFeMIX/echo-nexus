import { onMessage } from 'webext-bridge/background'
import { MessageType, ResponseType } from '~/logic/cont'
import type { RulesType } from '~/logic/storage'

// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import('/@vite/client')
  // load latest content script
  import('./contentScriptHMR')
}

onMessage(MessageType.UPDATE_RULES, async ({ data }) => {
  try {
    const newRulesData = JSON.parse(data)

    // 将收到的数据转化成可添加的规则，并加上允许跨域的规则
    const newRules = [...createRedirectRules(newRulesData), ...createCorsRule(newRulesData)]

    const currentRules = await browser.declarativeNetRequest.getDynamicRules()

    await browser.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: currentRules.map(rule => rule.id),
      addRules: newRules,
    })

    const currentRuleIDs = await browser.declarativeNetRequest.getDynamicRules()

    return JSON.stringify({
      status: ResponseType.SUCCESS,
      data: currentRuleIDs,
    })
  }
  catch (e) {
    return JSON.stringify({
      status: ResponseType.ERROR,
      error: e instanceof Error ? e.message : String(e),
    })
  }
})

function createRedirectRules(rules: RulesType[]) {
  return rules.map((rule, index) => ({
    id: index + 1,
    priority: index + 1,
    action: {
      type: 'redirect',
      redirect: {
        url: rule.redirectUrl,
      },
    },
    condition: {
      urlFilter: rule.urlFilter,
    },
  }))
}

function createCorsRule(rules: RulesType[]) {
  return rules.map((rule, index) => ({
    id: rules.length + index + 1,
    priority: rules.length + index + 1,
    condition: {
      urlFilter: rule.redirectUrl,
      // resourceTypes: ['xmlhttprequest'],
    },
    action: {
      type: 'modifyHeaders',
      responseHeaders: [
        {
          header: 'Access-Control-Allow-Origin',
          operation: 'set',
          value: '*', // 允许所有源
        },
        {
          header: 'Access-Control-Allow-Methods',
          operation: 'set',
          value: 'GET, POST, PUT, DELETE, OPTIONS', // 允许的请求方法
        },
        {
          header: 'Access-Control-Allow-Headers',
          operation: 'set',
          value: 'Content-Type, Authorization', // 允许的请求头
        },
      ],
    },
  }))
}
