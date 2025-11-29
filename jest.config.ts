import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'ts', 'json'],
  rootDir: './',
  modulePaths: ['<rootDir>'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/$1',
  },
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/main.ts',
    '!src/**/*.module.ts',
    '!src/**/*.dto.ts',
    '!src/**/constants/**/*.ts',
    '!src/config/**/*.ts',
    '!src/shared/modules/database/prisma/**/*.ts',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};

export default config;
