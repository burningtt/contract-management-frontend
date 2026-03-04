<template>
  <div class="fee-statistics">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>费用管理</span>
        </div>
      </template>

      <div class="search-container">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="地区">
            <el-select v-model="searchForm.region" placeholder="请选择地区" clearable style="width: 150px">
              <el-option label="全部" value="" />
              <el-option v-for="item in regionOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="年度">
            <el-select v-model="searchForm.year" placeholder="请选择年度" clearable style="width: 120px">
              <el-option label="全部" value="" />
              <el-option v-for="year in yearOptions" :key="year" :label="year + '年'" :value="year" />
            </el-select>
          </el-form-item>
          <el-form-item label="机构名称">
            <el-input
              v-model="searchForm.institutionName"
              placeholder="请输入机构名称"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div v-loading="loading" class="table-container">
        <el-table :data="feeList" border stripe resizable :show-overflow-tooltip="true">
          <el-table-column prop="institutionNo" label="机构编号" width="120" min-width="120" align="center" />
          <el-table-column prop="institutionName" label="机构名称" min-width="180" align="center" show-overflow-tooltip />
          <el-table-column prop="region" label="地区" width="100" min-width="100" align="center">
            <template #default="scope">
              {{ getRegionName(scope.row.region) }}
            </template>
          </el-table-column>
          <el-table-column prop="annualDue" label="年度应缴" width="140" min-width="140" align="center">
            <template #default="scope">
              <span class="amount">¥{{ formatAmount(scope.row.annualDue) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="annualCollected" label="年度收费" width="140" min-width="140" align="center">
            <template #default="scope">
              <span class="amount success">¥{{ formatAmount(scope.row.annualCollected) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="annualArrears" label="年度欠费" width="140" min-width="140" align="center">
            <template #default="scope">
              <span :class="['amount', scope.row.annualArrears > 0 ? 'danger' : '']">
                ¥{{ formatAmount(scope.row.annualArrears) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="collectionRate" label="收费率" width="120" min-width="120" align="center">
            <template #default="scope">
              <el-tag 
                :type="getCollectionRateType(scope.row.collectionRate)" 
                size="small"
              >
                {{ scope.row.collectionRate }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>

        <el-empty v-if="!loading && feeList.length === 0" description="暂无数据" />
      </div>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import request from '../utils/request'
import { REGION_OPTIONS, getRegionName } from '../utils/region'

export default {
  name: 'FeeStatistics',
  data() {
    return {
      feeList: [],
      loading: false,
      currentPage: 1,
      pageSize: 10,
      total: 0,
      regionOptions: REGION_OPTIONS,
      yearOptions: this.generateYearOptions(),
      searchForm: {
        region: '',
        year: '',
        institutionName: ''
      }
    }
  },
  mounted() {
    this.fetchList()
  },
  methods: {
    getRegionName,
    generateYearOptions() {
      const currentYear = new Date().getFullYear()
      const years = []
      for (let year = 2025; year <= currentYear + 1; year++) {
        years.push(year)
      }
      return years
    },
    async fetchList() {
      this.loading = true
      try {
        const params = {
          page: this.currentPage,
          size: this.pageSize
        }
        if (this.searchForm.region) {
          params.region = this.searchForm.region
        }
        if (this.searchForm.year) {
          params.year = this.searchForm.year
        }
        if (this.searchForm.institutionName) {
          params.institutionName = this.searchForm.institutionName
        }
        const res = await request.get('/institutions/fee-statistics', { params })
        this.feeList = res.data?.rows || []
        this.total = res.data?.total || 0
      } catch (error) {
        console.error('获取费用统计列表失败:', error)
        this.$message.error('获取费用统计列表失败')
      } finally {
        this.loading = false
      }
    },
    handleSearch() {
      this.currentPage = 1
      this.fetchList()
    },
    handleReset() {
      this.searchForm = {
        region: '',
        year: '',
        institutionName: ''
      }
      this.currentPage = 1
      this.fetchList()
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
      this.fetchList()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchList()
    },
    formatAmount(amount) {
      if (amount == null || amount === '') return '0.00'
      return Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    },
    getCollectionRateType(rate) {
      if (!rate) return 'info'
      const rateNum = parseFloat(rate)
      if (rateNum >= 100) return 'success'
      if (rateNum >= 80) return 'primary'
      if (rateNum >= 60) return 'warning'
      return 'danger'
    }
  }
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-container {
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
}

.table-container {
  min-height: 300px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.amount {
  font-weight: 500;
}

.amount.success {
  color: #67c23a;
}

.amount.danger {
  color: #f56c6c;
}
</style>
