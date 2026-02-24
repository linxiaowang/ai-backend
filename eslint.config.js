// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu(
  {
    type: 'lib',
    pnpm: true,
    ignores: [
      'pnpm-workspace.yaml',
    ],
  },
  {
    rules: {
      'antfu/no-top-level-await': 'off',
      'no-console': 'off',
      'ts/explicit-function-return-type': 'off',
      'node/prefer-global/process': 'off',
    },
  },
)
