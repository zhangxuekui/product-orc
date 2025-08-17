// 测试D1数据库上下文获取

// 使用CommonJS语法

// 导入必要的函数
const { getD1Database } = require('./src/lib/database');

/**
 * 测试数据库连接
 */
async function testDatabaseConnection() {
  try {
    console.log('测试获取数据库实例...');
    const db = getD1Database();
    console.log('成功获取数据库实例');

    // 执行简单查询
    console.log('执行查询...');
    const result = await db.prepare('SELECT * FROM Users').all();
    console.log('查询结果:', result);

    return {
      success: true,
      data: result.results
    };
  } catch (error) {
    console.error('数据库连接测试失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// 运行测试
console.log('开始测试...');
testDatabaseConnection()
  .then(result => {
    console.log('测试完成:', result);
  })
  .catch(error => {
    console.error('测试异常:', error);
  });

// 使用说明:
// 1. 确保已安装依赖: npm install
// 2. 编译TypeScript: npx tsc
// 3. 运行测试: node dist/test-db-context.js