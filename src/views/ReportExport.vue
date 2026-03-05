<template>
  <div class="report-export">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>报表导出</span>
        </div>
      </template>

      <el-steps :active="currentStep" finish-status="success" simple class="steps-container">
        <el-step title="筛选条件" />
        <el-step title="字段配置" />
        <el-step title="模板匹配" />
        <el-step title="导出文件" />
      </el-steps>

      <div class="step-content">
        <div v-show="currentStep === 0" class="step-panel">
          <el-form :model="filterForm" :rules="filterRules" ref="filterFormRef" label-width="120px">
            <el-form-item label="机构编号" prop="institutionNo">
              <el-input v-model="filterForm.institutionNo" placeholder="请输入机构编号" clearable />
            </el-form-item>
            <el-form-item label="年度" prop="year">
              <el-select v-model="filterForm.year" placeholder="请选择年度" style="width: 100%">
                <el-option v-for="year in yearOptions" :key="year" :label="year + '年'" :value="year" />
              </el-select>
            </el-form-item>
            <el-form-item label="数据来源" prop="dataSources">
              <el-checkbox-group v-model="filterForm.dataSources">
                <el-checkbox label="institution">机构表</el-checkbox>
                <el-checkbox label="contract">合同表</el-checkbox>
                <el-checkbox label="fee">费用表</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-form>
        </div>

        <div v-show="currentStep === 1" class="step-panel">
          <div v-for="source in filterForm.dataSources" :key="source" class="field-config-section">
            <div class="section-header">
              <span class="section-title">{{ getDataSourceName(source) }}</span>
              <el-button type="primary" link @click="toggleAllFields(source, true)">全选</el-button>
              <el-button type="primary" link @click="toggleAllFields(source, false)">取消全选</el-button>
            </div>
            <div class="field-list">
              <el-checkbox-group v-model="selectedFields[source]">
                <div v-for="field in availableFields[source]" :key="field.name" class="field-item">
                  <el-checkbox :label="field.name">
                    {{ field.label }}
                  </el-checkbox>
                  <el-button 
                    v-if="selectedFields[source]?.includes(field.name)" 
                    type="primary" 
                    link 
                    size="small"
                    @click="moveField(source, field.name, -1)"
                  >
                    上移
                  </el-button>
                  <el-button 
                    v-if="selectedFields[source]?.includes(field.name)" 
                    type="primary" 
                    link 
                    size="small"
                    @click="moveField(source, field.name, 1)"
                  >
                    下移
                  </el-button>
                </div>
              </el-checkbox-group>
            </div>
          </div>
          <el-empty v-if="filterForm.dataSources.length === 0" description="请先选择数据来源" />
        </div>

        <div v-show="currentStep === 2" class="step-panel">
          <el-tabs v-model="activeTemplateTab">
            <el-tab-pane label="模板上传" name="upload">
              <el-upload
                ref="uploadRef"
                class="template-upload"
                drag
                :auto-upload="false"
                :show-file-list="true"
                :on-change="handleTemplateChange"
                accept=".xlsx,.xls"
                :limit="1"
              >
                <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
                <div class="el-upload__text">
                  将Excel模板拖到此处，或<em>点击上传</em>
                </div>
                <template #tip>
                  <div class="el-upload__tip">
                    支持 .xlsx 和 .xls 格式的Excel文件
                  </div>
                </template>
              </el-upload>
            </el-tab-pane>
            <el-tab-pane label="字段匹配" name="match" :disabled="!templateHeaders.length">
              <div class="field-match-container">
                <div v-for="source in filterForm.dataSources" :key="source" class="match-section">
                  <div class="match-title">{{ getDataSourceName(source) }}</div>
                  <div v-for="field in getSelectedFieldList(source)" :key="field.name" class="match-row">
                    <div class="match-left">
                      <span class="field-label">{{ field.label }}</span>
                    </div>
                    <div class="match-center">
                      <el-icon><Right /></el-icon>
                    </div>
                    <div class="match-right">
                      <el-select 
                        v-model="fieldMapping[source][field.name]" 
                        placeholder="选择模板表头"
                        clearable
                        style="width: 200px"
                      >
                        <el-option 
                          v-for="header in templateHeaders" 
                          :key="header" 
                          :label="header" 
                          :value="header" 
                        />
                      </el-select>
                      <el-button 
                        type="primary" 
                        link 
                        size="small"
                        @click="autoMatchField(source, field.name, field.label)"
                      >
                        智能匹配
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="match-actions">
                <el-button type="primary" @click="autoMatchAll">一键智能匹配</el-button>
                <el-button @click="saveMappingScheme">保存匹配方案</el-button>
                <el-button @click="loadMappingScheme">加载匹配方案</el-button>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>

        <div v-show="currentStep === 3" class="step-panel">
          <el-form :model="exportForm" label-width="120px">
            <el-form-item label="导出预览">
              <div class="export-preview">
                <div class="preview-item">
                  <span class="preview-label">机构编号：</span>
                  <span class="preview-value">{{ filterForm.institutionNo || '全部' }}</span>
                </div>
                <div class="preview-item">
                  <span class="preview-label">年度：</span>
                  <span class="preview-value">{{ filterForm.year }}年</span>
                </div>
                <div class="preview-item">
                  <span class="preview-label">数据来源：</span>
                  <span class="preview-value">{{ filterForm.dataSources.map(s => getDataSourceName(s)).join('、') }}</span>
                </div>
                <div class="preview-item">
                  <span class="preview-label">导出字段数：</span>
                  <span class="preview-value">{{ totalSelectedFields }} 个</span>
                </div>
                <div class="preview-item">
                  <span class="preview-label">文件名：</span>
                  <span class="preview-value">{{ exportFileName }}</span>
                </div>
              </div>
            </el-form-item>
            <el-form-item label="导出进度" v-if="exporting">
              <el-progress :percentage="exportProgress" :status="exportProgress === 100 ? 'success' : ''" />
            </el-form-item>
          </el-form>
        </div>
      </div>

      <div class="step-actions">
        <el-button v-if="currentStep > 0" @click="prevStep">上一步</el-button>
        <el-button v-if="currentStep < 3" type="primary" @click="nextStep">下一步</el-button>
        <el-button v-if="currentStep === 3" type="success" @click="handleExport" :loading="exporting">
          {{ exporting ? '导出中...' : '开始导出' }}
        </el-button>
      </div>
    </el-card>

    <el-dialog v-model="schemeDialogVisible" title="选择匹配方案" width="500px">
      <el-table :data="savedSchemes" @row-click="selectScheme">
        <el-table-column prop="name" label="方案名称" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="100">
          <template #default="scope">
            <el-button type="danger" link @click.stop="deleteScheme(scope.$index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import * as XLSX from 'xlsx'
