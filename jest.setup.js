/**
 * Jest setup file
 * Used to configure testing environment before tests run
 */

// Add test helpers
import '@testing-library/jest-dom';

// Mock environment variables
process.env.API_KEYS = 'test_key1,test_key2';

// Global mocks
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    };
  },
}));

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn(() => ({
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    })),
  },
}));