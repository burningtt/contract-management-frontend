# 前端项目部署文档

## 一、部署前准备

### 1.1 服务器环境要求
- 操作系统：Linux (推荐 CentOS 7+/Ubuntu 18.04+) 或 Windows Server
- Web服务器：Nginx 1.18+ 或 Apache
- Node.js：16.x+ (仅构建时需要)
- 已部署的后端API服务：http://43.142.255.169:8081

### 1.2 确认后端服务状态
确保后端API服务已在 43.142.255.169:8081 上正常运行并可访问。

## 二、本地构建步骤

### 2.1 安装依赖
```bash
cd d:\AnkangProject\contract-management-frontend
npm install
```

### 2.2 构建生产版本
```bash
npm run build
```

构建完成后，会在项目根目录生成 `dist` 文件夹，包含所有静态文件。

### 2.3 验证构建结果
检查 dist 目录应包含以下文件：
- index.html
- assets/js/[name]-[hash].js
- assets/css/[name]-[hash].css
- 其他静态资源

## 三、服务器部署步骤

### 3.1 Linux服务器部署

#### 步骤1：上传文件到服务器
```bash
# 方式1：使用scp上传
scp -r dist/* root@43.142.255.169:/usr/share/nginx/html/contract-management/

# 方式2：使用FTP工具（如FileZilla）上传dist目录内容到服务器
```

#### 步骤2：安装Nginx（如未安装）
```bash
# CentOS
sudo yum install nginx -y

# Ubuntu
sudo apt update
sudo apt install nginx -y
```

#### 步骤3：配置Nginx
```bash
# 创建配置文件
sudo vi /etc/nginx/conf.d/contract-management.conf

# 复制nginx.conf.example中的内容到此文件
# 修改server_name为你的IP：43.142.255.169
# 修改root路径为实际的前端文件路径
```

#### 步骤4：测试并重启Nginx
```bash
# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx

# 设置开机自启
sudo systemctl enable nginx
```

#### 步骤5：配置防火墙
```bash
# 开放80端口
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --reload

# 或使用iptables
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo service iptables save
```

### 3.2 Windows服务器部署

#### 步骤1：安装Nginx
1. 下载Nginx Windows版本：http://nginx.org/en/download.html
2. 解压到 C:\nginx

#### 步骤2：部署前端文件
1. 将 dist 目录内容复制到 C:\nginx\html\contract-management\

#### 步骤3：配置Nginx
1. 编辑 C:\nginx\conf\nginx.conf
2. 在 http 块中添加 include conf.d/*.conf;
3. 创建 C:\nginx\conf.d\contract-management.conf
4. 复制nginx.conf.example内容并修改路径

#### 步骤4：启动Nginx
```cmd
cd C:\nginx
start nginx
```

## 四、配置文件说明

### 4.1 环境变量配置
- `.env.development`: 开发环境配置
- `.env.production`: 生产环境配置
- `VITE_API_BASE_URL`: 后端API地址

### 4.2 关键配置项
**vite.config.js**:
- `base: '/'`: 应用基础路径
- `build.outDir`: 构建输出目录
- `build.assetsDir`: 静态资源目录

**request.js**:
- `baseURL`: API请求基础地址，从环境变量读取

**nginx配置**:
- `server_name`: 服务器IP或域名
- `root`: 前端文件存放路径
- `proxy_pass`: 后端API代理地址

## 五、验证部署成功

### 5.1 访问测试
1. 打开浏览器访问：http://43.142.255.169
2. 应该能看到登录页面
3. 检查浏览器控制台无错误信息

### 5.2 API连接测试
1. 打开浏览器开发者工具（F12）
2. 切换到Network标签
3. 尝试登录，查看API请求是否正常
4. 确认请求地址为：http://43.142.255.169/api/...

### 5.3 功能测试
- 登录功能
- 数据查询
- 文件上传下载
- 各模块正常使用

## 六、常见问题排查

### 6.1 页面无法访问
- 检查Nginx是否启动：`systemctl status nginx`
- 检查防火墙是否开放80端口
- 检查Nginx配置文件语法：`nginx -t`
- 查看Nginx错误日志：`tail -f /var/log/nginx/error.log`

### 6.2 API请求失败
- 确认后端服务是否运行：访问 http://43.142.255.169:8081/api
- 检查Nginx代理配置是否正确
- 检查跨域配置
- 查看浏览器控制台错误信息

### 6.3 页面刷新404
- 确认Nginx配置中包含 `try_files $uri $uri/ /index.html;`
- 这是Vue Router history模式必需的配置

### 6.4 静态资源加载失败
- 检查dist文件是否完整上传
- 检查文件路径权限
- 检查Nginx静态资源路径配置

## 七、安全建议

### 7.1 HTTPS配置（推荐）
```nginx
server {
    listen 443 ssl;
    server_name 43.142.255.169;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # 其他配置...
}
```

### 7.2 安全头配置
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
```

### 7.3 访问控制
- 配置防火墙规则
- 限制敏感目录访问
- 定期更新系统和软件

## 八、维护与更新

### 8.1 更新前端代码
1. 本地修改代码
2. 重新构建：`npm run build`
3. 上传新的dist文件到服务器
4. 清除浏览器缓存测试

### 8.2 日志查看
```bash
# Nginx访问日志
tail -f /var/log/nginx/access.log

# Nginx错误日志
tail -f /var/log/nginx/error.log
```

### 8.3 性能优化
- 启用Gzip压缩
- 配置浏览器缓存
- 使用CDN加速静态资源
- 开启HTTP/2

## 九、联系与支持

如遇问题，请检查：
1. 后端服务状态
2. Nginx配置和日志
3. 网络连接和防火墙
4. 浏览器控制台错误信息