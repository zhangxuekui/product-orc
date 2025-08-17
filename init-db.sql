-- 初始化数据库SQL脚本

-- 删除旧表（如果存在）
DROP TABLE IF EXISTS Users;

-- 创建Users表
CREATE TABLE Users (
  UserId INTEGER PRIMARY KEY AUTOINCREMENT,
  UserName TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  passwordHash TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

-- 插入测试数据
INSERT INTO Users (UserName, email, passwordHash, createdAt, updatedAt)
VALUES ('testuser', 'test@example.com', 'hashedpassword123', datetime('now'), datetime('now'));

-- 查询确认
SELECT * FROM Users;