module.exports = {
  testRegex: '/tests/.*\\.test\\.tsx?$',
  collectCoverageFrom: ['edgerender/**/*.ts'],
  preset: 'ts-jest',
  moduleDirectories: ['.', 'node_modules'],
}
