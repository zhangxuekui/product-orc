// init-db.js
// 初始化D1数据库脚本

/**
 * 获取D1数据库实例
 * @returns D1数据库实例
 */
function getD1Database() {
  // 在wrangler环境中，直接从全局环境获取DB实例
  if (typeof globalThis !== 'undefined' && 'env' in globalThis && 'DB' in globalThis.env) {
    return globalThis.env.DB;
  }

  throw new Error('数据库连接未找到，请确保环境变量DB已设置');
}

/**
 * 初始化数据库
 * 创建Users表（如果不存在）
 */
async function initDatabase() {
  try {
    console.log('开始初始化数据库...');
    const db = getD1Database();

    // 创建Users表
    await db.exec(`
      DROP TABLE IF EXISTS Users;
      CREATE TABLE Users (
        UserId INTEGER PRIMARY KEY AUTOINCREMENT,
        UserName TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        passwordHash TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `);

    console.log('数据库初始化成功！Users表已创建');
  } catch (error) {
    console.error('数据库初始化失败:', error);
    process.exit(1);
  }
}

// 运行初始化
initDatabase();

// 使用说明:
// 1. 确保已安装wrangler: npm install -g wrangler
// 2. 登录Cloudflare: wrangler login
// 3. 执行脚本: wrangler script run init-db.js