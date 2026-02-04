module.exports = {
  testEnvironment: 'node',
  verbose: true,
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json',
    },
  },
  moduleFileExtensions: ['ts', 'js'],
  // 커버리지 활성화
  collectCoverage: true,
  // 어떤 파일을 커버리지 대상으로 볼지
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/main.ts', // 서버 시작 파일 제외
    '!src/**/*.d.ts',
    '!src/socket.ts',
    '!src/lib/**',
    '!src/controllers/errorController.ts',
    '!src/controllers/imagesController.ts',
    '!src/middlewares/**',
    '!src/services/imageService.ts',
    '!src/structs/**',
  ],
  // 결과물 위치
  coverageDirectory: 'coverage',
  // 리포트 형식
  coverageReporters: ['text', 'html'],
};
