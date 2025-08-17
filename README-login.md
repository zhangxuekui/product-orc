# 登录接口使用说明

## 接口概述
- **路径**: `/api/auth/login`
- **方法**: `POST`
- **功能**: 验证用户凭据并返回JWT令牌

## 请求体格式
```json
{
  "email": "用户邮箱",
  "password": "用户密码"
}
```

## 响应格式
### 成功响应
```json
{
  "success": true,
  "message": "Login successful",
  "token": "JWT令牌",
  "user": {
    "id": "用户ID",
    "username": "用户名",
    "email": "用户邮箱"
  }
}
```

### 错误响应
```json
{
  "error": "错误信息",
  "status": 错误状态码
}
```

## 错误码说明
- `400`: 请求参数错误
- `401`: 邮箱或密码错误
- `500`: 服务器内部错误

## 测试脚本
使用 `test-login.js` 脚本测试登录接口:
1. 确保Next.js服务器正在运行: `npm run dev`
2. 修改脚本中的email和password为已注册用户的凭据
3. 运行命令: `node test-login.js`
4. 查看输出结果

## 安全注意事项
- 请确保在生产环境中更改 `.env` 文件中的 `JWT_SECRET`
- 令牌有效期默认为24小时，可在 `.env` 文件中调整 `JWT_EXPIRES_IN`
- 建议使用HTTPS协议传输敏感信息