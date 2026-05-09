<template>
  <div class="dashboard">
    <!-- 年度和地区显示区域 -->
    <div class="year-banner">
      <span class="year-text">{{ currentYear }}年度</span>
      <div class="region-selector">
        <el-select
          v-model="selectedRegion"
          placeholder="选择地区"
          clearable
          @change="handleRegionChange"
          style="width: 150px"
        >
          <el-option label="全部地区" value="" />
          <el-option
            v-for="item in regionOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
    </div>

    <el-row :gutter="20" v-loading="loading">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon user"><User /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.institutionCount }}</div>
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
              <div class="stat-value">{{ statistics.contractCount }}</div>
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
              <div class="stat-value">¥{{ formatAmount(statistics.totalAmount) }}</div>
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
              <div class="stat-value">¥{{ formatAmount(statistics.feeAmount) }}</div>
              <div class="stat-label">已录入费用</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 无数据提示 -->
    <el-empty
      v-if="!loading && hasNoData"
      description="所选地区暂无数据"
      style="margin-top: 20px"
    />

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
import { User, Document, Money, Wallet } from '@element-plus/icons-vue'
import request from '../utils/request'
import { REGION_OPTIONS } from '../utils/region'

export default {
  name: 'Dashboard',
  components: {
    User,
    Document,
    Money,
    Wallet
  },
  data() {
    return {
      loading: false,
      currentYear: new Date().getFullYear(),
      selectedRegion: '',
      regionOptions: REGION_OPTIONS,
      statistics: {
        institutionCount: 0,
        contractCount: 0,
        totalAmount: 0,
        feeAmount: 0
      },
      dataCache: {},
      refreshTimer: null
    }
  },
  computed: {
    hasNoData() {
      return (
        this.statistics.institutionCount === 0 &&
        this.statistics.contractCount === 0 &&
        this.statistics.totalAmount === 0 &&
        this.statistics.feeAmount === 0
      )
    }
  },
  mounted() {
    this.initFromUrl()
    this.fetchStatistics()
    this.refreshTimer = setInterval(() => {
      this.dataCache = {}
      this.fetchStatistics()
    }, 5 * 60 * 1000)
  },
  beforeUnmount() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
    }
  },
  methods: {
    initFromUrl() {
      const urlParams = new URLSearchParams(window.location.search)
      const region = urlParams.get('region')
      if (region !== null) {
        this.selectedRegion = region
      }
    },
    updateUrl() {
      const url = new URL(window.location.href)
      if (this.selectedRegion) {
        url.searchParams.set('region', this.selectedRegion)
      } else {
        url.searchParams.delete('region')
      }
      window.history.replaceState({}, '', url.toString())
    },
    handleRegionChange() {
      this.updateUrl()
      this.fetchStatistics()
    },
    async fetchStatistics() {
      const cacheKey = this.selectedRegion || 'all'
      if (this.dataCache[cacheKey]) {
        this.statistics = this.dataCache[cacheKey]
        return
      }

      this.loading = true
      try {
        const params = {}
        if (this.selectedRegion) {
          params.region = this.selectedRegion
        }
        const res = await request.get('/dashboard/statistics', { params })
        const data = res.data || {
          institutionCount: 0,
          contractCount: 0,
          totalAmount: 0,
          feeAmount: 0
        }
        this.statistics = data
        this.dataCache[cacheKey] = data
      } catch (error) {
        console.error('获取统计数据失败:', error)
        this.$message.error('获取统计数据失败')
      } finally {
        this.loading = false
      }
    },
    formatAmount(amount) {
      if (!amount) return '0.00'
      return Number(amount).toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }
  }
}
</script>

<style scoped>
.year-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  padding: 12px 24px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 12px rgba(102, 126, 234, 0.3);
}

.year-text {
  color: #fff;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 2px;
}

.region-selector {
  display: flex;
  align-items: center;
}

.region-selector :deep(.el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 6px;
}

.region-selector :deep(.el-input__inner) {
  color: #333;
  font-weight: 500;
}

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
</style>
