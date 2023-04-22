const { getConfig } = require('@gqless-transport-ws/test-utils/jest.config.js');

module.exports = getConfig({
  setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
  testEnvironment: 'jsdom',
});
