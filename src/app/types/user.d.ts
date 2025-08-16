// src/app/types/user.d.ts

/**
 * 用户注册请求体类型
 */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/**
 * 用户响应类型
 */
export interface UserResponse {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

/**
 * 错误响应类型
 */
export interface ErrorResponse {
  error: string;
  status: number;
}

/**
 * 用户实体类型
 */
export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}