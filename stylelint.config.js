export default {
  extends: ['stylelint-config-standard'],
  ignoreFiles: ['dist/**', 'node_modules/**'],
  rules: {
    'declaration-block-no-redundant-longhand-properties': null,
    'selector-class-pattern': null,
  },
};
