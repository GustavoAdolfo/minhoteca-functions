// transform: {
//   '^.+\\.tsx?$': [
//     'ts-jest',
//     {
//       tsconfig: {
//         module: 'commonjs',
//         esModuleInterop: true,
//       },
//     },
//   ],
// },

import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  rootDir: './',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  setupFiles: ['<rootDir>/__tests__/setup.tests.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/**/index.ts', '!src/__tests__/**'],
  coverageThreshold: { global: { branches: 80, functions: 80, lines: 80, statements: 80 } },
  testTimeout: 10000,
  verbose: true,
};

export default config;
