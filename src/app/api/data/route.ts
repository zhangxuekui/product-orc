import { NextResponse } from 'next/server';

// 示例数据
const sampleData = [
  { id: 1, name: '产品A', price: 100 },
  { id: 2, name: '产品B', price: 200 },
  { id: 3, name: '产品C', price: 300 },
];

// GET请求处理程序
export async function GET() {
  // 可以在这里添加数据库查询或其他数据处理逻辑
  return NextResponse.json(sampleData);
}

// POST请求处理程序
export async function POST(request: Request) {
  try {
    const data = await request.json();
    // 这里可以添加数据验证和存储逻辑
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid data'+error }, { status: 400 });
  }
}