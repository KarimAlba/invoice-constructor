const quote = (file) => `"${file.replaceAll('"', '\\"')}"`;

export default {
  '*.{css}': ['stylelint --fix --cache', 'prettier --write --cache'],
  '*.{md,json,yml,yaml}': 'prettier --write --cache',
  '*.{ts,tsx}': (files) => [
    'tsc -b --pretty',
    `eslint --fix --cache ${files.map(quote).join(' ')}`,
    'steiger ./src',
    `prettier --write --cache ${files.map(quote).join(' ')}`,
  ],
};
