import { useWebExtensionStorage } from '~/composables/useWebExtensionStorage'

export interface RulesType {
  active: boolean
  redirectUrl: string
  urlFilter: string
}

export const redirectRules = useWebExtensionStorage<RulesType[]>('redirectRules', [
  {
    active: false,
    redirectUrl: '',
    urlFilter: '',
  },
])

// 是否正在拦截
export const running = useWebExtensionStorage<boolean>('running', false)
