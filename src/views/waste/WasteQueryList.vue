<template>
  <div class="waste-query-list">
    <el-card>
      <template #header>
        <span>医废查询</span>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 280px"
          />
        </el-form-item>
        <el-form-item label="地区">
          <el-select v-model="searchForm.region" placeholder="请选择地区" clearable style="width: 150px">
            <el-option label="全部" value="" />
            <el-option v-for="item in regionOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="医院名称">
          <el-input v-model="searchForm.hospitalName" placeholder="请输入医院名称" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="批次编号">
          <el-input v-model="searchForm.batchNo" placeholder="请输入批次编号" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleExport" :loading="exportLoading">
            <el-icon><Download /></el-icon>导出Excel
          </el-button>
        </el-form-item>
      </el-form>

      <el-table :data="recordList" border stripe :show-overflow-tooltip="true">
        <el-table-column prop="batchNo" label="批次编号" width="160" align="center" />
        <el-table-column prop="hospitalName" label="医院名称" min-width="160" align="center" />
        <el-table-column prop="region" label="地区" width="100" align="center">
          <template #default="scope">
            {{ getRegionName(scope.row.region) }}
          </template>
        </el-table-column>
        <el-table-column prop="plateNumber" label="车牌号" width="120" align="center" />
        <el-table-column prop="staffName" label="人员" width="100" align="center" />
        <el-table-column prop="infectiousWeight" label="感染性(kg)" width="110" align="center">
          <template #default="scope">
            {{ scope.row.infectiousWeight != null ? scope.row.infectiousWeight : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="injuriousWeight" label="损伤性(kg)" width="110" align="center">
          <template #default="scope">
            {{ scope.row.injuriousWeight != null ? scope.row.injuriousWeight : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="pharmaceuticalWeight" label="药物性(kg)" width="110" align="center">
          <template #default="scope">
            {{ scope.row.pharmaceuticalWeight != null ? scope.row.pharmaceuticalWeight : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="chemicalWeight" label="化学性(kg)" width="110" align="center">
          <template #default="scope">
            {{ scope.row.chemicalWeight != null ? scope.row.chemicalWeight : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="pathologicalWeight" label="病理性(kg)" width="110" align="center">
          <template #default="scope">
            {{ scope.row.pathologicalWeight != null ? scope.row.pathologicalWeight : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="totalWeight" label="总重量(kg)" width="110" align="center">
          <template #default="scope">
            <el-tag type="danger">{{ scope.row.totalWeight }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="recordDate" label="录入日期" width="120" align="center" />
        <el-table-column prop="createdBy" label="录入人" width="100" align="center" />
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" link @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" link @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSearch"
          @current-change="loadData"
        />
      </div>
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑医废记录" width="600px" :close-on-click-modal="false" destroy-on-close>
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="120px">
        <el-form-item label="车辆" prop="vehicleNo">
          <el-select v-model="editForm.vehicleNo" placeholder="请选择车辆" style="width: 100%">
            <el-option v-for="v in vehicleOptions" :key="v.vehicleNo" :label="v.plateNumber" :value="v.vehicleNo" />
          </el-select>
        </el-form-item>
        <el-form-item label="人员" prop="staffNos">
          <el-select v-model="editForm.staffNos" placeholder="请选择人员（2位）" style="width: 100%" multiple :max-collapse-tags="2" collapse-tags collapse-tags-tooltip>
            <el-option v-for="s in staffOptions" :key="s.staffNo" :label="`${s.staffName}（${s.position || '未设置'}）`" :value="s.staffNo" />
          </el-select>
        </el-form-item>
        <el-divider content-position="left">废物重量(kg)</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="感染性" prop="infectiousWeight">
              <el-input-number v-model="editForm.infectiousWeight" :min="0" :precision="2" :step="0.1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="损伤性" prop="injuriousWeight">
              <el-input-number v-model="editForm.injuriousWeight" :min="0" :precision="2" :step="0.1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="药物性" prop="pharmaceuticalWeight">
              <el-input-number v-model="editForm.pharmaceuticalWeight" :min="0" :precision="2" :step="0.1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="化学性" prop="chemicalWeight">
              <el-input-number v-model="editForm.chemicalWeight" :min="0" :precision="2" :step="0.1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="病理性" prop="pathologicalWeight">
              <el-input-number v-model="editForm.pathologicalWeight" :min="0" :precision="2" :step="0.1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="录入日期" prop="recordDate">
              <el-date-picker v-model="editForm.recordDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleEditSubmit" :loading="editSubmitLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import request from '../../utils/request'
import { REGION_OPTIONS, getRegionName } from '../../utils/region'
import { Download } from '@element-plus/icons-vue'

export default {
  name: 'WasteQueryList',
  components: { Download },
  data() {
    return {
      recordList: [],
      dateRange: null,
      searchForm: {
        region: '',
        hospitalName: '',
        batchNo: ''
      },
      pagination: {
        page: 1,
        size: 10,
        total: 0
      },
      regionOptions: REGION_OPTIONS,
      exportLoading: false,
      // 编辑
      editDialogVisible: false,
      editSubmitLoading: false,
      editForm: {},
      editRules: {
        vehicleNo: [{ required: true, message: '请选择车辆', trigger: 'change' }],
        staffNos: [{ required: true, type: 'array', min: 1, message: '请选择人员', trigger: 'change' }],
        recordDate: [{ required: true, message: '请选择录入日期', trigger: 'change' }]
      },
      vehicleOptions: [],
      staffOptions: []
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    getRegionName,
    async loadData() {
      try {
        const params = {
          page: this.pagination.page,
          size: this.pagination.size,
          region: this.searchForm.region || undefined,
          hospitalName: this.searchForm.hospitalName || undefined,
          batchNo: this.searchForm.batchNo || undefined
        }
        if (this.dateRange && this.dateRange.length === 2) {
          params.startDate = this.dateRange[0]
          params.endDate = this.dateRange[1]
        }
        const res = await request.get('/waste/records', { params })
        this.recordList = res.data.rows
        this.pagination.total = res.data.total
      } catch (error) {
        console.error('加载查询数据失败:', error)
      }
    },
    handleSearch() {
      this.pagination.page = 1
      this.loadData()
    },
    handleReset() {
      this.dateRange = null
      this.searchForm = { region: '', hospitalName: '', batchNo: '' }
      this.pagination.page = 1
      this.loadData()
    },
    async handleEdit(row) {
      this.editForm = { ...row }
      // 将逗号分隔的人员编号转为数组，供多选组件使用
      if (this.editForm.staffNos && typeof this.editForm.staffNos === 'string') {
        this.editForm.staffNos = this.editForm.staffNos.split(',').filter(s => s)
      } else {
        this.editForm.staffNos = []
      }
      // 加载车辆和人员下拉选项
      try {
        const [vehicleRes, staffRes] = await Promise.all([
          request.get('/waste/vehicles/all'),
          request.get('/waste/staff/all')
        ])
        this.vehicleOptions = vehicleRes.data || []
        this.staffOptions = staffRes.data || []
      } catch (error) {
        console.error('加载选项失败:', error)
      }
      this.editDialogVisible = true
    },
    async handleEditSubmit() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return
        this.editSubmitLoading = true
        try {
          const data = {
            ...this.editForm,
            // 将人员数组转为逗号分隔字符串
            staffNos: Array.isArray(this.editForm.staffNos) ? this.editForm.staffNos.join(',') : this.editForm.staffNos
          }
          await request.put(`/waste/records/${this.editForm.id}`, data)
          this.$message.success('更新成功')
          this.editDialogVisible = false
          this.loadData()
        } catch (error) {
          console.error('更新失败:', error)
        } finally {
          this.editSubmitLoading = false
        }
      })
    },
    async handleDelete(row) {
      try {
        await this.$confirm(`确认删除批次 ${row.batchNo} 的记录？`, '提示', { type: 'warning' })
        await request.delete(`/waste/records/${row.id}`)
        this.$message.success('删除成功')
        this.loadData()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除失败:', error)
        }
      }
    },
    async handleExport() {
      this.exportLoading = true
      try {
        const params = new URLSearchParams()
        if (this.dateRange && this.dateRange.length === 2) {
          params.append('startDate', this.dateRange[0])
          params.append('endDate', this.dateRange[1])
        }
        if (this.searchForm.region) {
          params.append('region', this.searchForm.region)
        }
        if (this.searchForm.hospitalName) {
          params.append('hospitalName', this.searchForm.hospitalName)
        }
        if (this.searchForm.batchNo) {
          params.append('batchNo', this.searchForm.batchNo)
        }

        const token = localStorage.getItem('token')
        const response = await fetch(`/api/waste/records/export?${params.toString()}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('导出失败')
        }

        const blob = await response.blob()
        const contentDisposition = response.headers.get('content-disposition')
        let fileName = `医废记录_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.xlsx`
        if (contentDisposition) {
          const match = contentDisposition.match(/filename\*=UTF-8''(.+)/)
          if (match) {
            fileName = decodeURIComponent(match[1])
          }
        }

        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        this.$message.success('导出成功')
      } catch (error) {
        console.error('导出失败:', error)
        this.$message.error('导出失败，请稍后重试')
      } finally {
        this.exportLoading = false
      }
    }
  }
}
</script>

<style scoped>
.search-form {
  margin-bottom: 10px;
}
.pagination-container {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}
</style>
