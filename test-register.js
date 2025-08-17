// test-register.js
// 这个脚本用于测试使用D1数据库的用户注册接口

const { default: request } = require('supertest');
const { createServer } = require('node:http');
const { NextResponse } = require('next/server');
const { appRouter } = require('./src/app/api/users/route');

// 临时服务器设置
const server = createServer((req, res) => {
  // 模拟Next.js请求处理
  const nextRequest = new Request(`http://localhost:3000${req.url}`, {
    method: req.method,
    headers: req.headers,
    body: req,
  });

  // 处理请求
  appRouter
    .handle(nextRequest)
    .then((response) => {
      // 设置响应头
      res.statusCode = response.status;
      for (const [key, value] of response.headers.entries()) {
        res.setHeader(key, value);
      }
      // 发送响应体
      response.body.pipe(res);
    })
    .catch((error) => {
      console.error('Server error:', error);
      res.statusCode = 500;
      res.end(JSON.stringify({ error: 'Internal server error' }));
    });
});

// 测试函数
async function runTests() {
  console.log('开始测试用户注册接口(D1数据库)...');

  // 测试1: 正常注册
  try {
    const testUser = {
      username: 'testuser' + Math.floor(Math.random() * 10000),
      email: 'test' + Math.floor(Math.random() * 10000) + '@example.com',
      password: 'Test1234',
      confirmPassword: 'Test1234'
    };

    console.log('测试1: 正常注册 - 用户名:', testUser.username);
    const response = await request(server)
      .post('/api/users')
      .send(testUser)
      .expect('Content-Type', /json/);

    if (response.status === 201) {
      console.log('✓ 测试1通过: 注册成功');
      console.log('  响应数据:', response.body);
    } else {
      console.log('✗ 测试1失败: 状态码不正确', response.status);
    }
  } catch (error) {
    console.log('✗ 测试1失败:', error.message);
  }

  // 测试2: 密码不匹配
  try {
    const testUser = {
      username: 'testuser' + Math.floor(Math.random() * 10000),
      email: 'test' + Math.floor(Math.random() * 10000) + '@example.com',
      password: 'Test1234',
      confirmPassword: 'Different123'
    };

    console.log('测试2: 密码不匹配');
    const response = await request(server)
      .post('/api/users')
      .send(testUser)
      .expect('Content-Type', /json/)
      .expect(400);

    console.log('✓ 测试2通过: 正确返回错误', response.body.error);
  } catch (error) {
    console.log('✗ 测试2失败:', error.message);
  }

  // 测试3: 密码强度不足
  try {
    const testUser = {
      username: 'testuser' + Math.floor(Math.random() * 10000),
      email: 'test' + Math.floor(Math.random() * 10000) + '@example.com',
      password: 'weak',
      confirmPassword: 'weak'
    };

    console.log('测试3: 密码强度不足');
    const response = await request(server)
      .post('/api/users')
      .send(testUser)
      .expect('Content-Type', /json/)
      .expect(400);

    console.log('✓ 测试3通过: 正确返回错误', response.body.error);
  } catch (error) {
    console.log('✗ 测试3失败:', error.message);
  }

  // 测试4: 邮箱已存在
  try {
    const testUser = {
      username: 'testuser' + Math.floor(Math.random() * 10000),
      email: 'testunique@example.com',
      password: 'Test1234',
      confirmPassword: 'Test1234'
    };

    console.log('测试4: 邮箱已存在');
    // 先注册一个用户
    await request(server).post('/api/users').send(testUser);
    // 尝试使用相同邮箱注册
    const response = await request(server)
      .post('/api/users')
      .send({
        ...testUser,
        username: 'anotheruser' + Math.floor(Math.random() * 10000)
      })
      .expect('Content-Type', /json/)
      .expect(409);

    console.log('✓ 测试4通过: 正确返回错误', response.body.error);
  } catch (error) {
    console.log('✗ 测试4失败:', error.message);
  }

  // 测试5: 测试防刷功能
  try {
    console.log('测试5: 防刷功能测试 - 连续发送6个请求');
    const testUser = {
      username: 'testuser' + Math.floor(Math.random() * 10000),
      email: 'test' + Math.floor(Math.random() * 10000) + '@example.com',
      password: 'Test1234',
      confirmPassword: 'Test1234'
    };

    // 发送5个请求，应该都成功
    for (let i = 1; i <= 5; i++) {
      const response = await request(server)
        .post('/api/users')
        .send(testUser);
      console.log(`  第${i}个请求: 状态码`, response.status);
    }

    // 第6个请求应该被限流
    const response = await request(server)
      .post('/api/users')
      .send(testUser);

    if (response.status === 429) {
      console.log('✓ 测试5通过: 第6个请求被正确限流', response.body.error);
    } else {
      console.log('✗ 测试5失败: 第6个请求未被限流，状态码', response.status);
    }
  } catch (error) {
    console.log('✗ 测试5失败:', error.message);
  }

  // 关闭服务器
  server.close(() => {
    console.log('测试完成，服务器已关闭');
  });
}

// 运行测试
runTests();

// 注意：由于Next.js和D1数据库的特性，这个测试脚本可能需要在Cloudflare Workers环境中运行，
// 或者使用Wrangler CLI执行: wrangler script run test-register.js
// 实际项目中，建议使用Jest等测试框架结合适当的Next.js和Cloudflare测试工具进行测试