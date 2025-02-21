import { onMessage, sendMessage } from 'webext-bridge/background'
import type { Tabs } from 'webextension-polyfill'
import { MessageType, ResponseType } from '~/logic/cont'
import type { RulesType } from '~/logic/storage'

// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import('/@vite/client')
  // load latest content script
  import('./contentScriptHMR')
}

// remove or turn this off if you don't use side panel
const USE_SIDE_PANEL = false

// to toggle the sidepanel with the action button in chromium:
if (USE_SIDE_PANEL) {
  // @ts-expect-error missing types
  browser.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error: unknown) => console.error(error))
}

browser.runtime.onInstalled.addListener((): void => {
  // eslint-disable-next-line no-console
  console.log('Extension installed')
})

let previousTabId = 0

// communication example: send previous tab title from background page
// see shim.d.ts for type declaration
browser.tabs.onActivated.addListener(async ({ tabId }) => {
  if (!previousTabId) {
    previousTabId = tabId
    return
  }

  let tab: Tabs.Tab

  try {
    tab = await browser.tabs.get(previousTabId)
    previousTabId = tabId
  }
  catch {
    return
  }

  // eslint-disable-next-line no-console
  console.log('previous tab', tab)
  sendMessage('tab-prev', { title: tab.title }, { context: 'content-script', tabId })
})

onMessage('get-current-tab', async () => {
  try {
    const tab = await browser.tabs.get(previousTabId)
    return {
      title: tab?.title,
    }
  }
  catch {
    return {
      title: undefined,
    }
  }
})

onMessage(MessageType.UPDATE_RULES, async ({ data }) => {
  try {
    const newRulesData = JSON.parse(data)

    // 将收到的数据转化成可添加的规则，并加上允许跨域的规则
    const newRules = [...createRules(newRulesData), corsRule(newRulesData.length + 1)]

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

function createRules(rules: RulesType[]) {
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

function corsRule(id: number) {
  return {
    id,
    priority: 1,
    condition: {
      urlFilter: '*',
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
  }
}
