/**
 * 测试imageToBase64函数 - 支持本地和网络图片
 */
import imageToBase64 from './src/app/imageToBase64.js';

// 测试本地图片
async function testLocalImage() {
  try {
    console.log('测试本地图片转换...');
    const base64 = await imageToBase64('public/images/unnamed.jpg');
    console.log('本地图片转换成功!');
    console.log('Base64前100个字符:', base64.substring(0, 100));
  } catch (error) {
    console.error('本地图片转换失败:', error.message);
  }
}

// 测试网络图片
async function testNetworkImage() {
  try {
    console.log('\n测试网络图片转换...');
    // 使用一个更可靠的测试图片URL
    const imageUrl = 'https://picsum.photos/150';
    const base64 = await imageToBase64(imageUrl);
    console.log('网络图片转换成功!');
    console.log('Base64前100个字符:', base64.substring(0, 100));
  } catch (error) {
    console.error('网络图片转换失败:', error.message);
  }
}

// 运行测试
async function runTests() {
  await testLocalImage();
  await testNetworkImage();
}

// 直接运行测试（Node.js环境）
runTests();