<template>
  <div class="fee-statistics">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>费用管理</span>
          <el-button type="primary" @click="handleAddFee" :disabled="!selectedRow">录入费用</el-button>
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
            <el-select v-model="searchForm.year" placeholder="请选择年度" style="width: 120px">
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
        <el-table :data="feeList" border stripe resizable :show-overflow-tooltip="true" @row-click="handleRowClick">
          <el-table-column label="选择" width="60" align="center">
            <template #default="scope">
              <el-radio v-model="selectedRow" :label="scope.row" @click.stop>
                <span style="visibility: hidden">x</span>
              </el-radio>
            </template>
          </el-table-column>
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

    <el-dialog v-model="dialogVisible" title="录入费用" width="600px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="机构编号" prop="institutionNo">
          <el-input v-model="form.institutionNo" readonly />
        </el-form-item>
        <el-form-item label="机构名称" prop="institutionName">
          <el-input v-model="form.institutionName" readonly />
        </el-form-item>
        <el-form-item label="地区" prop="region">
          <el-input v-model="form.region" readonly />
        </el-form-item>
        <el-form-item label="年度应缴" prop="annualDue">
          <el-input v-model="form.annualDue" readonly />
        </el-form-item>
        <el-form-item label="费用金额" prop="feeAmount">
          <el-input-number 
            v-model="form.feeAmount" 
            :min="0.01" 
            :max="9999999.99" 
            :precision="2" 
            style="width: 100%" 
          />
        </el-form-item>
        <el-form-item label="缴费日期" prop="feeDate">
          <el-date-picker
            v-model="form.feeDate"
            type="date"
            placeholder="请选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="录入人" prop="recordedBy">
          <el-input v-model="form.recordedBy" readonly />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input 
            v-model="form.remark" 
            type="textarea" 
            :rows="3" 
            :maxlength="500" 
            show-word-limit 
            placeholder="请输入备注信息，最多500个字符"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
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
        year: new Date().getFullYear(),
        institutionName: ''
      },
      selectedRow: null,
      dialogVisible: false,
      form: {
        institutionNo: '',
        institutionName: '',
        region: '',
        annualDue: '',
        feeAmount: null,
        feeDate: '',
        recordedBy: '',
        remark: '',
        createTime: ''
      },
      rules: {
        feeAmount: [
          { required: true, message: '请输入费用金额', trigger: 'blur' },
          { validator: this.validateFeeAmount, trigger: 'blur' }
        ],
        feeDate: [
          { required: true, message: '请选择缴费日期', trigger: 'change' }
        ],
        remark: [
          { max: 500, message: '备注最多500个字符', trigger: 'blur' }
        ]
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
    validateFeeAmount(rule, value, callback) {
      if (value === null || value === undefined || value === '') {
        callback(new Error('请输入费用金额'))
      } else if (value <= 0) {
        callback(new Error('费用金额必须大于0'))
      } else if (value > 9999999.99) {
        callback(new Error('费用金额不能超过9999999.99'))
      } else {
        callback()
      }
    },
    handleRowClick(row) {
      if (this.selectedRow && this.selectedRow.institutionNo === row.institutionNo) {
        this.selectedRow = null
      } else {
        this.selectedRow = row
      }
    },
    handleAddFee() {
      if (!this.selectedRow) {
        this.$message.warning('请先选择一条数据记录')
        return
      }
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
      const today = new Date()
      const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
      
      this.form = {
        institutionNo: this.selectedRow.institutionNo,
        institutionName: this.selectedRow.institutionName,
        region: getRegionName(this.selectedRow.region),
        annualDue: this.selectedRow.annualDue ? `¥${this.formatAmount(this.selectedRow.annualDue)}` : '¥0.00',
        feeAmount: null,
        feeDate: formattedDate,
        recordedBy: userInfo.realName || userInfo.username || '',
        remark: '',
        createTime: new Date().toISOString()
      }
      this.dialogVisible = true
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
        this.selectedRow = null
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
        year: new Date().getFullYear(),
        institutionName: ''
      }
      this.currentPage = 1
      this.selectedRow = null
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
    handleSubmit() {
      this.$refs.formRef.validate(async (valid) => {
        if (valid) {
          try {
            const submitData = {
              institutionNo: this.form.institutionNo,
              feeAmount: this.form.feeAmount,
              feeDate: this.form.feeDate,
              recordedBy: this.form.recordedBy,
              remark: this.form.remark,
              createTime: this.form.createTime
            }
            await request.post('/contract-fees', submitData)
            this.$message.success('费用录入成功')
            this.dialogVisible = false
            this.fetchList()
          } catch (error) {
            console.error('费用录入失败:', error)
            this.$message.error('费用录入失败')
          }
        } else {
          return false
        }
      })
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
