import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
  preset: 'ts-jest/presets/default-esm',
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        isolatedModules: true,
        useESM: true,
      },
    ],
  },
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['node_modules'],
  moduleDirectories: ['node_modules', '<rootDir>'],
  testPathIgnorePatterns: ['<rootDir>/dist', 'test/'],
  clearMocks: true,
  testTimeout: 10000,
  setupFiles: ['<rootDir>/jest-setup.ts'],
}

export default config
