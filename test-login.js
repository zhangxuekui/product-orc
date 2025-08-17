// 测试登录接口
const fetch = require('node-fetch');

/**
 * 测试登录功能
 */
async function testLogin() {
  try {
    const email = 'test@example.com'; // 替换为已注册的邮箱
    const password = 'Test1234'; // 替换为对应的密码

    console.log(`开始测试登录: ${email}`);

    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password
      }),
    });

    const data = await response.json();

    console.log('登录响应:', data);

    if (response.ok && data.success) {
      console.log('登录测试成功!');
      console.log('获取到的令牌:', data.token);
      console.log('用户信息:', data.user);
      return true;
    } else {
      console.error('登录测试失败:', data.error || data.message);
      return false;
    }
  } catch (error) {
    console.error('测试过程中发生错误:', error);
    return false;
  }
}

testLogin();

// 使用说明:
// 1. 确保Next.js服务器正在运行: npm run dev
// 2. 确保已经注册了测试用户
// 3. 修改脚本中的email和password为已注册用户的凭据
// 4. 运行命令: node test-login.js
// 5. 查看输出结果