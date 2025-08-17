// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit } from '../../middleware/rateLimit';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ErrorResponse } from '@/app/types/user';
import { getD1Database } from '@/lib/database';

// 登录请求体类型
interface LoginRequest {
  email: string;
  password: string;
}

// 登录响应类型
interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

// 获取JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret-key';
const JWT_EXPIRES_IN = '24h'; // 令牌有效期

// 登录处理程序
async function loginHandler(request: NextRequest): Promise<NextResponse<LoginResponse | ErrorResponse>> {
  try {
    const body: LoginRequest = await request.json();

    // 验证请求体
    if (!body || typeof body !== 'object') {
      return NextResponse.json<ErrorResponse>({
        error: 'Invalid request body',
        status: 400
      }, { status: 400 });
    }

    // 验证邮箱和密码
    if (!body.email || typeof body.email !== 'string') {
      return NextResponse.json<ErrorResponse>({
        error: 'Email is required',
        status: 400
      }, { status: 400 });
    }

    if (!body.password || typeof body.password !== 'string') {
      return NextResponse.json<ErrorResponse>({
        error: 'Password is required',
        status: 400
      }, { status: 400 });
    }

    const db = getD1Database();

    // 查找用户
    const user = await db.prepare('SELECT UserId, UserName, email, passwordHash FROM Users WHERE email = ?')
      .bind(body.email.trim())
      .first();

    if (!user) {
      return NextResponse.json<ErrorResponse>({
        error: 'Invalid email or password',
        status: 401
      }, { status: 401 });
    }

    // 验证密码
    const passwordMatch = await bcrypt.compare(body.password, user.passwordHash as string);

    if (!passwordMatch) {
      return NextResponse.json<ErrorResponse>({
        error: 'Invalid email or password',
        status: 401
      }, { status: 401 });
    }

    // 生成JWT令牌
    const token = jwt.sign(
      {
        userId: user.UserId,
        email: user.email,
        username: user.UserName
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN
      }
    );

    return NextResponse.json<LoginResponse>({
      success: true,
      message: 'Login successful',
      token: token,
      user: {
        id: user.UserId as string,
        username: user.UserName as string,
        email: user.email as string
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json<ErrorResponse>({
      error: 'An error occurred during login',
      status: 500
    }, { status: 500 });
  }
}

// 导出路由处理程序，使用速率限制中间件
export const POST = withRateLimit(loginHandler);

// 使用说明:
// 1. 发送POST请求到 /api/auth/login
// 2. 请求体格式: { "email": "user@example.com", "password": "password123" }
// 3. 成功响应: { "success": true, "message": "Login successful", "token": "...", "user": { ... } }
// 4. 错误响应: { "error": "...", "status": 4xx }
// 注意: 实际应用中应该实现JWT令牌生成和验证逻辑