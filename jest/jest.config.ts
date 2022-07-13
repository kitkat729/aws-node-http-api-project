import path from 'path'

const config = {
  rootDir: '..',
  // moduleNameMapper: {
  //   '^functions/(.*)$': '<rootDir>/functions/$1'
  // },
  testPathIgnorePatterns: ['<rootDir>/\\.build'],
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      tsconfig: path.resolve(__dirname, '../tsconfig.json'),
    },
  },
}

export default config