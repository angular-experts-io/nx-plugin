/* eslint-disable */
export default {
  displayName: 'tooling-nx-plugin',
  preset: '../../../jest.preset.js',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  modulePathIgnorePatterns: ['<rootDir>/src/generators/lib/files'],
};
