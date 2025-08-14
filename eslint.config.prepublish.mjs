import baseConfig from './eslint.config.mjs';

export default baseConfig.map((config) => {
  if (config.files && config.files.includes('package.json')) {
    return {
      ...config,
      rules: {
        ...config.rules,
        'n8n-nodes-base/community-package-json-name-still-default': 'error',
      },
    };
  }
  return config;
});
