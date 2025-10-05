#!/usr/bin/env node

// Vercel 构建脚本
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始 Vercel 构建...');

try {
  // 检查必要文件
  const requiredFiles = [
    'server.js',
    'package.json',
    'public/index.html',
    'public/app.js',
    'public/auth.js',
    'public/styles.css'
  ];

  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      console.error(`❌ 缺少必要文件: ${file}`);
      process.exit(1);
    }
  }

  console.log('✅ 所有必要文件存在');

  // 检查环境变量
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET'
  ];

  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingEnvVars.length > 0) {
    console.warn('⚠️  缺少环境变量:', missingEnvVars.join(', '));
    console.warn('⚠️  请确保在 Vercel 项目中配置了这些环境变量');
  }

  // 创建必要的目录
  const directories = ['uploads', 'uploads/avatars', 'logs'];
  
  for (const dir of directories) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 创建目录: ${dir}`);
    }
  }

  console.log('✅ Vercel 构建完成');
  console.log('📦 应用已准备好部署');

} catch (error) {
  console.error('❌ 构建失败:', error.message);
  process.exit(1);
}
