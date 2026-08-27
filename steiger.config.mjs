import fsd from '@feature-sliced/steiger-plugin';
import { defineConfig } from 'steiger';

export default defineConfig([
  ...fsd.configs.recommended,
  {
    rules: {
      'fsd/no-cross-imports': 'error',
    },
  },
  {
    files: ['./src/entities/**'],
    rules: {
      'fsd/no-cross-imports': 'off',
      // One page consumes the invoice entity; extra slices would exist only to satisfy this rule.
      'fsd/insignificant-slice': 'off',
    },
  },
]);
