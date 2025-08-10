// 测试API鉴权功能的脚本
// 可以使用Node.js运行: node test-api-auth.js

const axios = require('axios');

// 测试配置
const API_URL = 'http://localhost:3001/api/data';
const VALID_API_KEY = 'api_key_1'; // 与.env文件中的密钥匹配
const INVALID_API_KEY = 'invalid_key';

// 测试函数
async function testApiAuth() {
  console.log('===== 测试API鉴权 =====\n');

  // 测试1: 不提供API密钥
  console.log('测试1: 不提供API密钥');
  try {
    await axios.get(API_URL);
  } catch (error) {
    console.log('结果:', error.response.data);
  }
  console.log('\n------------------------\n');

  // 测试2: 提供无效的API密钥
  console.log('测试2: 提供无效的API密钥');
  try {
    await axios.get(API_URL, {
      headers: { 'Authorization': `Bearer ${INVALID_API_KEY}` }
    });
  } catch (error) {
    console.log('结果:', error.response.data);
  }
  console.log('\n------------------------\n');

  // 测试3: 提供有效的API密钥
  console.log('测试3: 提供有效的API密钥');
  try {
    const response = await axios.get(API_URL, {
      headers: { 'Authorization': `Bearer ${VALID_API_KEY}` }
    });
    console.log('结果:', response.data);
  } catch (error) {
    console.log('错误:', error.response.data);
  }
  console.log('\n------------------------\n');

  // 测试4: 使用有效密钥发送POST请求
  console.log('测试4: 使用有效密钥发送POST请求');
  try {
    const response = await axios.post(
      API_URL,
      { id: 4, name: '新产品', price: 400 },
      { headers: { 'Authorization': `Bearer ${VALID_API_KEY}` } }
    );
    console.log('结果:', response.data);
  } catch (error) {
    console.log('错误:', error.response.data);
  }
}

// 运行测试
testApiAuth().catch(console.error);