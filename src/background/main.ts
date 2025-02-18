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

    const currentRules = await browser.declarativeNetRequest.getDynamicRules()

    const newRules = createRules(newRulesData)

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
    // console.log(e)
    return JSON.stringify({
      status: ResponseType.ERROR,
      data: e,
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
