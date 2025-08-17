// 简单的HTTP服务器测试脚本 - 符合Cloudflare Workers模块格式

/**
 * 处理请求的函数
 */
async function handleRequest(request, env) {
  try {
    // 从环境参数中获取DB实例
    if (env && 'DB' in env) {
      const db = env.DB;
      console.log('成功获取数据库实例');
      
      // 执行简单查询
      const result = await db.prepare('SELECT * FROM Users').all();
      console.log('查询结果:', result);
      
      return new Response(JSON.stringify({
        success: true,
        data: result.results
      }), {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } else {
      throw new Error('未找到数据库实例');
    }
  } catch (error) {
    console.error('数据库连接测试失败:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

// 导出默认对象，符合Cloudflare Workers模块格式
export default {
  fetch: handleRequest
};

// 使用说明:
// 1. 启动服务器: wrangler dev test-server.js
// 2. 在浏览器中访问: http://localhost:8787