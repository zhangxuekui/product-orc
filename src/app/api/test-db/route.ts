// src/app/api/test-db/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getD1Database } from '@/lib/database';

// GET请求处理程序 - 测试数据库连接
async function GETHandler(request: NextRequest) {
  try {
    console.log('测试获取数据库实例...');
    const db = getD1Database();
    console.log('成功获取数据库实例');

    // 执行简单查询
    console.log('执行查询...');
    const result = await db.prepare('SELECT * FROM Users').all();
    console.log('查询结果:', result);

    return NextResponse.json({
      success: true,
      data: result.results,
      message: '数据库连接测试成功'
    });
  } catch (error) {
    console.error('数据库连接测试失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      message: '数据库连接测试失败'
    }, {
      status: 500
    });
  }
}

export { GETHandler as GET };

// 使用说明:
// 1. 启动Next.js服务器: npm run dev
// 2. 在浏览器中访问: http://localhost:3000/api/test-db