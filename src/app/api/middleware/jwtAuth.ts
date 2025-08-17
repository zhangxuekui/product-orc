import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

/**
 * JWT认证中间件
 * @param request 请求对象
 * @returns 认证结果对象，包含认证状态、用户信息和可能的错误信息
 */
export async function jwtAuthMiddleware(request: NextRequest): Promise<{
  isAuthenticated: boolean;
  user?: {
    userId: string;
    email: string;
    username: string;
  };
  error?: string;
}> {
  // 获取JWT密钥
  const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret-key';

  const authHeader = request.headers.get('Authorization');

  if (!authHeader) {
    return {
      isAuthenticated: false,
      error: 'Authorization header is required'
    };
  }

  // 提取JWT令牌 (格式为: Bearer <token>)
  const [authType, token] = authHeader.split(' ');

  if (authType !== 'Bearer' || !token) {
    return {
      isAuthenticated: false,
      error: 'Invalid authorization format. Use: Bearer <token>'
    };
  }

  try {
    // 验证JWT令牌
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      username: string;
      iat: number;
      exp: number;
    };

    // 检查令牌是否过期
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp < now) {
      return {
        isAuthenticated: false,
        error: 'JWT token has expired'
      };
    }

    return {
      isAuthenticated: true,
      user: {
        userId: decoded.userId,
        email: decoded.email,
        username: decoded.username
      }
    };
  } catch (error) {
    return {
      isAuthenticated: false,
      error: 'Invalid or corrupted JWT token'
    };
  }
}

/**
 * 包装API处理函数，添加JWT认证
 * @param handler API处理函数
 * @returns 包装后的API处理函数
 */
export function withJwtAuth(
  handler: (request: NextRequest, user?: {
    userId: string;
    email: string;
    username: string;
  }) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const authResult = await jwtAuthMiddleware(request);

    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    return handler(request, authResult.user);
  };
}