// import antfu from '@antfu/eslint-config'

// export default antfu(

// )
import antfu from '@antfu/eslint-config'

export default antfu({
  vue: {
    overrides: {
      'vue/block-order': ['error', {
        order: ['template', 'script', 'style'],
      }],
      'vue/valid-template-root': 'off',
    },
  },
  rules: {
    'ts/no-unused-expressions': 'off',
    'no-console': 'off',
  },
})
