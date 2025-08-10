import { authMiddleware } from './auth';
import { NextRequest } from 'next/server';

describe('authMiddleware', () => {
  // 测试环境变量中的API密钥
  beforeEach(() => {
    process.env.API_KEYS = 'valid_key1,valid_key2';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // 测试缺少Authorization头
  test('should return not authenticated when no Authorization header', async () => {
    const request = new NextRequest('http://localhost:3000/api/data', {
      headers: {}
    });

    const result = await authMiddleware(request);

    expect(result.isAuthenticated).toBe(false);
    expect(result.error).toBe('Authorization header is required');
  });

  // 测试无效的Authorization格式
  test('should return not authenticated when invalid Authorization format', async () => {
    const request = new NextRequest('http://localhost:3000/api/data', {
      headers: {
        Authorization: 'InvalidFormat valid_key1'
      }
    });

    const result = await authMiddleware(request);

    expect(result.isAuthenticated).toBe(false);
    expect(result.error).toBe('Invalid authorization format. Use: Bearer <api_key>');
  });

  // 测试无效的API密钥
  test('should return not authenticated when invalid API key', async () => {
    const request = new NextRequest('http://localhost:3000/api/data', {
      headers: {
        Authorization: 'Bearer invalid_key'
      }
    });

    const result = await authMiddleware(request);

    expect(result.isAuthenticated).toBe(false);
    expect(result.error).toBe('Invalid API key');
  });

  // 测试有效的API密钥
  test('should return authenticated when valid API key', async () => {
    const request = new NextRequest('http://localhost:3000/api/data', {
      headers: {
        Authorization: 'Bearer valid_key1'
      }
    });

    const result = await authMiddleware(request);

    expect(result.isAuthenticated).toBe(true);
    expect(result.error).toBeUndefined();
  });

  // 测试环境变量未设置
  test('should handle when API_KEYS environment variable is not set', async () => {
    delete process.env.API_KEYS;

    const request = new NextRequest('http://localhost:3000/api/data', {
      headers: {
        Authorization: 'Bearer api_key_1'
      }
    });

    const result = await authMiddleware(request);

    expect(result.isAuthenticated).toBe(true);
    expect(result.error).toBeUndefined();
  });
});