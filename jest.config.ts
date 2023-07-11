/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  injectGlobals: true,
  clearMocks: true,
  testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
}
