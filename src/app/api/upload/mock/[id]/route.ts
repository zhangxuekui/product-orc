import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

// 开发环境模拟R2存储的图片访问端点
// 注意：这只是用于开发测试，生产环境中应直接从R2访问图片
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    // 在实际开发中，你可能需要从某个临时目录读取上传的文件
    // 这里为了简化，我们返回一个示例图片

    // 获取文件扩展名
    const fileExtension = id.split('.').pop()?.toLowerCase() || '';

    // 根据扩展名设置content-type
    let contentType = 'image/jpeg';
    if (fileExtension === 'png') contentType = 'image/png';
    else if (fileExtension === 'gif') contentType = 'image/gif';
    else if (fileExtension === 'webp') contentType = 'image/webp';

    // 读取示例图片（使用public目录中的图片作为 fallback）
    const exampleImagePath = path.join(
      process.cwd(),
      'public',
      'images',
      'unnamed.jpg'
    );

    const imageBuffer = fs.readFileSync(exampleImagePath);

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
      },
    });
  } catch (error) {
    console.error('获取模拟图片失败:', error);
    return NextResponse.json({ error: '图片不存在' }, { status: 404 });
  }
}