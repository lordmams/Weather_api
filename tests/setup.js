// Jest setup file
process.env.NODE_ENV = 'test';
process.env.REDIS_DISABLED = 'true';

// Suppress console logs during tests but allow console.error for debugging
const originalConsoleLog = console.log;

beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
}); 