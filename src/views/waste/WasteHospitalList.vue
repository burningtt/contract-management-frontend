<template>
  <div class="waste-hospital-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>医废录入</span>
          <div>
            <el-button type="success" @click="handleImport">Excel导入医院</el-button>
            <el-button type="primary" @click="handleAddHospital">新增医院</el-button>
          </div>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="医院名称">
          <el-input v-model="searchForm.hospitalName" placeholder="请输入医院名称" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="地区">
          <el-select v-model="searchForm.region" placeholder="请选择地区" clearable style="width: 150px">
            <el-option label="全部" value="" />
            <el-option v-for="item in regionOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="正常" :value="1" />
            <el-option label="已停用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="hospitalList" border stripe :show-overflow-tooltip="true">
        <el-table-column prop="hospitalNo" label="编号" width="120" align="center" />
        <el-table-column prop="hospitalName" label="医院名称" min-width="200" align="center" />
        <el-table-column prop="region" label="地区" width="120" align="center">
          <template #default="scope">
            {{ getRegionName(scope.row.region) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '正常' : '已停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="scope">
            <el-button v-if="scope.row.status === 1" type="primary" size="small" @click="handleRecord(scope.row)">录入</el-button>
            <el-button type="primary" size="small" link @click="handleEditHospital(scope.row)">编辑</el-button>
            <el-button v-if="scope.row.status === 1" type="danger" size="small" link @click="handleDisableHospital(scope.row)">停用</el-button>
            <el-button v-if="scope.row.status === 0" type="success" size="small" link @click="handleEnableHospital(scope.row)">启用</el-button>
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
          @current-change="handleSearch"
        />
      </div>
    </el-card>

    <!-- 新增/编辑医院对话框 -->
    <el-dialog v-model="hospitalDialogVisible" :title="hospitalDialogTitle" width="500px" :close-on-click-modal="false" destroy-on-close>
      <el-form :model="hospitalForm" :rules="hospitalRules" ref="hospitalFormRef" label-width="100px">
        <el-form-item label="医院名称" prop="hospitalName">
          <el-input v-model="hospitalForm.hospitalName" placeholder="请输入医院名称" />
        </el-form-item>
        <el-form-item label="地区" prop="region">
          <el-select v-model="hospitalForm.region" placeholder="请选择地区" style="width: 100%">
            <el-option v-for="item in regionOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="hospitalDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleHospitalSubmit" :loading="hospitalSubmitLoading">确定</el-button>
      </template>
    </el-dialog>

    <!-- 医废录入对话框 -->
    <el-dialog v-model="recordDialogVisible" title="医废录入" width="600px" :close-on-click-modal="false" destroy-on-close>
      <el-form :model="recordForm" :rules="recordRules" ref="recordFormRef" label-width="120px">
        <el-form-item label="医院名称">
          <el-input :model-value="currentHospital.hospitalName" disabled />
        </el-form-item>
        <el-form-item label="地区">
          <el-input :model-value="getRegionName(currentHospital.region)" disabled />
        </el-form-item>
        <el-form-item label="车辆" prop="vehicleNo">
          <el-select v-model="recordForm.vehicleNo" placeholder="请选择车辆" style="width: 100%">
            <el-option v-for="v in vehicleOptions" :key="v.vehicleNo" :label="v.plateNumber" :value="v.vehicleNo" />
          </el-select>
        </el-form-item>
        <el-form-item label="人员" prop="staffNos">
          <el-select v-model="recordForm.staffNos" placeholder="请选择人员（2位）" style="width: 100%" multiple :max-collapse-tags="2" collapse-tags collapse-tags-tooltip>
            <el-option v-for="s in staffOptions" :key="s.staffNo" :label="`${s.staffName}（${s.position || '未设置'}）`" :value="s.staffNo" />
          </el-select>
        </el-form-item>
        <el-divider content-position="left">废物重量(kg)</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="感染性" prop="infectiousWeight">
              <el-input-number v-model="recordForm.infectiousWeight" :min="0" :precision="2" :step="0.1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="损伤性" prop="injuriousWeight">
              <el-input-number v-model="recordForm.injuriousWeight" :min="0" :precision="2" :step="0.1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="药物性" prop="pharmaceuticalWeight">
              <el-input-number v-model="recordForm.pharmaceuticalWeight" :min="0" :precision="2" :step="0.1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="化学性" prop="chemicalWeight">
              <el-input-number v-model="recordForm.chemicalWeight" :min="0" :precision="2" :step="0.1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="病理性" prop="pathologicalWeight">
              <el-input-number v-model="recordForm.pathologicalWeight" :min="0" :precision="2" :step="0.1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="总重量">
              <el-input :model-value="totalWeight" disabled />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="录入日期" prop="recordDate">
          <el-date-picker v-model="recordForm.recordDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="recordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleRecordSubmit" :loading="recordSubmitLoading">提交</el-button>
      </template>
    </el-dialog>

    <!-- Excel导入对话框 -->
    <el-dialog v-model="importDialogVisible" title="Excel导入医院" width="600px" :close-on-click-modal="false" destroy-on-close>
      <el-upload
        ref="uploadRef"
        action=""
        :auto-upload="false"
        :limit="1"
        accept=".xlsx"
        :on-change="handleFileChange"
        :on-exceed="() => $message.warning('只能上传一个文件')"
      >
        <template #trigger>
          <el-button type="primary">选择文件</el-button>
        </template>
        <el-button type="success" style="margin-left: 10px" @click="downloadTemplate">下载模板</el-button>
        <template #tip>
          <div class="el-upload__tip">仅支持.xlsx格式，文件大小不超过10MB</div>
        </template>
      </el-upload>
      <div v-if="importResult" style="margin-top: 15px">
        <el-alert type="info" :closable="false">
          <template #title>
            解析结果：总数 {{ importResult.totalCount }}，有效 {{ importResult.successCount }}，无效 {{ importResult.failCount }}
          </template>
        </el-alert>
        <el-button type="primary" style="margin-top: 10px" @click="executeImport" :disabled="importResult.successCount === 0" :loading="importLoading">
          确认导入（{{ importResult.successCount }}条有效数据）
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import request from '../../utils/request'
import { REGION_OPTIONS, getRegionName } from '../../utils/region'

export default {
  name: 'WasteHospitalList',
  data() {
    return {
      hospitalList: [],
      searchForm: {
        hospitalName: '',
        region: '',
        status: null
      },
      pagination: {
        page: 1,
        size: 10,
        total: 0
      },
      regionOptions: REGION_OPTIONS,
      // 医院对话框
      hospitalDialogVisible: false,
      hospitalDialogTitle: '',
      hospitalSubmitLoading: false,
      hospitalForm: {
        id: null,
        hospitalName: '',
        region: ''
      },
      hospitalRules: {
        hospitalName: [{ required: true, message: '请输入医院名称', trigger: 'blur' }],
        region: [{ required: true, message: '请选择地区', trigger: 'change' }]
      },
      // 录入对话框
      recordDialogVisible: false,
      recordSubmitLoading: false,
      currentHospital: {},
      vehicleOptions: [],
      staffOptions: [],
      recordForm: {
        vehicleNo: '',
        staffNos: [],
        infectiousWeight: 0,
        injuriousWeight: 0,
        pharmaceuticalWeight: 0,
        chemicalWeight: 0,
        pathologicalWeight: 0,
        recordDate: ''
      },
      recordRules: {
        vehicleNo: [{ required: true, message: '请选择车辆', trigger: 'change' }],
        staffNos: [{ required: true, type: 'array', min: 1, message: '请选择人员', trigger: 'change' }],
        recordDate: [{ required: true, message: '请选择录入日期', trigger: 'change' }]
      },
      // 导入
      importDialogVisible: false,
      importFile: null,
      importResult: null,
      importLoading: false
    }
  },
  computed: {
    // 自动计算总重量
    totalWeight() {
      const f = this.recordForm
      return ((f.infectiousWeight || 0) + (f.injuriousWeight || 0) +
        (f.pharmaceuticalWeight || 0) + (f.chemicalWeight || 0) +
        (f.pathologicalWeight || 0)).toFixed(2)
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
          hospitalName: this.searchForm.hospitalName || undefined,
          region: this.searchForm.region || undefined
        }
        if (this.searchForm.status !== null && this.searchForm.status !== '') {
          params.status = this.searchForm.status
        }
        const res = await request.get('/waste/hospitals', { params })
        this.hospitalList = res.data.rows
        this.pagination.total = res.data.total
      } catch (error) {
        console.error('加载医院数据失败:', error)
      }
    },
    handleSearch() {
      this.pagination.page = 1
      this.loadData()
    },
    handleReset() {
      this.searchForm = { hospitalName: '', region: '', status: null }
      this.pagination.page = 1
      this.loadData()
    },
    // 医院增删改
    handleAddHospital() {
      this.hospitalDialogTitle = '新增医院'
      this.hospitalForm = { id: null, hospitalName: '', region: '' }
      this.hospitalDialogVisible = true
    },
    handleEditHospital(row) {
      this.hospitalDialogTitle = '编辑医院'
      this.hospitalForm = { ...row }
      this.hospitalDialogVisible = true
    },
    async handleHospitalSubmit() {
      this.$refs.hospitalFormRef.validate(async (valid) => {
        if (!valid) return
        this.hospitalSubmitLoading = true
        try {
          if (this.hospitalForm.id) {
            await request.put(`/waste/hospitals/${this.hospitalForm.id}`, this.hospitalForm)
            this.$message.success('更新成功')
          } else {
            await request.post('/waste/hospitals', this.hospitalForm)
            this.$message.success('创建成功')
          }
          this.hospitalDialogVisible = false
          this.loadData()
        } catch (error) {
          console.error('提交失败:', error)
        } finally {
          this.hospitalSubmitLoading = false
        }
      })
    },
    async handleDisableHospital(row) {
      try {
        await this.$confirm(`确认停用医院 ${row.hospitalName}？停用后该医院将不可使用。`, '提示', { type: 'warning' })
        await request.delete(`/waste/hospitals/${row.id}`)
        this.$message.success('停用成功')
        this.loadData()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('停用失败:', error)
        }
      }
    },
    async handleEnableHospital(row) {
      try {
        await this.$confirm(`确认启用医院 ${row.hospitalName}？`, '提示', { type: 'info' })
        await request.put(`/waste/hospitals/${row.id}/enable`)
        this.$message.success('启用成功')
        this.loadData()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('启用失败:', error)
        }
      }
    },
    // 医废录入
    async handleRecord(hospital) {
      this.currentHospital = hospital
      this.recordForm = {
        vehicleNo: '',
        staffNos: [],
        infectiousWeight: 0,
        injuriousWeight: 0,
        pharmaceuticalWeight: 0,
        chemicalWeight: 0,
        pathologicalWeight: 0,
        recordDate: new Date().toISOString().slice(0, 10)
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
      // 获取上次选择的车辆和人员
      try {
        const lastRes = await request.get(`/waste/records/last/${hospital.hospitalNo}`)
        if (lastRes.data) {
          this.recordForm.vehicleNo = lastRes.data.vehicleNo || ''
          // 将逗号分隔的人员编号转为数组
          if (lastRes.data.staffNos) {
            this.recordForm.staffNos = lastRes.data.staffNos.split(',').filter(s => s)
          }
        }
      } catch (error) {
        // 没有历史记录，忽略
      }
      this.recordDialogVisible = true
    },
    async handleRecordSubmit() {
      this.$refs.recordFormRef.validate(async (valid) => {
        if (!valid) return
        this.recordSubmitLoading = true
        try {
          const data = {
            ...this.recordForm,
            hospitalNo: this.currentHospital.hospitalNo,
            region: this.currentHospital.region,
            // 将人员数组转为逗号分隔字符串
            staffNos: this.recordForm.staffNos.join(',')
          }
          await request.post('/waste/records', data)
          this.$message.success('录入成功')
          this.recordDialogVisible = false
        } catch (error) {
          console.error('录入失败:', error)
        } finally {
          this.recordSubmitLoading = false
        }
      })
    },
    // Excel导入
    handleImport() {
      this.importResult = null
      this.importFile = null
      this.importDialogVisible = true
    },
    async handleFileChange(file) {
      this.importFile = file.raw
      try {
        const formData = new FormData()
        formData.append('file', this.importFile)
        const res = await request.post('/waste/hospitals/import/parse', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        this.importResult = res.data
      } catch (error) {
        console.error('解析文件失败:', error)
      }
    },
    async executeImport() {
      if (!this.importResult || !this.importResult.validData) return
      this.importLoading = true
      try {
        const res = await request.post('/waste/hospitals/import/execute', this.importResult.validData)
        this.$message.success(`导入完成：成功${res.data.successCount}条，失败${res.data.failCount}条`)
        this.importDialogVisible = false
        this.loadData()
      } catch (error) {
        console.error('导入失败:', error)
      } finally {
        this.importLoading = false
      }
    },
    downloadTemplate() {
      window.open('/api/waste/hospitals/import/template', '_blank')
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
.search-form {
  margin-bottom: 10px;
}
.pagination-container {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}
</style>
