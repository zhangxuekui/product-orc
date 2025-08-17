// test-jwt-auth.js
// 这个脚本用于测试JWT认证保护的接口

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// 配置
const BASE_URL = 'http://localhost:3000';
const LOGIN_ENDPOINT = '/api/auth/login';
const UPLOAD_ENDPOINT = '/api/upload';
const DATA_ENDPOINT = '/api/data';
const TEST_EMAIL = 'test@example.com'; // 替换为实际的测试用户邮箱
const TEST_PASSWORD = 'Password123'; // 替换为实际的测试用户密码
const TEST_FILE_PATH = './test-upload.jpg'; // 替换为实际的测试文件路径

// 登录获取JWT令牌
async function login() {
  try {
    const response = await fetch(`${BASE_URL}${LOGIN_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.token) {
      console.error('登录失败:', data.error || '未知错误');
      return null;
    }

    console.log('登录成功，获取到JWT令牌');
    return data.token;
  } catch (error) {
    console.error('登录请求发生错误:', error);
    return null;
  }
}

// 测试上传接口
async function testUpload(token) {
  if (!token) {
    console.error('没有提供JWT令牌，无法测试上传接口');
    return;
  }

  try {
    // 检查测试文件是否存在
    if (!fs.existsSync(TEST_FILE_PATH)) {
      console.error(`测试文件不存在: ${TEST_FILE_PATH}`);
      return;
    }

    const formData = new FormData();
    const fileStream = fs.createReadStream(TEST_FILE_PATH);
    formData.append('file', fileStream, path.basename(TEST_FILE_PATH));

    const response = await fetch(`${BASE_URL}${UPLOAD_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('上传失败:', data.error || '未知错误');
      return;
    }

    console.log('上传成功:', data);
  } catch (error) {
    console.error('上传请求发生错误:', error);
  }
}

// 测试数据接口
async function testData(token) {
  if (!token) {
    console.error('没有提供JWT令牌，无法测试数据接口');
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}${DATA_ENDPOINT}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('获取数据失败:', data.error || '未知错误');
      return;
    }

    console.log('获取数据成功:', data);
  } catch (error) {
    console.error('数据请求发生错误:', error);
  }
}

// 测试无令牌访问
async function testNoToken() {
  console.log('\n测试无令牌访问:');

  // 测试上传接口
  try {
    const formData = new FormData();
    formData.append('file', 'dummy content', 'test.txt');

    const response = await fetch(`${BASE_URL}${UPLOAD_ENDPOINT}`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (response.status === 401) {
      console.log('上传接口: 正确拒绝了无令牌访问');
    } else {
      console.error('上传接口: 未能正确拒绝无令牌访问，状态码:', response.status);
    }
  } catch (error) {
    console.error('无令牌上传测试发生错误:', error);
  }

  // 测试数据接口
  try {
    const response = await fetch(`${BASE_URL}${DATA_ENDPOINT}`, {
      method: 'GET',
    });

    const data = await response.json();

    if (response.status === 401) {
      console.log('数据接口: 正确拒绝了无令牌访问');
    } else {
      console.error('数据接口: 未能正确拒绝无令牌访问，状态码:', response.status);
    }
  } catch (error) {
    console.error('无令牌数据测试发生错误:', error);
  }
}

// 执行测试
async function runTests() {
  console.log('开始JWT认证测试...\n');

  // 测试无令牌访问
  await testNoToken();

  // 登录获取令牌
  const token = await login();
  if (!token) {
    console.error('无法获取JWT令牌，测试终止');
    return;
  }

  // 测试上传接口
  console.log('\n测试上传接口:');
  await testUpload(token);

  // 测试数据接口
  console.log('\n测试数据接口:');
  await testData(token);

  console.log('\nJWT认证测试完成');
}

// 运行测试
runTests().catch(console.error);

// 使用说明:
// 1. 确保服务器正在运行: npm run dev
// 2. 修改配置部分的测试用户邮箱、密码和测试文件路径
// 3. 执行脚本: node test-jwt-auth.js
// 4. 观察输出结果，确认JWT认证是否正常工作