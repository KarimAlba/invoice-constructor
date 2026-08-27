export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'merge',
        'build',
        'chore',
        'ci',
        'docs',
        'feat',
        'fix',
        'perf',
        'proposal',
        'refactor',
        'revert',
        'style',
        'test',
        'wip',
      ],
    ],
  },
};
