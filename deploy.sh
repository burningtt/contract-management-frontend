#!/bin/bash

# 前端项目部署脚本
# 使用方法：./deploy.sh

set -e

echo "=========================================="
echo "前端项目部署脚本"
echo "=========================================="

# 配置变量
SERVER_IP="43.142.255.169"
SERVER_USER="root"
REMOTE_PATH="/usr/share/nginx/html/contract-management"
BACKEND_API="http://${SERVER_IP}:8081"

echo "目标服务器: ${SERVER_IP}"
echo "部署路径: ${REMOTE_PATH}"
echo "后端API: ${BACKEND_API}"

# 步骤1：构建项目
echo ""
echo "[步骤1/4] 构建生产版本..."
npm run build

if [ ! -d "dist" ]; then
    echo "错误：构建失败，dist目录不存在"
    exit 1
fi

echo "构建完成！"

# 步骤2：创建远程目录
echo ""
echo "[步骤2/4] 创建远程目录..."
ssh ${SERVER_USER}@${SERVER_IP} "mkdir -p ${REMOTE_PATH}"

# 步骤3：上传文件
echo ""
echo "[步骤3/4] 上传文件到服务器..."
rsync -avz --delete dist/ ${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}/

# 步骤4：设置权限
echo ""
echo "[步骤4/4] 设置文件权限..."
ssh ${SERVER_USER}@${SERVER_IP} "chmod -R 755 ${REMOTE_PATH}"

echo ""
echo "=========================================="
echo "部署完成！"
echo "=========================================="
echo ""
echo "访问地址: http://${SERVER_IP}"
echo "API地址: ${BACKEND_API}"
echo ""
echo "请确保："
echo "1. 后端服务已在 ${BACKEND_API} 上运行"
echo "2. Nginx已正确配置并运行"
echo "3. 防火墙已开放80端口"
echo ""
echo "验证部署："
echo "1. 浏览器访问: http://${SERVER_IP}"
echo "2. 检查登录功能"
echo "3. 查看浏览器控制台无错误"
echo ""