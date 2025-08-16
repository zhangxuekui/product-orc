// 测试图片上传到R2存储桶的脚本
const fs = require('fs');
const path = require('path');
const supertest = require('supertest');

// 运行测试
async function runTest() {
  console.log('开始测试图片上传...');

  try {
    // 测试图片路径
    const testImagePath = path.join(__dirname, 'public', 'images', 'unnamed.jpg');
    console.log(`测试图片路径: ${testImagePath}`);

    // 检查测试图片是否存在
    if (!fs.existsSync(testImagePath)) {
      console.error(`错误: 测试图片不存在于路径 ${testImagePath}`);
      process.exit(1);
    }
    console.log('测试图片存在，开始上传...');

    console.log('正在使用supertest上传图片...');
    const request = supertest('http://localhost:3000');
    console.log('创建supertest请求对象成功');

    const response = await request
      .post('/api/upload')
      .attach('file', testImagePath)
      .set('Accept', 'application/json');

    console.log('上传响应状态码:', response.status);
    console.log('上传响应体:', JSON.stringify(response.body, null, 2));

    if (response.status === 200 && response.body.success) {
      console.log('测试成功! 图片URL:', response.body.url);
      console.log('生成的唯一文件名:', response.body.fileName);
      process.exit(0);
    } else {
      console.error('测试失败! 状态码:', response.status);
      console.error('错误信息:', response.body.message || response.body.error || '未知错误');
      process.exit(1);
    }
  } catch (error) {
    console.error('测试过程中发生错误:', error);
    console.error('错误堆栈:', error.stack);
    process.exit(1);
  }
}

// 运行测试
runTest();