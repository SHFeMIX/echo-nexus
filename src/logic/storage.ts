import { useWebExtensionStorage } from '~/composables/useWebExtensionStorage'

export const redirectRules = useWebExtensionStorage('redirectRules', [
  {
    id: 1,
    active: true,
    name: 'Google',
    pattern: 'google.com',
    redirect: 'https://bing.com',
  },
  {
    id: 2,
    active: true,
    name: 'Bing',
    pattern: 'bing.com',
    redirect: 'https://google.com',
  },
  {
    id: 3,
    active: true,
    name: 'Yahoo',
    pattern: 'yahoo.com',
    redirect: 'https://duckduckgo.com',
  },
  {
    id: 4,
    active: true,
    name: 'DuckDuckGo',
    pattern: 'duckduckgo.com',
    redirect: 'https://yahoo.com',
  },
])
