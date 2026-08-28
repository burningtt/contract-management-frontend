#!/usr/bin/env node

/**
 * 配置验证脚本
 * 用于检查前端部署配置是否正确
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('========================================');
console.log('前端部署配置验证');
console.log('========================================\n');

let hasErrors = false;

// 检查必需文件
const requiredFiles = [
    '.env.production',
    'vite.config.js',
    'package.json',
    'src/utils/request.js'
];

console.log('1. 检查必需文件...');
requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`   ✓ ${file} 存在`);
    } else {
        console.log(`   ✗ ${file} 不存在`);
        hasErrors = true;
    }
});

// 检查环境变量配置
console.log('\n2. 检查环境变量配置...');
try {
    const envProd = fs.readFileSync('.env.production', 'utf8');
    if (envProd.includes('VITE_API_BASE_URL')) {
        const match = envProd.match(/VITE_API_BASE_URL=(.+)/);
        if (match) {
            console.log(`   ✓ 生产环境API地址: ${match[1].trim()}`);
        }
    } else {
        console.log('   ✗ .env.production 中未找到 VITE_API_BASE_URL');
        hasErrors = true;
    }
} catch (error) {
    console.log('   ✗ 无法读取 .env.production');
    hasErrors = true;
}

// 检查vite配置
console.log('\n3. 检查Vite配置...');
try {
    const viteConfig = fs.readFileSync('vite.config.js', 'utf8');
    if (viteConfig.includes('base:')) {
        console.log('   ✓ base 路径已配置');
    }
    if (viteConfig.includes('build:')) {
        console.log('   ✓ build 配置已设置');
    }
} catch (error) {
    console.log('   ✗ 无法读取 vite.config.js');
    hasErrors = true;
}

// 检查request.js配置
console.log('\n4. 检查API请求配置...');
try {
    const requestJs = fs.readFileSync('src/utils/request.js', 'utf8');
    if (requestJs.includes('import.meta.env.VITE_API_BASE_URL')) {
        console.log('   ✓ API地址使用环境变量配置');
    } else {
        console.log('   ⚠ API地址未使用环境变量，建议修改');
    }
} catch (error) {
    console.log('   ✗ 无法读取 src/utils/request.js');
    hasErrors = true;
}

// 检查package.json
console.log('\n5. 检查构建脚本...');
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (packageJson.scripts && packageJson.scripts.build) {
        console.log(`   ✓ 构建脚本: ${packageJson.scripts.build}`);
    } else {
        console.log('   ✗ 未找到构建脚本');
        hasErrors = true;
    }
} catch (error) {
    console.log('   ✗ 无法读取 package.json');
    hasErrors = true;
}

// 检查dist目录
console.log('\n6. 检查构建输出...');
if (fs.existsSync('dist')) {
    const distFiles = fs.readdirSync('dist');
    if (distFiles.includes('index.html')) {
        console.log('   ✓ dist/index.html 存在');
    } else {
        console.log('   ✗ dist/index.html 不存在');
        hasErrors = true;
    }
    if (distFiles.includes('assets')) {
        console.log('   ✓ dist/assets 目录存在');
    } else {
        console.log('   ✗ dist/assets 目录不存在');
        hasErrors = true;
    }
} else {
    console.log('   ⚠ dist 目录不存在，请先运行 npm run build');
}

// 总结
console.log('\n========================================');
if (hasErrors) {
    console.log('❌ 配置验证失败，请检查上述错误项');
    process.exit(1);
} else {
    console.log('✅ 配置验证通过，可以开始部署');
    console.log('\n下一步操作：');
    console.log('1. 运行 npm run build 构建项目');
    console.log('2. 使用 deploy.sh (Linux) 或 deploy.bat (Windows) 部署');
    console.log('3. 配置服务器Nginx（参考 nginx.conf.example）');
    console.log('4. 访问 http://43.142.255.169 验证部署');
}
console.log('========================================\n');