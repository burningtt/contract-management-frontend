@echo off
REM 前端项目部署脚本 (Windows版本)
REM 使用方法：deploy.bat

echo ==========================================
echo 前端项目部署脚本
echo ==========================================

REM 配置变量
set SERVER_IP=43.142.255.169
set SERVER_USER=root
set REMOTE_PATH=/usr/share/nginx/html/contract-management
set BACKEND_API=http://%SERVER_IP%:8081

echo 目标服务器: %SERVER_IP%
echo 部署路径: %REMOTE_PATH%
echo 后端API: %BACKEND_API%

REM 步骤1：构建项目
echo.
echo [步骤1/3] 构建生产版本...
call npm run build

if not exist "dist" (
    echo 错误：构建失败，dist目录不存在
    pause
    exit /b 1
)

echo 构建完成！

REM 步骤2：提示上传
echo.
echo [步骤2/3] 上传文件到服务器
echo 请使用以下方式之一上传dist目录内容到服务器：
echo.
echo 方式1 - 使用WinSCP或FileZilla：
echo   主机: %SERVER_IP%
echo   用户名: %SERVER_USER%
echo   远程路径: %REMOTE_PATH%
echo.
echo 方式2 - 使用scp命令（需要Git Bash或WSL）：
echo   scp -r dist/* %SERVER_USER%@%SERVER_IP%:%REMOTE_PATH%/
echo.
echo 方式3 - 使用PowerShell：
echo   $session = New-PSSession -HostName %SERVER_IP% -UserName %SERVER_USER%
echo   Copy-Item -Path dist\* -Destination %REMOTE_PATH% -ToSession $session -Recurse
echo.

pause

REM 步骤3：设置权限
echo.
echo [步骤3/3] 设置文件权限...
echo 请在服务器上执行以下命令：
echo   chmod -R 755 %REMOTE_PATH%
echo.

echo ==========================================
echo 部署完成！
echo ==========================================
echo.
echo 访问地址: http://%SERVER_IP%
echo API地址: %BACKEND_API%
echo.
echo 请确保：
echo 1. 后端服务已在 %BACKEND_API% 上运行
echo 2. Nginx已正确配置并运行
echo 3. 防火墙已开放80端口
echo.
echo 验证部署：
echo 1. 浏览器访问: http://%SERVER_IP%
echo 2. 检查登录功能
echo 3. 查看浏览器控制台无错误
echo.

pause