import request from '../utils/request'

export default {
  name: 'ReportExport',
  data() {
    return {
      currentStep: 0,
      filterForm: {
        institutionNo: '',
        year: new Date().getFullYear(),
        dataSources: []
      },
      filterRules: {
        year: [{ required: true, message: '请选择年度', trigger: 'change' }],
        dataSources: [{ 
          type: 'array', 
          required: true, 
          message: '请至少选择一个数据来源', 
          trigger: 'change',
          validator: (rule, value, callback) => {
            if (!value || value.length === 0) {
              callback(new Error('请至少选择一个数据来源'))
            } else {
              callback()
            }
          }
        }]
      },
      yearOptions: this.generateYearOptions(),
      selectedFields: {
        institution: [],
        contract: [],
        fee: []
      },
      availableFields: {
        institution: [
          { name: 'institutionNo', label: '机构编号' },
          { name: 'institutionName', label: '机构名称' },
          { name: 'institutionType', label: '机构类型' },
          { name: 'contactPerson', label: '联系人' },
          { name: 'contactPhone', label: '联系电话' },
          { name: 'contactEmail', label: '联系邮箱' },
          { name: 'region', label: '地区' },
          { name: 'address', label: '详细地址' },
          { name: 'institutionStatus', label: '机构状态' },
          { name: 'actualBeds', label: '实际床位' },
          { name: 'openBeds', label: '开放床位' },
          { name: 'remark', label: '备注' },
          { name: 'createTime', label: '创建时间' }
        ],
        contract: [
          { name: 'contractNo', label: '合同编号' },
          { name: 'institutionNo', label: '机构编号' },
          { name: 'contractAmount', label: '合同金额' },
          { name: 'signDate', label: '签订日期' },
          { name: 'expireDate', label: '到期日期' },
          { name: 'responsiblePerson', label: '负责人' },
          { name: 'contractStatus', label: '合同状态' },
          { name: 'remark', label: '备注' },
          { name: 'createTime', label: '创建时间' }
        ],
        fee: [
          { name: 'institutionNo', label: '机构编号' },
          { name: 'feeAmount', label: '费用金额' },
          { name: 'feeDate', label: '费用日期' },
          { name: 'paymentMethod', label: '支付方式' },
          { name: 'recordedBy', label: '录入人' },
          { name: 'remark', label: '备注' },
          { name: 'createTime', label: '创建时间' }
        ]
      },
      activeTemplateTab: 'upload',
      templateHeaders: [],
      templateFile: null,
      fieldMapping: {
        institution: {},
        contract: {},
        fee: {}
      },
      savedSchemes: [],
      schemeDialogVisible: false,
      exporting: false,
      exportProgress: 0,
      exportForm: {}
    }
  },
  computed: {
    totalSelectedFields() {
      let count = 0
      for (const source in this.selectedFields) {
        count += this.selectedFields[source]?.length || 0
      }
      return count
    },
    exportFileName() {
      const institution = this.filterForm.institutionNo || '全部'
      const year = this.filterForm.year
      const date = new Date().toISOString().slice(0, 10)
      return `报表_${institution}_${year}年_${date}.xlsx`
    }
  },
  mounted() {
    this.loadSavedSchemes()
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
    getDataSourceName(source) {
      const map = {
        institution: '机构表',
        contract: '合同表',
        fee: '费用表'
      }
      return map[source] || source
    },
    prevStep() {
      if (this.currentStep > 0) {
        this.currentStep--
      }
    },
    nextStep() {
      if (this.currentStep === 0) {
        this.$refs.filterFormRef.validate((valid) => {
          if (valid) {
            this.currentStep++
          }
        })
      } else if (this.currentStep === 1) {
        if (this.totalSelectedFields === 0) {
          this.$message.warning('请至少选择一个导出字段')
          return
        }
        this.currentStep++
      } else if (this.currentStep === 2) {
        this.currentStep++
      }
    },
    toggleAllFields(source, select) {
      if (select) {
        this.selectedFields[source] = this.availableFields[source].map(f => f.name)
      } else {
        this.selectedFields[source] = []
      }
    },
    moveField(source, fieldName, direction) {
      const fields = this.selectedFields[source]
      if (!fields) return
      
      const index = fields.indexOf(fieldName)
      if (index === -1) return
      
      const newIndex = index + direction
      if (newIndex < 0 || newIndex >= fields.length) return
      
      const temp = fields[index]
      fields[index] = fields[newIndex]
      fields[newIndex] = temp
      
      this.selectedFields[source] = [...fields]
    },
    handleTemplateChange(file) {
      this.templateFile = file.raw
      this.parseTemplate(file.raw)
    },
    async parseTemplate(file) {
      try {
        const reader = new FileReader()
        reader.onload = (e) => {
          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, { type: 'array' })
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
          const headers = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })[0]
          this.templateHeaders = headers || []
          if (this.templateHeaders.length > 0) {
            this.activeTemplateTab = 'match'
            this.$message.success('模板解析成功')
          }
        }
        reader.readAsArrayBuffer(file)
      } catch (error) {
        this.$message.error('模板解析失败')
        console.error(error)
      }
    },
    getSelectedFieldList(source) {
      const selected = this.selectedFields[source] || []
      return this.availableFields[source].filter(f => selected.includes(f.name))
    },
    autoMatchField(source, fieldName, fieldLabel) {
      const matched = this.templateHeaders.find(h => 
        h && fieldName.toLowerCase() === h.toString().toLowerCase().replace(/[^a-z0-9]/g, '')
      )
      if (matched) {
        this.fieldMapping[source][fieldName] = matched.toString()
        this.$message.success(`已匹配: ${fieldLabel} -> ${matched}`)
      } else {
        const fuzzyMatch = this.templateHeaders.find(h => 
          h && h.toString().includes(fieldLabel)
        )
        if (fuzzyMatch) {
          this.fieldMapping[source][fieldName] = fuzzyMatch.toString()
          this.$message.success(`已匹配: ${fieldLabel} -> ${fuzzyMatch}`)
        } else {
          this.$message.warning('未找到匹配的表头')
        }
      }
    },
    autoMatchAll() {
      for (const source of this.filterForm.dataSources) {
        for (const field of this.getSelectedFieldList(source)) {
          this.autoMatchField(source, field.name, field.label)
        }
      }
    },
    saveMappingScheme() {
      const schemeName = `方案_${new Date().toLocaleString()}`
      const scheme = {
        name: schemeName,
        createTime: new Date().toLocaleString(),
        mapping: JSON.parse(JSON.stringify(this.fieldMapping))
      }
      this.savedSchemes.push(scheme)
      localStorage.setItem('exportMappingSchemes', JSON.stringify(this.savedSchemes))
      this.$message.success('匹配方案已保存')
    },
    loadSavedSchemes() {
      const saved = localStorage.getItem('exportMappingSchemes')
      if (saved) {
        this.savedSchemes = JSON.parse(saved)
      }
    },
    loadMappingScheme() {
      if (this.savedSchemes.length === 0) {
        this.$message.warning('暂无保存的匹配方案')
        return
      }
      this.schemeDialogVisible = true
    },
    selectScheme(row) {
      this.fieldMapping = JSON.parse(JSON.stringify(row.mapping))
      this.schemeDialogVisible = false
      this.$message.success('已加载匹配方案')
    },
    deleteScheme(index) {
      this.savedSchemes.splice(index, 1)
      localStorage.setItem('exportMappingSchemes', JSON.stringify(this.savedSchemes))
      this.$message.success('方案已删除')
    },
    async handleExport() {
      this.exporting = true
      this.exportProgress = 0
      
      try {
        const allData = {}
        const progressStep = 100 / this.filterForm.dataSources.length
        let currentProgress = 0

        for (const source of this.filterForm.dataSources) {
          const data = await this.fetchData(source)
          allData[source] = data
          currentProgress += progressStep
          this.exportProgress = Math.round(currentProgress)
        }

        await this.generateExcel(allData)
        
        this.exportProgress = 100
        this.$message.success('导出成功')
      } catch (error) {
        console.error('导出失败:', error)
        this.$message.error('导出失败: ' + (error.message || '未知错误'))
      } finally {
        this.exporting = false
      }
    },
    async fetchData(source) {
      const params = {
        year: this.filterForm.year
      }
      if (this.filterForm.institutionNo) {
        params.institutionNo = this.filterForm.institutionNo
      }

      let url = ''
      switch (source) {
        case 'institution':
          url = '/institutions'
          break
        case 'contract':
          url = '/contracts/query'
          break
        case 'fee':
          url = '/contract-fees/all'
          break
      }

      const res = await request.get(url, { params })
      return res.data?.rows || res.data || []
    },
    async generateExcel(allData) {
      const workbook = XLSX.utils.book_new()

      for (const source of this.filterForm.dataSources) {
        const data = allData[source] || []
        const fields = this.selectedFields[source] || []
        const fieldLabels = this.availableFields[source]
          .filter(f => fields.includes(f.name))
          .map(f => f.label)

        const sheetData = data.map(row => {
          const newRow = {}
          fields.forEach((fieldName, index) => {
            const label = fieldLabels[index]
            let value = row[fieldName]
            if (fieldName === 'institutionType') {
              value = this.formatInstitutionType(value)
            } else if (fieldName === 'institutionStatus') {
              value = this.formatInstitutionStatus(value)
            } else if (fieldName === 'contractStatus') {
              value = this.formatContractStatus(value)
            }
            newRow[label] = value || ''
          })
          return newRow
        })

        const worksheet = XLSX.utils.json_to_sheet(sheetData)
        XLSX.utils.book_append_sheet(workbook, worksheet, this.getDataSourceName(source))
      }

      XLSX.writeFile(workbook, this.exportFileName)
    },
    formatInstitutionType(type) {
      const map = {
        HOSPITAL: '医院',
        CLINIC: '诊所',
        COMMUNITY: '社区卫生服务中心',
        PHARMACY: '药店',
        LABORATORY: '检验中心',
        HEALTH_CENTER: '卫生院',
        HEALTH_STATION: '卫生所',
        OTHER: '其他'
      }
      return map[type] || type
    },
    formatInstitutionStatus(status) {
      const map = {
        NORMAL: '正常',
        PAUSED: '暂停合作',
        TERMINATED: '已解约'
      }
      return map[status] || status
    },
    formatContractStatus(status) {
      const map = {
        active: '活跃',
        inactive: '失效',
        pending: '未生效'
      }
      return map[status] || status
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

.steps-container {
  margin-bottom: 30px;
}

.step-content {
  min-height: 400px;
  padding: 20px 0;
}

.step-panel {
  max-width: 800px;
}

.field-config-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  gap: 15px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.field-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.field-item {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  background: #f5f7fa;
  border-radius: 4px;
}

.template-upload {
  width: 100%;
}

.field-match-container {
  max-height: 400px;
  overflow-y: auto;
}

.match-section {
  margin-bottom: 20px;
}

.match-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 10px;
  padding-bottom: 5px;
  border-bottom: 1px solid #e4e7ed;
}

.match-row {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px dashed #ebeef5;
}

.match-left {
  width: 150px;
}

.field-label {
  font-size: 14px;
  color: #606266;
}

.match-center {
  width: 50px;
  text-align: center;
  color: #909399;
}

.match-right {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.match-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.export-preview {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 4px;
}

.preview-item {
  display: flex;
  margin-bottom: 10px;
}

.preview-label {
  width: 100px;
  color: #909399;
}

.preview-value {
  color: #303133;
  font-weight: 500;
}

.step-actions {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  justify-content: center;
  gap: 15px;
}
</style>
