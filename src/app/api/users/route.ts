import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../middleware/auth';

// 示例用户数据
const users = [
  { id: 1, name: '张三', email: 'zhangsan@example.com' },
  { id: 2, name: '李四', email: 'lisi@example.com' },
];

// GET请求处理程序 - 获取所有用户
async function GETHandler(request: NextRequest) {
  return NextResponse.json(users);
}

export const GET = withAuth(GETHandler);

// POST请求处理程序 - 创建新用户
async function POSTHandler(request: NextRequest) {
  try {
    const newUser = await request.json();
    
    // 确保newUser是一个有效的对象
    if (typeof newUser !== 'object' || newUser === null) {
      return NextResponse.json({ error: 'Invalid user data format' }, { status: 400 });
    }
    
    // 这里可以添加数据验证和存储逻辑
    const userWithId = { ...newUser as object, id: users.length + 1 };
    // 确保新用户包含必要的属性
    if ('name' in newUser && 'email' in newUser && typeof newUser.name === 'string' && typeof newUser.email === 'string') {
      users.push(userWithId as { id: number; name: string; email: string });
    } else {
      return NextResponse.json({ error: 'User data must include name and email of string type' }, { status: 400 });
    }
    return NextResponse.json(userWithId, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid user data' }, { status: 400 });
  }
}

export const POST = withAuth(POSTHandler);