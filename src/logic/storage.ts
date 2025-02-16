import { useWebExtensionStorage } from '~/composables/useWebExtensionStorage'

// 定义值对象的类型
interface Rule {
  active: boolean
  redirectUrl: string
  urlFilter: string
}

// 定义键为 symbol，值为 Rule 类型的对象
export interface RulesType {
  [key: number]: Rule
}

export function generateRuleId() {
  // 三维数随机数
  return Math.floor(Math.random() * 900) + 100
}

export const redirectRules = useWebExtensionStorage<RulesType>('redirectRules', {
  [generateRuleId()]: {
    active: false,
    redirectUrl: 'url1',
    urlFilter: 'url2',
  },
  [generateRuleId()]: {
    active: true,
    redirectUrl: 'url3url4',
    urlFilter: '',
  },
})

// [
//   {
//     id: 1,
//     active: true,
//     name: 'Google',
//     pattern: 'google.com',
//     redirect: 'https://bing.com',
//   },
//   {
//     id: 2,
//     active: true,
//     name: 'Bing',
//     pattern: 'bing.com',
//     redirect: 'https://google.com',
//   },
//   {
//     id: 3,
//     active: true,
//     name: 'Yahoo',
//     pattern: 'yahoo.com',
//     redirect: 'https://duckduckgo.com',
//   },
//   {
//     id: 4,
//     active: true,
//     name: 'DuckDuckGo',
//     pattern: 'duckduckgo.com',
//     redirect: 'https://yahoo.com',
//   },
// ]
