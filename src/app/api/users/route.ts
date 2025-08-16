import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../middleware/auth';
import { withRateLimit } from '../middleware/rateLimit';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { RegisterRequest, UserResponse, ErrorResponse } from '@/app/types/user';

// 模拟用户数据库（实际应用中应使用真实数据库）
const users: { id: string; username: string; email: string; passwordHash: string; createdAt: string; updatedAt: string }[] = [];

// 邮箱格式验证正则
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// 密码强度验证正则（至少8位，包含大小写字母和数字）
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

// GET请求处理程序 - 获取所有用户（仅用于测试）
async function GETHandler(request: NextRequest) {
  // 返回用户数据，但不包含密码哈希
  const safeUsers = users.map(user => ({
    id: user.id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt
  }));
  return NextResponse.json(safeUsers);
}

// 注册用户处理程序
async function registerHandler(request: NextRequest): Promise<NextResponse<UserResponse | ErrorResponse>> {
  try {
    const body: RegisterRequest = await request.json();

    // 验证请求体
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body', status: 400 }, { status: 400 });
    }

    // 验证用户名
    if (!body.username || typeof body.username !== 'string' || body.username.trim().length < 3) {
      return NextResponse.json({ error: 'Username must be at least 3 characters', status: 400 }, { status: 400 });
    }

    // 验证邮箱
    if (!body.email || typeof body.email !== 'string' || !emailRegex.test(body.email)) {
      return NextResponse.json({ error: 'Invalid email format', status: 400 }, { status: 400 });
    }

    // 验证密码
    if (!body.password || typeof body.password !== 'string' || !passwordRegex.test(body.password)) {
      return NextResponse.json({
        error: 'Password must be at least 8 characters and include uppercase, lowercase and numbers',
        status: 400
      }, { status: 400 });
    }

    // 验证确认密码
    if (body.password !== body.confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match', status: 400 }, { status: 400 });
    }

    // 检查用户是否已存在
    if (users.some(user => user.email === body.email)) {
      return NextResponse.json({ error: 'User with this email already exists', status: 409 }, { status: 409 });
    }

    if (users.some(user => user.username === body.username)) {
      return NextResponse.json({ error: 'Username already taken', status: 409 }, { status: 409 });
    }

    // 密码哈希
    const passwordHash = await bcrypt.hash(body.password, 10);

    // 创建新用户
    const now = new Date().toISOString();
    const newUser = {
      id: uuidv4(),
      username: body.username.trim(),
      email: body.email.trim(),
      passwordHash,
      createdAt: now,
      updatedAt: now
    };

    // 保存用户（在实际应用中应保存到数据库）
    users.push(newUser);

    // 返回安全的用户数据（不包含密码哈希）
    const safeUser: UserResponse = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      createdAt: newUser.createdAt
    };

    return NextResponse.json(safeUser, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({
      error: 'An error occurred during registration',
      status: 500
    }, { status: 500 });
  }
}

// 导出路由处理程序，添加鉴权和速率限制
// 注意：实际注册接口通常不需要鉴权
// export const GET = withAuth(GETHandler);
export const GET = GETHandler;
// 使用速率限制中间件包装注册处理程序
// 不使用auth中间件，因为注册接口应该对未认证用户开放
// 但实际项目中可能需要根据需求决定是否添加auth
// export const POST = withRateLimit(withAuth(registerHandler));
export const POST = withRateLimit(registerHandler);