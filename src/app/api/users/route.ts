import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../middleware/auth';
import { withRateLimit } from '../middleware/rateLimit';
import bcrypt from 'bcrypt';
import { RegisterRequest, UserResponse, ErrorResponse } from '@/app/types/user';
import { getD1Database } from '@/lib/database';

// 邮箱格式验证正则
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// 密码强度验证正则（至少8位，包含大小写字母和数字）
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

// GET请求处理程序 - 获取所有用户（仅用于测试）
async function GETHandler(request: NextRequest) {
  try {
    const db = getD1Database();
    const result = await db.prepare('SELECT UserId, UserName, email, createdAt FROM Users').all();

    // 格式化响应数据
    const safeUsers = result.results.map(user => ({
      id: user.userId as string,
      username: user.userName as string,
      email: user.email as string,
      createdAt: user.createdAt as string,
      updatedAt: user.updatedAt as string
    }));

    return NextResponse.json<UserResponse[]>(safeUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json<ErrorResponse>({
      error: 'An error occurred while fetching users',
      status: 500
    }, { status: 500 });
  }
}

// 注册用户处理程序
async function registerHandler(request: NextRequest): Promise<NextResponse<UserResponse | ErrorResponse>> {
  try {
    const body: RegisterRequest = await request.json();

    // 验证请求体
    if (!body || typeof body !== 'object') {
      return NextResponse.json<ErrorResponse>({ error: 'Invalid request body', status: 400 }, { status: 400 });
    }

    // 验证用户名
    if (!body.username || typeof body.username !== 'string' || body.username.trim().length < 3) {
      return NextResponse.json<ErrorResponse>({ error: 'Username must be at least 3 characters', status: 400 }, { status: 400 });
    }

    // 验证邮箱
    if (!body.email || typeof body.email !== 'string' || !emailRegex.test(body.email)) {
      return NextResponse.json<ErrorResponse>({ error: 'Invalid email format', status: 400 }, { status: 400 });
    }

    // 验证密码
    if (!body.password || typeof body.password !== 'string' || !passwordRegex.test(body.password)) {
      return NextResponse.json<ErrorResponse>({
        error: 'Password must be at least 8 characters and include uppercase, lowercase and numbers',
        status: 400
      }, { status: 400 });
    }

    // 验证确认密码
    if (body.password !== body.confirmPassword) {
      return NextResponse.json<ErrorResponse>({ error: 'Passwords do not match', status: 400 }, { status: 400 });
    }
    
    const db = getD1Database();

    // 检查用户是否已存在
    const emailCheck = await db.prepare('SELECT * FROM Users WHERE email = ?').bind(body.email.trim()).first();
    if (emailCheck) {
      return NextResponse.json<ErrorResponse>({ error: 'User with this email already exists', status: 409 }, { status: 409 });
    }

    const usernameCheck = await db.prepare('SELECT * FROM Users WHERE UserName = ?').bind(body.username.trim()).first();
    if (usernameCheck) {
      return NextResponse.json<ErrorResponse>({ error: 'Username already taken', status: 409 }, { status: 409 });
    }

    // 密码哈希
    const passwordHash = await bcrypt.hash(body.password, 10);

    // 创建新用户
    const now = new Date().toISOString();
    const result = await db
      .prepare('INSERT INTO Users (UserName, email, passwordHash, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)')
      .bind(body.username.trim(), body.email.trim(), passwordHash, now, now)
      .run();

    // 获取插入的用户ID
    const userId = result.meta.lastInsertRowid;

    // 返回安全的用户数据
    const safeUser: UserResponse = {
      id: userId as string,
      username: body.username.trim(),
      email: body.email.trim(),
      createdAt: now,
      updatedAt: now
    };

    return NextResponse.json<UserResponse>(safeUser, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json<ErrorResponse>({
      error: 'An error occurred during registration',
      status: 500
    }, { status: 500 });
  }
}

// 导出路由处理程序
// 注意：实际注册接口通常不需要鉴权
// export const GET = withAuth(GETHandler);
export const GET = GETHandler;
// 使用速率限制中间件包装注册处理程序
// 不使用auth中间件，因为注册接口应该对未认证用户开放
export const POST = withRateLimit(registerHandler);