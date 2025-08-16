// src/app/api/middleware/rateLimit.ts
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// 存储请求记录的Map
const requestMap = new Map<string, { count: number; lastRequest: number }>();
// 清理过期请求的间隔（毫秒）
const CLEANUP_INTERVAL = 60000; // 1分钟
// 时间窗口（毫秒）
const TIME_WINDOW = 60000; // 1分钟
// 每个IP在时间窗口内允许的最大请求数
const MAX_REQUESTS = 5;

// 定期清理过期的请求记录
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requestMap.entries()) {
    if (now - data.lastRequest > TIME_WINDOW) {
      requestMap.delete(key);
    }
  }
}, CLEANUP_INTERVAL);

/**
 * 速率限制中间件
 * @param request 请求对象
 * @returns 速率限制结果对象，包含是否超限和可能的错误信息
 */
export async function rateLimitMiddleware(request: NextRequest): Promise<{ isAllowed: boolean; error?: string }> {
  // 获取客户端IP（在Cloudflare环境中使用CF-Connecting-IP头）
  const clientIp = request.headers.get('CF-Connecting-IP') || uuidv4();
  const now = Date.now();

  // 检查请求记录
  if (requestMap.has(clientIp)) {
    const requestData = requestMap.get(clientIp)!
    // 检查是否在时间窗口内
    if (now - requestData.lastRequest < TIME_WINDOW) {
      // 增加请求计数
      requestData.count += 1;
      requestData.lastRequest = now;

      // 检查是否超过限制
      if (requestData.count > MAX_REQUESTS) {
        return {
          isAllowed: false,
          error: `Rate limit exceeded. Please try again after ${Math.ceil((TIME_WINDOW - (now - requestData.lastRequest)) / 1000)} seconds.`
        };
      }
    } else {
      // 重置时间窗口内的请求计数
      requestMap.set(clientIp, { count: 1, lastRequest: now });
    }
  } else {
    // 新IP，添加到请求记录
    requestMap.set(clientIp, { count: 1, lastRequest: now });
  }

  return { isAllowed: true };
}

/**
 * 包装API处理函数，添加速率限制
 * @param handler API处理函数
 * @returns 包装后的API处理函数
 */
export function withRateLimit(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const rateLimitResult = await rateLimitMiddleware(request);

    if (!rateLimitResult.isAllowed) {
      return NextResponse.json(
        { error: rateLimitResult.error || 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    return handler(request);
  };
}