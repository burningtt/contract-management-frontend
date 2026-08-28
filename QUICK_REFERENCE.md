# 前端部署快速参考

## 📋 配置文件清单

### 已创建/修改的文件：
1. ✅ `.env.production` - 生产环境变量配置
2. ✅ `.env.development` - 开发环境变量配置
3. ✅ `vite.config.js` - 构建配置（已优化）
4. ✅ `src/utils/request.js` - API请求配置（支持环境变量）
5. ✅ `nginx.conf.example` - Nginx配置示例
6. ✅ `DEPLOYMENT.md` - 详细部署文档
7. ✅ `deploy.sh` - Linux部署脚本
8. ✅ `deploy.bat` - Windows部署脚本
9. ✅ `verify-config.js` - 配置验证脚本

## 🔧 关键配置项

### 环境变量
```bash
# 生产环境 (.env.production)
VITE_API_BASE_URL=http://43.142.255.169:8081/api

# 开发环境 (.env.development)
VITE_API_BASE_URL=/api
```

### 服务器信息
- **服务器IP**: 43.142.255.169
- **前端访问地址**: http://43.142.255.169
- **后端API地址**: http://43.142.255.169:8081/api
- **部署路径**: /usr/share/nginx/html/contract-management

## 🚀 快速部署步骤

### 方式1：使用部署脚本（Linux）
```bash
# 1. 验证配置
node verify-config.js

# 2. 执行部署
chmod +x deploy.sh
./deploy.sh
```

### 方式2：手动部署
```bash
# 1. 构建项目
npm run build

# 2. 上传到服务器
scp -r dist/* root@43.142.255.169:/usr/share/nginx/html/contract-management/

# 3. 配置Nginx（参考 nginx.conf.example）

# 4. 重启Nginx
systemctl restart nginx
```

## ✅ 验证部署

### 1. 访问测试
- 浏览器访问: http://43.142.255.169
- 应显示登录页面

### 2. API连接测试
- 打开浏览器开发者工具（F12）
- Network标签查看API请求
- 确认请求地址: http://43.142.255.169:8081/api/...

### 3. 功能测试
- ✅ 登录功能
- ✅ 数据查询
- ✅ 文件上传
- ✅ 各模块正常使用

## 🔍 常见问题

### Q1: 页面无法访问？
```bash
# 检查Nginx状态
systemctl status nginx

# 检查防火墙
firewall-cmd --list-ports

# 查看错误日志
tail -f /var/log/nginx/error.log
```

### Q2: API请求失败？
- 确认后端服务运行: 访问 http://43.142.255.169:8081/api
- 检查Nginx代理配置
- 查看浏览器控制台错误

### Q3: 页面刷新404？
- 确认Nginx配置包含: `try_files $uri $uri/ /index.html;`

## 📞 技术支持

详细文档请参考: [DEPLOYMENT.md](./DEPLOYMENT.md)

配置验证: `node verify-config.js`

构建命令: `npm run build`