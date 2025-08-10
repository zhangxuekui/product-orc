import { GET, POST } from './route';
import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { authMiddleware } from '../middleware/auth';

// 模拟authMiddleware
// 该导入已存在，移除重复导入
// 此导入已存在，移除该行以避免重复导入

jest.mock('../middleware/auth', () => ({
  authMiddleware: jest.fn(),
  withAuth: jest.fn((handler: (request: NextRequest) => Promise<NextResponse>) => handler),
}));

// 模拟NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn(() => ({})),
  },
}));

describe('Users API Routes', () => {
  // 保存原始用户数据，用于测试后恢复
  let originalUsers: any[];

  beforeAll(() => {
    // 保存原始用户数据
    const module = require('./route');
    originalUsers = [...module.users];
  });

  afterEach(() => {
    jest.clearAllMocks();
    // 恢复原始用户数据
    const module = require('./route');
    module.users = [...originalUsers];
  });

  // GET请求测试
  describe('GET', () => {
    test('should return all users when authenticated', async () => {
      // 设置鉴权通过
      (authMiddleware as jest.Mock).mockResolvedValueOnce({ isAuthenticated: true });

      const request = new NextRequest('http://localhost:3000/api/users');

      await GET(request);

      expect(NextResponse.json).toHaveBeenCalledWith([
        { id: 1, name: '张三', email: 'zhangsan@example.com' },
        { id: 2, name: '李四', email: 'lisi@example.com' },
      ]);
    });

    test('should return 401 when not authenticated', async () => {
      // 设置鉴权失败
      (authMiddleware as jest.Mock).mockResolvedValueOnce({
        isAuthenticated: false,
        error: 'Invalid API key'
      });

      const request = new NextRequest('http://localhost:3000/api/users');

      await GET(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    });
  });

  // POST请求测试
  describe('POST', () => {
    test('should create new user when valid data provided', async () => {
      // 设置鉴权通过
      (authMiddleware as jest.Mock).mockResolvedValueOnce({ isAuthenticated: true });

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: '王五', email: 'wangwu@example.com' }),
      });

      await POST(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { id: 3, name: '王五', email: 'wangwu@example.com' },
        { status: 201 }
      );

      // 验证用户已添加
      const module = require('./route');
      expect(module.users.length).toBe(3);
      expect(module.users[2]).toEqual({
        id: 3, name: '王五', email: 'wangwu@example.com'
      });
    });

    test('should return 400 when invalid data format provided', async () => {
      // 设置鉴权通过
      (authMiddleware as jest.Mock).mockResolvedValueOnce({ isAuthenticated: true });

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify('not an object'),
      });

      await POST(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Invalid user data format' },
        { status: 400 }
      );
    });

    test('should return 400 when required fields missing', async () => {
      // 设置鉴权通过
      (authMiddleware as jest.Mock).mockResolvedValueOnce({ isAuthenticated: true });

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: '赵六' }), // 缺少email
      });

      await POST(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'User data must include name and email of string type' },
        { status: 400 }
      );
    });

    test('should return 400 when invalid data type provided', async () => {
      // 设置鉴权通过
      (authMiddleware as jest.Mock).mockResolvedValueOnce({ isAuthenticated: true });

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: '钱七', email: 12345 }), // email不是字符串
      });

      await POST(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'User data must include name and email of string type' },
        { status: 400 }
      );
    });

    test('should return 401 when not authenticated', async () => {
      // 设置鉴权失败
      (authMiddleware as jest.Mock).mockResolvedValueOnce({
        isAuthenticated: false,
        error: 'Authorization header is required'
      });

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: '孙八', email: 'sunba@example.com' }),
      });

      await POST(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Authorization header is required' },
        { status: 401 }
      );
    });
  });
});