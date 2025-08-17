// 测试D1数据库连接 - TypeScript版本

// 导入我们的数据库工具函数
import { getD1Database } from './src/lib/database';

/**
 * 测试D1数据库连接
 */
async function testDatabaseConnection() {
  try {
    console.log('开始测试数据库连接...');

    // 使用我们的工具函数获取数据库实例
    const db = getD1Database();
    console.log('成功获取数据库实例');

    // 执行简单查询
    const result = await db.prepare('SELECT 1 + 1 AS result').all();
    console.log('查询结果:', result);
    console.log('数据库连接测试成功！');

  } catch (error) {
    console.error('数据库连接测试失败:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

testDatabaseConnection();

// 使用说明:
// 1. 确保已安装必要的依赖: npm install -g ts-node
// 2. 运行命令: ts-node test-db-connection.ts
// 3. 查看输出结果
// 注意: 此脚本需要在Next.js开发环境中运行，确保环境变量已加载