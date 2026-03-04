<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon user"><User /></el-icon>
            <div class="stat-info">
              <div class="stat-value">14</div>
              <div class="stat-label">机构总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon contract"><Document /></el-icon>
            <div class="stat-info">
              <div class="stat-value">0</div>
              <div class="stat-label">合同总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon money"><Money /></el-icon>
            <div class="stat-info">
              <div class="stat-value">¥0</div>
              <div class="stat-label">合同总额</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon fee"><Wallet /></el-icon>
            <div class="stat-info">
              <div class="stat-value">0</div>
              <div class="stat-label">费用记录</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="welcome-card" style="margin-top: 20px">
      <h2>欢迎使用医疗机构合同管理系统</h2>
      <p>这是一个基于 Spring Boot + Vue 3 的医疗机构合同管理系统</p>
      <el-divider />
      <h3>系统功能</h3>
      <ul>
        <li>医疗机构信息管理</li>
        <li>合同信息管理</li>
        <li>合同费用记录</li>
        <li>用户权限管理</li>
      </ul>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Dashboard'
}
</script>

<style scoped>
.stat-card {
  margin-bottom: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  font-size: 48px;
  padding: 10px;
  border-radius: 8px;
}

.stat-icon.user {
  color: #409eff;
  background-color: #ecf5ff;
}

.stat-icon.contract {
  color: #67c23a;
  background-color: #f0f9ff;
}

.stat-icon.money {
  color: #e6a23c;
  background-color: #fdf6ec;
}

.stat-icon.fee {
  color: #f56c6c;
  background-color: #fef0f0;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  color: #909399;
  font-size: 14px;
}

.welcome-card {
  padding: 20px;
}

.welcome-card h2 {
  color: #303133;
  margin-bottom: 10px;
}

.welcome-card h3 {
  color: #606266;
  margin-top: 20px;
}

.welcome-card p {
  color: #909399;
  margin-bottom: 20px;
}

.welcome-card ul {
  list-style: none;
  padding: 0;
}

.welcome-card li {
  padding: 8px 0;
  color: #606266;
}

.welcome-card li::before {
  content: "•";
  color: #409eff;
  margin-right: 10px;
}
</style>
