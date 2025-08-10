/**
 * 将图片转换为base64编码
 * @param {string} imagePath - 图片文件路径或URL
 * @returns {Promise<string>} base64编码的图片数据
 */
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

function imageToBase64(imagePath) {
  return new Promise((resolve, reject) => {
    // 判断是否为URL
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      // 处理网络图片
      const protocol = imagePath.startsWith('https') ? https : http;
      
      protocol.get(imagePath, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to fetch image: ${response.statusCode}`));
          return;
        }
        
        const chunks = [];
        response.on('data', (chunk) => {
          chunks.push(chunk);
        });
        
        response.on('end', () => {
          try {
            const imageData = Buffer.concat(chunks);
            const base64 = imageData.toString('base64');
            
            // 从响应头获取MIME类型
            const contentType = response.headers['content-type'] || 'image/png';
            resolve(`data:${contentType};base64,${base64}`);
          } catch (error) {
            reject(new Error('Failed to process image data: ' + error.message));
          }
        });
      }).on('error', (error) => {
        reject(new Error('Failed to fetch image: ' + error.message));
      });
    } else {
      // 处理本地图片
      try {
        // 确保路径是绝对路径
        const absolutePath = path.isAbsolute(imagePath) ? imagePath : path.join(process.cwd(), imagePath);
        // 读取文件内容
        const imageData = fs.readFileSync(absolutePath);
        // 转换为base64
        const base64 = imageData.toString('base64');
        // 添加数据类型前缀
        const fileExtension = path.extname(imagePath).toLowerCase();
        let mimeType = 'image/png';
        if (fileExtension === '.jpg' || fileExtension === '.jpeg') {
          mimeType = 'image/jpeg';
        } else if (fileExtension === '.gif') {
          mimeType = 'image/gif';
        } else if (fileExtension === '.webp') {
          mimeType = 'image/webp';
        }
        resolve(`data:${mimeType};base64,${base64}`);
      } catch (error) {
        reject(new Error('Failed to convert image to base64: ' + error.message));
      }
    }
  });
}

export default imageToBase64;