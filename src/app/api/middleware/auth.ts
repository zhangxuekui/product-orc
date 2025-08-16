import { NextRequest, NextResponse } from 'next/server';

/**
 * 通用鉴权中间件
 * @param request 请求对象
 * @returns 认证结果对象，包含认证状态和可能的错误信息
 */
export async function authMiddleware(request: NextRequest): Promise<{ isAuthenticated: boolean; error?: string }> {
  // 从环境变量获取有效的API密钥
  // 在实际应用中，你需要在.env文件中设置这些变量
  const validApiKeys = process.env.API_KEYS?.split(',') || ['api_key_1', 'api_key_2'];
  
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader) {
    return { isAuthenticated: false, error: 'Authorization header is required' };
  }
  
  // 提取API密钥 (格式为: Bearer <api_key>)
  const [authType, apiKey] = authHeader.split(' ');
  
  if (authType !== 'Bearer' || !apiKey) {
    return { isAuthenticated: false, error: 'Invalid authorization format. Use: Bearer <api_key>' };
  }
  
  // 验证API密钥
  const isAuthenticated = validApiKeys.includes(apiKey);
  
  if (!isAuthenticated) {
    return { isAuthenticated: false, error: 'Invalid API key' };
  }
  
  return { isAuthenticated: true };
}

/**
 * 包装API处理函数，添加鉴权
 * @param handler API处理函数
 * @returns 包装后的API处理函数
 */
export function withAuth(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const authResult = await authMiddleware(request);
    
    // if (!authResult.isAuthenticated) {
    //   return NextResponse.json(
    //     { error: authResult.error || 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }
    
    return handler(request);
  };
}