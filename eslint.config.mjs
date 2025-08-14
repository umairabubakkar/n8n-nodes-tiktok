import tsParser from '@typescript-eslint/parser';
import n8nPlugin from 'eslint-plugin-n8n-nodes-base';
import jsoncParser from 'jsonc-eslint-parser';
import globals from 'globals';

export default [
  {
    ignores: ['**/*.js', '**/node_modules/**', '**/dist/**'],
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['./tsconfig.json'],
        sourceType: 'module',
        extraFileExtensions: ['.json'],
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
  },
  {
    files: ['package.json'],
    languageOptions: {
      parser: jsoncParser,
    },
    plugins: { 'n8n-nodes-base': n8nPlugin },
    rules: {
      ...n8nPlugin.configs.community.rules,
      'n8n-nodes-base/community-package-json-name-still-default': 'off',
    },
  },
  {
    files: ['credentials/**/*.ts'],
    plugins: { 'n8n-nodes-base': n8nPlugin },
    rules: {
      ...n8nPlugin.configs.credentials.rules,
      'n8n-nodes-base/cred-class-field-documentation-url-missing': 'off',
      'n8n-nodes-base/cred-class-field-documentation-url-miscased': 'off',
    },
  },
  {
    files: ['nodes/**/*.ts'],
    plugins: { 'n8n-nodes-base': n8nPlugin },
    rules: {
      ...n8nPlugin.configs.nodes.rules,
      'n8n-nodes-base/node-execute-block-missing-continue-on-fail': 'off',
      'n8n-nodes-base/node-resource-description-filename-against-convention': 'off',
      'n8n-nodes-base/node-param-fixed-collection-type-unsorted-items': 'off',
    },
  },
];
