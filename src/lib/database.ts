// src/lib/database.ts
// D1数据库工具函数

// 导入必要的类型和函数
import type { D1Database } from '@cloudflare/workers-types';
import { getCloudflareContext } from '@opennextjs/cloudflare';

// 扩展Cloudflare环境类型
declare module '@cloudflare/workers-types' {
  interface CloudflareEnv {
    // D1数据库绑定
    DB: D1Database;
  }
}

/**
 * 获取D1数据库实例
 * @returns D1数据库实例
 */
export function getD1Database(): D1Database {
  try {
    // 使用OpenNext提供的函数获取Cloudflare上下文
    const context = getCloudflareContext();
    if (context && context.env && 'DB' in context.env) {
      return context.env.DB as D1Database;
    }

    // 回退方案：尝试从全局环境获取
    if (typeof globalThis !== 'undefined' && 'env' in globalThis && (globalThis as any).env && 'DB' in (globalThis as any).env) {
      return (globalThis as any).env.DB as D1Database;
    }

    throw new Error('D1 database binding not found in context or global environment.');
  } catch (error) {
    console.error('Error getting D1 database:', error);
    throw new Error(`Failed to get D1 database: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 初始化数据库
 * 创建必要的表结构
 */
export async function initDatabase() {
  const db = getD1Database();
  // 执行SQL初始化脚本
  await db.exec(`
    DROP TABLE IF EXISTS Users;
    CREATE TABLE Users (
      UserId INTEGER PRIMARY KEY AUTOINCREMENT,
      UserName TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      passwordHash TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);
  console.log('Database initialized successfully');
}