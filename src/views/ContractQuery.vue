<template>
  <div class="contract-query">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>机构合同</span>
          <el-button type="primary" @click="handleAddContract" :disabled="!selectedRow">新增合同</el-button>
        </div>
      </template>

      <div class="search-container">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="机构编号">
            <el-input
              v-model="searchForm.institutionNo"
              placeholder="请输入机构编号"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item label="地区">
            <el-select v-model="searchForm.region" placeholder="请选择地区" clearable style="width: 150px">
              <el-option label="全部" value="" />
              <el-option v-for="item in regionOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="年份">
            <el-select v-model="searchForm.year" placeholder="请选择年份" clearable style="width: 120px">
              <el-option label="全部" value="" />
              <el-option v-for="year in yearOptions" :key="year" :label="year + '年'" :value="year" />
            </el-select>
          </el-form-item>
          <el-form-item label="关键词">
            <el-input
              v-model="searchForm.keyword"
              placeholder="搜索机构编号/名称/合同编号"
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
        <el-table :data="contractList" border stripe resizable :show-overflow-tooltip="true" @row-click="handleRowClick">
          <el-table-column label="选择" width="60" align="center">
            <template #default="scope">
              <el-radio v-model="selectedRow" :label="scope.row.institutionNo" @click.stop>
                <span style="visibility: hidden">x</span>
              </el-radio>
            </template>
          </el-table-column>
          <el-table-column prop="institutionNo" label="机构编号" width="100" min-width="100" align="center" />
          <el-table-column prop="institutionName" label="机构名称" min-width="180" align="center" show-overflow-tooltip />
          <el-table-column prop="region" label="地区" width="100" min-width="100" align="center">
            <template #default="scope">
              {{ getRegionName(scope.row.region) }}
            </template>
          </el-table-column>
          <el-table-column prop="contractAmount" label="合同金额" width="140" min-width="140" align="center">
            <template #default="scope">
              <span class="amount">{{ formatAmount(scope.row.contractAmount) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="signDate" label="签订日期" width="120" min-width="120" align="center">
            <template #default="scope">
              {{ formatDate(scope.row.signDate) }}
            </template>
          </el-table-column>
          <el-table-column prop="expireDate" label="到期日期" width="120" min-width="120" align="center">
            <template #default="scope">
              {{ formatDate(scope.row.expireDate) }}
            </template>
          </el-table-column>
          <el-table-column prop="contractStatus" label="合同状态" width="100" min-width="100" align="center">
            <template #default="scope">
              <span :class="getStatusClass(scope.row.contractStatus)">
                {{ getStatusText(scope.row.contractStatus) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="responsiblePerson" label="负责人" width="100" min-width="100" align="center" />
          <el-table-column label="操作" width="200" min-width="200" align="center" fixed="right">
            <template #default="scope">
              <el-button type="primary" size="small" link @click="handleView(scope.row)">查看</el-button>
              <el-tooltip v-if="!scope.row.contractId" content="该机构暂无合同，无法编辑" placement="top">
                <el-button type="primary" size="small" link disabled>编辑</el-button>
              </el-tooltip>
              <el-button v-else type="primary" size="small" link @click="handleEdit(scope.row)">编辑</el-button>
              <el-button type="danger" size="small" link @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-empty v-if="!loading && contractList.length === 0" description="暂无数据" />

        <div class="pagination-container">
          <span class="total-count">共 {{ total }} 条机构合同信息</span>
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
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="contractForm" :rules="contractRules" ref="contractFormRef" label-width="100px">
        <el-form-item label="机构编号">
          <el-input v-model="contractForm.institutionNo" readonly />
        </el-form-item>
        <el-form-item v-if="dialogTitle === '编辑合同'" label="合同编号" prop="selectedContractId">
          <el-select 
            v-model="contractForm.selectedContractId" 
            placeholder="请选择合同编号" 
            style="width: 100%" 
            filterable
            @change="handleEditContractChange"
          >
            <el-option
              v-for="contract in contractForm.contractList"
              :key="contract.id"
              :label="contract.contractNo"
              :value="contract.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-else label="机构名称">
          <el-input v-model="contractForm.institutionName" readonly />
        </el-form-item>
        <el-form-item label="地区">
          <el-input v-model="contractForm.regionName" readonly />
        </el-form-item>
        <el-form-item label="签订日期" prop="signDate">
          <el-date-picker
            v-model="contractForm.signDate"
            type="date"
            placeholder="请选择签订日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="到期日期" prop="expireDate">
          <el-date-picker
            v-model="contractForm.expireDate"
            type="date"
            placeholder="请选择到期日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="合同金额" prop="contractAmount">
          <el-input-number v-model="contractForm.contractAmount" :precision="2" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="负责人">
          <el-input v-model="contractForm.responsiblePerson" readonly placeholder="当前登录用户" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="contractForm.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitContract" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="viewDialogVisible" title="查看合同详情" width="500px" class="view-dialog">
      <el-form :model="viewForm" label-width="100px">
        <el-form-item label="机构编号">
          <el-input v-model="viewForm.institutionNo" readonly />
        </el-form-item>
        <el-form-item label="合同编号">
          <el-select v-model="viewForm.selectedContractId" placeholder="请选择合同编号" style="width: 100%" @change="handleContractChange">
            <el-option
              v-for="contract in viewForm.contractList"
              :key="contract.id"
              :label="contract.contractNo"
              :value="contract.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="地区">
          <el-input v-model="viewForm.regionName" readonly />
        </el-form-item>
        <el-form-item label="合同金额">
          <el-input v-model="viewForm.contractAmountDisplay" readonly>
            <template #prepend>¥</template>
          </el-input>
        </el-form-item>
        <el-form-item label="签订日期">
          <el-input v-model="viewForm.signDate" readonly />
        </el-form-item>
        <el-form-item label="到期日期">
          <el-input v-model="viewForm.expireDate" readonly />
        </el-form-item>
        <el-form-item label="合同状态">
          <span :class="getStatusClass(viewForm.contractStatus)">
            {{ viewForm.statusText }}
          </span>
        </el-form-item>
        <el-form-item label="负责人">
          <el-input v-model="viewForm.responsiblePerson" readonly />
        </el-form-item>
        <el-form-item label="备注">
          <div class="remark-content">
            {{ viewForm.remark || '无备注信息' }}
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="viewDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="deleteDialogVisible" title="删除合同" width="500px" class="delete-dialog">
      <el-form :model="deleteForm" label-width="100px">
        <el-form-item label="机构编号">
          <el-input v-model="deleteForm.institutionNo" readonly />
        </el-form-item>
        <el-form-item label="合同编号" prop="selectedContractId">
          <el-select v-model="deleteForm.selectedContractId" placeholder="请选择要删除的合同编号" style="width: 100%" @change="handleDeleteContractChange">
            <el-option
              v-for="contract in deleteForm.contractList"
              :key="contract.id"
              :label="contract.contractNo"
              :value="contract.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="地区">
          <el-input v-model="deleteForm.regionName" readonly />
        </el-form-item>
        <el-form-item label="合同金额">
          <el-input v-model="deleteForm.contractAmountDisplay" readonly>
            <template #prepend>¥</template>
          </el-input>
        </el-form-item>
        <el-form-item label="签订日期">
          <el-input v-model="deleteForm.signDate" readonly />
        </el-form-item>
        <el-form-item label="到期日期">
          <el-input v-model="deleteForm.expireDate" readonly />
        </el-form-item>
        <el-form-item label="合同状态">
          <span :class="getStatusClass(deleteForm.contractStatus)">
            {{ deleteForm.statusText }}
          </span>
        </el-form-item>
        <el-form-item label="负责人">
          <el-input v-model="deleteForm.responsiblePerson" readonly />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="deleteDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="handleConfirmDelete" :loading="deleteLoading">删除</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import request from '../utils/request'
import { REGION_OPTIONS, getRegionName, REGION_MAP } from '../utils/region'

export default {
  name: 'ContractQuery',
  data() {
    return {
      contractList: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      loading: false,
      selectedRow: null,
      regionOptions: REGION_OPTIONS,
      yearOptions: this.generateYearOptions(),
      searchForm: {
        institutionNo: '',
        region: '',
        year: '',
        keyword: ''
      },
      dialogVisible: false,
      dialogTitle: '新增合同',
      submitLoading: false,
      contractForm: {
        id: null,
        contractNo: '',
        institutionNo: '',
        institutionName: '',
        region: '',
        regionName: '',
        selectedContractId: null,
        contractList: [],
        signDate: '',
        expireDate: '',
        contractAmount: null,
        responsiblePerson: '',
        remark: ''
      },
      contractRules: {
        selectedContractId: [{ required: true, message: '请选择合同编号', trigger: 'change' }],
        signDate: [{ required: true, message: '请选择签订日期', trigger: 'change' }],
        expireDate: [{ required: true, message: '请选择到期日期', trigger: 'change' }],
        contractAmount: [{ required: true, message: '请输入合同金额', trigger: 'blur' }]
      },
      viewDialogVisible: false,
      viewForm: {
        institutionNo: '',
        selectedContractId: null,
        contractList: [],
        regionName: '',
        contractAmount: null,
        contractAmountDisplay: '',
        signDate: '',
        expireDate: '',
        contractStatus: '',
        statusType: 'info',
        statusText: '',
        responsiblePerson: '',
        remark: ''
      },
      deleteDialogVisible: false,
      deleteLoading: false,
      deleteForm: {
        institutionNo: '',
        selectedContractId: null,
        contractList: [],
        regionName: '',
        contractAmount: null,
        contractAmountDisplay: '',
        signDate: '',
        expireDate: '',
        contractStatus: '',
        statusType: 'info',
        statusText: '',
        responsiblePerson: ''
      }
    }
  },
  computed: {
    userInfo() {
      const info = localStorage.getItem('userInfo')
      return info ? JSON.parse(info) : {}
    }
  },
  mounted() {
    this.fetchList()
  },
  methods: {
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
        
        if (this.searchForm.institutionNo || this.searchForm.region || this.searchForm.year || this.searchForm.keyword) {
          params.institutionNo = this.searchForm.institutionNo || null
          params.region = this.searchForm.region || null
          params.year = this.searchForm.year || null
          params.keyword = this.searchForm.keyword || null
          const res = await request.get('/contracts/search', { params })
          this.contractList = res.data.rows
          this.total = res.data.total
        } else {
          const res = await request.get('/contracts/query', { params })
          this.contractList = res.data.rows
          this.total = res.data.total
        }
      } catch (error) {
        console.error('获取合同列表失败:', error)
        this.$message.error('获取合同列表失败')
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
        institutionNo: '',
        region: '',
        year: '',
        keyword: ''
      }
      this.currentPage = 1
      this.fetchList()
    },
    handleRowClick(row) {
      if (this.selectedRow === row.institutionNo) {
        this.selectedRow = null
      } else {
        this.selectedRow = row.institutionNo
      }
    },
    handleAddContract() {
      if (!this.selectedRow) {
        this.$message.warning('请先选择一个机构')
        return
      }
      
      const selectedInstitution = this.contractList.find(item => item.institutionNo === this.selectedRow)
      if (!selectedInstitution) {
        this.$message.error('未找到选中的机构信息')
        return
      }
      
      console.log('handleAddContract - userInfo:', this.userInfo)
      console.log('handleAddContract - realName:', this.userInfo.realName)
      
      this.dialogTitle = '新增合同'
      this.contractForm = {
        id: null,
        contractNo: '',
        institutionNo: selectedInstitution.institutionNo,
        institutionName: selectedInstitution.institutionName,
        region: selectedInstitution.region,
        regionName: getRegionName(selectedInstitution.region),
        selectedContractId: null,
        contractList: [],
        signDate: '',
        expireDate: '',
        contractAmount: null,
        responsiblePerson: this.userInfo.realName || '',
        remark: ''
      }
      
      console.log('handleAddContract - contractForm:', this.contractForm)
      
      this.dialogVisible = true
    },
    async handleEdit(row) {
      if (!row.contractId) {
        this.$message.warning('该机构暂无合同，无法进行编辑操作')
        return
      }
      
      this.dialogTitle = '编辑合同'
      this.contractForm = {
        id: row.contractId,
        contractNo: row.contractNo,
        institutionNo: row.institutionNo,
        institutionName: row.institutionName,
        region: row.region,
        regionName: getRegionName(row.region),
        selectedContractId: null,
        contractList: [],
        signDate: '',
        expireDate: '',
        contractAmount: null,
        responsiblePerson: this.userInfo.realName || '',
        remark: ''
      }
      
      try {
        const res = await request.get(`/contracts/institution/${row.institutionNo}`)
        this.contractForm.contractList = res.data || []
        
        if (this.contractForm.contractList.length > 0) {
          this.contractForm.selectedContractId = row.contractId
          this.updateEditFormContract()
        }
      } catch (error) {
        console.error('获取合同列表失败:', error)
        this.$message.error('获取合同列表失败')
        return
      }
      
      this.dialogVisible = true
    },
    handleEditContractChange() {
      this.updateEditFormContract()
    },
    updateEditFormContract() {
      const contract = this.contractForm.contractList.find(c => c.id === this.contractForm.selectedContractId)
      if (contract) {
        this.contractForm.id = contract.id
        this.contractForm.contractNo = contract.contractNo
        this.contractForm.signDate = contract.signDate
        this.contractForm.expireDate = contract.expireDate
        this.contractForm.contractAmount = contract.contractAmount
        this.contractForm.responsiblePerson = contract.responsiblePerson || this.userInfo.realName || ''
        this.contractForm.remark = contract.remark || ''
      }
    },
    async handleView(row) {
      this.viewForm = {
        institutionNo: row.institutionNo,
        selectedContractId: null,
        contractList: [],
        regionName: getRegionName(row.region),
        contractAmount: null,
        contractAmountDisplay: '',
        signDate: '',
        expireDate: '',
        contractStatus: '',
        statusType: 'info',
        statusText: '',
        responsiblePerson: '',
        remark: ''
      }
      
      try {
        const res = await request.get(`/contracts/institution/${row.institutionNo}`)
        this.viewForm.contractList = res.data || []
        
        if (this.viewForm.contractList.length > 0) {
          this.viewForm.selectedContractId = row.contractId || this.viewForm.contractList[0].id
          this.updateViewFormContract()
        }
      } catch (error) {
        console.error('获取合同列表失败:', error)
        this.$message.error('获取合同列表失败')
      }
      
      this.viewDialogVisible = true
    },
    handleContractChange() {
      this.updateViewFormContract()
    },
    updateViewFormContract() {
      const contract = this.viewForm.contractList.find(c => c.id === this.viewForm.selectedContractId)
      if (contract) {
        this.viewForm.contractAmount = contract.contractAmount
        this.viewForm.contractAmountDisplay = this.formatAmountNumber(contract.contractAmount)
        this.viewForm.signDate = this.formatDate(contract.signDate)
        this.viewForm.expireDate = this.formatDate(contract.expireDate)
        this.viewForm.contractStatus = contract.contractStatus
        this.viewForm.statusType = this.getStatusType(contract.contractStatus)
        this.viewForm.statusText = this.getStatusText(contract.contractStatus)
        this.viewForm.responsiblePerson = contract.responsiblePerson || '-'
        this.viewForm.remark = contract.remark || ''
      }
    },
    formatAmountNumber(amount) {
      if (amount == null || amount === '') return '0.00'
      return Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    },
    async handleDelete(row) {
      this.deleteForm = {
        institutionNo: row.institutionNo,
        selectedContractId: null,
        contractList: [],
        regionName: getRegionName(row.region),
        contractAmount: null,
        contractAmountDisplay: '',
        signDate: '',
        expireDate: '',
        contractStatus: '',
        statusType: 'info',
        statusText: '',
        responsiblePerson: ''
      }
      
      try {
        const res = await request.get(`/contracts/institution/${row.institutionNo}`)
        this.deleteForm.contractList = res.data || []
        
        if (this.deleteForm.contractList.length > 0) {
          this.deleteForm.selectedContractId = row.contractId || this.deleteForm.contractList[0].id
          this.updateDeleteFormContract()
        }
      } catch (error) {
        console.error('获取合同列表失败:', error)
        this.$message.error('获取合同列表失败')
        return
      }
      
      this.deleteDialogVisible = true
    },
    handleDeleteContractChange() {
      this.updateDeleteFormContract()
    },
    updateDeleteFormContract() {
      const contract = this.deleteForm.contractList.find(c => c.id === this.deleteForm.selectedContractId)
      if (contract) {
        this.deleteForm.contractAmount = contract.contractAmount
        this.deleteForm.contractAmountDisplay = this.formatAmountNumber(contract.contractAmount)
        this.deleteForm.signDate = this.formatDate(contract.signDate)
        this.deleteForm.expireDate = this.formatDate(contract.expireDate)
        this.deleteForm.contractStatus = contract.contractStatus
        this.deleteForm.statusType = this.getStatusType(contract.contractStatus)
        this.deleteForm.statusText = this.getStatusText(contract.contractStatus)
        this.deleteForm.responsiblePerson = contract.responsiblePerson || '-'
      }
    },
    async handleConfirmDelete() {
      if (!this.deleteForm.selectedContractId) {
        this.$message.warning('请选择要删除的合同编号')
        return
      }
      
      try {
        await this.$confirm('确定要删除该合同吗? 此操作不可恢复！', '警告', {
          confirmButtonText: '确定删除',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        this.deleteLoading = true
        await request.delete(`/contracts/${this.deleteForm.selectedContractId}`)
        this.$message.success('删除成功')
        this.deleteDialogVisible = false
        this.selectedRow = null
        this.fetchList()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除失败:', error)
          this.$message.error(error.response?.data?.message || '删除失败')
        }
      } finally {
        this.deleteLoading = false
      }
    },
    async handleSubmitContract() {
      this.$refs.contractFormRef.validate(async (valid) => {
        if (valid) {
          this.submitLoading = true
          try {
            if (this.contractForm.id) {
              const res = await request.put(`/contracts/${this.contractForm.id}`, {
                institutionNo: this.contractForm.institutionNo,
                signDate: this.contractForm.signDate,
                expireDate: this.contractForm.expireDate,
                contractAmount: this.contractForm.contractAmount,
                responsiblePerson: this.contractForm.responsiblePerson,
                remark: this.contractForm.remark
              })
              if (res.code === 200) {
                this.$message.success('合同更新成功')
                this.dialogVisible = false
                this.selectedRow = null
                this.fetchList()
              } else {
                this.$message.error(res.message || '合同更新失败')
              }
            } else {
              const submitData = {
                institutionNo: this.contractForm.institutionNo,
                institutionName: this.contractForm.institutionName,
                region: this.contractForm.region,
                signDate: this.contractForm.signDate,
                expireDate: this.contractForm.expireDate,
                contractAmount: this.contractForm.contractAmount,
                responsiblePerson: this.contractForm.responsiblePerson,
                remark: this.contractForm.remark
              }
              console.log('提交合同数据:', submitData)
              console.log('负责人字段值:', this.contractForm.responsiblePerson)
              console.log('用户信息:', this.userInfo)
              
              const res = await request.post('/contracts/create', submitData)
              
              if (res.code === 200) {
                this.$message.success(`合同创建成功，合同编号：${res.data.contractNo}`)
                this.dialogVisible = false
                this.selectedRow = null
                this.fetchList()
              } else {
                this.$message.error(res.message || '合同创建失败')
              }
            }
          } catch (error) {
            console.error('提交失败:', error)
            this.$message.error(error.response?.data?.message || '操作失败')
          } finally {
            this.submitLoading = false
          }
        }
      })
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
    formatDate(date) {
      if (!date) return '-'
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    formatAmount(amount) {
      if (amount == null || amount === '') return '¥0.00'
      return `¥${Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
    },
    getStatusType(status) {
      const map = {
        'ACTIVE': 'success',
        'PENDING': 'warning',
        'INACTIVE': 'info'
      }
      return map[status] || 'info'
    },
    getStatusText(status) {
      const map = {
        'ACTIVE': '活跃',
        'PENDING': '未生效',
        'INACTIVE': '失效'
      }
      return map[status] || status || '无合同'
    },
    getStatusClass(status) {
      if (!status) {
        return 'status-tag status-no-contract'
      }
      const map = {
        'ACTIVE': 'status-tag status-active',
        'PENDING': 'status-tag status-pending',
        'INACTIVE': 'status-tag status-inactive'
      }
      return map[status] || 'status-tag status-no-contract'
    },
    getRegionName
  }
}
</script>

<style scoped>
.contract-query {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-container {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.search-form {
  margin-bottom: 0;
}

.table-container {
  min-height: 400px;
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding: 10px 0;
}

.total-count {
  font-size: 14px;
  color: #606266;
}

.amount {
  color: #e6a23c;
  font-weight: 500;
}

.status-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  padding: 0 9px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  border-radius: 4px;
  white-space: nowrap;
  border: 1px solid transparent;
}

.status-active {
  background-color: #f0f9eb;
  border-color: #e1f3d8;
  color: #67c23a;
}

.status-pending {
  background-color: #fdf6ec;
  border-color: #faecd8;
  color: #e6a23c;
}

.status-inactive {
  background-color: #fef0f0;
  border-color: #fde2e2;
  color: #ff4d4f;
}

.status-no-contract {
  background-color: #f4f4f5;
  border-color: #e9e9eb;
  color: #909399;
}

.remark-content {
  width: 100%;
  min-height: 60px;
  padding: 10px 12px;
  background-color: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  word-break: break-word;
  white-space: pre-wrap;
}

.view-dialog :deep(.el-dialog__header) {
  background-color: #f0f9eb;
  border-bottom: 1px solid #e1f3d8;
  margin-right: 0;
  padding: 15px 20px;
}

.view-dialog :deep(.el-dialog__title) {
  color: #67c23a;
  font-weight: 600;
}

.view-dialog :deep(.el-dialog__headerbtn .el-dialog__close) {
  color: #67c23a;
}

.view-dialog :deep(.el-dialog__headerbtn:hover .el-dialog__close) {
  color: #85ce61;
}

.delete-dialog :deep(.el-dialog__header) {
  background-color: #fef0f0;
  border-bottom: 1px solid #fde2e2;
  margin-right: 0;
  padding: 15px 20px;
}

.delete-dialog :deep(.el-dialog__title) {
  color: #ff4d4f;
  font-weight: 600;
}

.delete-dialog :deep(.el-dialog__headerbtn .el-dialog__close) {
  color: #ff4d4f;
}

.delete-dialog :deep(.el-dialog__headerbtn:hover .el-dialog__close) {
  color: #ff7875;
}
</style>
