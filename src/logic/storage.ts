import { useWebExtensionStorage } from '~/composables/useWebExtensionStorage'

// 定义键为 symbol，值为 Rule 类型的对象
export interface RulesType {
  active: boolean
  redirectUrl: string
  urlFilter: string
}

export const redirectRules = useWebExtensionStorage<RulesType[]>('redirectRules', [
  {
    active: true,
    redirectUrl: 'https://www.baidu.com',
    urlFilter: 'https://www.google.com/*',
  },
  {
    active: true,
    redirectUrl: 'https://www.baidu.com',
    urlFilter: 'https://www.google.com/*',
  },
])
