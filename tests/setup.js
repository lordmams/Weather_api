// Jest setup file
process.env.NODE_ENV = 'test';
process.env.REDIS_DISABLED = 'true';

// Suppress console logs during tests unless there's an error
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
}); 