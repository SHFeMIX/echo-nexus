import { useWebExtensionStorage } from '~/composables/useWebExtensionStorage'

export const redirectRules = useWebExtensionStorage('redirectRules', [1, 2, 3])
