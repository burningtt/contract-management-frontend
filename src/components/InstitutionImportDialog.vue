<template>
  <el-dialog
    v-model="visible"
    title="机构数据导入"
    width="800px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="import-container">
      <!-- 步骤指示器 -->
      <el-steps :active="currentStep" finish-status="success" simple style="margin-bottom: 20px">
        <el-step title="上传文件" />
        <el-step title="数据预览" />
        <el-step title="导入结果" />
      </el-steps>

      <!-- 步骤1：文件上传 -->
      <div v-show="currentStep === 0" class="step-content">
        <div class="upload-area">
          <el-upload
            ref="uploadRef"
            class="upload-dragger"
            drag
            :auto-upload="false"
            :limit="1"
            :on-change="handleFileChange"
            :on-exceed="handleExceed"
            :before-upload="beforeUpload"
            accept=".xlsx"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              将Excel文件拖到此处，或<em>点击选择文件</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                仅支持.xlsx格式的Excel文件，文件大小不超过10MB，最多支持1000条记录
              </div>
            </template>
          </el-upload>
        </div>

        <div class="template-download">
          <el-button type="primary" link @click="downloadTemplate">
            <el-icon><Download /></el-icon>
            下载导入模板
          </el-button>
        </div>

        <div class="format-info">
          <el-collapse>
            <el-collapse-item title="数据格式要求" name="format">
              <ul>
                <li><strong>地区</strong>：必填，如：汉滨区、旬阳市等</li>
                <li><strong>机构名称</strong>：必填，不能与已有机构重复</li>
                <li><strong>联系电话</strong>：选填，格式如：0915-1234567 或 13800138000</li>
                <li><strong>机构类型</strong>：选填，如：综合医院、专科医院等</li>
                <li><strong>联系人</strong>：选填</li>
                <li><strong>实际床位</strong>：选填，必须为非负整数</li>
                <li><strong>开放床位</strong>：选填，必须为非负整数</li>
                <li><strong>备注</strong>：选填</li>
              </ul>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>

      <!-- 步骤2：数据预览 -->
      <div v-show="currentStep === 1" class="step-content">
        <div class="preview-summary">
          <el-tag type="success">有效数据：{{ validCount }} 条</el-tag>
          <el-tag type="danger" style="margin-left: 10px">无效数据：{{ invalidCount }} 条</el-tag>
          <el-tag type="info" style="margin-left: 10px">总计：{{ totalCount }} 条</el-tag>
        </div>

        <el-tabs v-model="previewTab" style="margin-top: 15px">
          <el-tab-pane label="有效数据" name="valid">
            <el-table :data="validData" border stripe max-height="300" v-loading="parsing">
              <el-table-column prop="rowNumber" label="行号" width="70" align="center" />
              <el-table-column prop="region" label="地区" width="100" align="center" />
              <el-table-column prop="institutionName" label="机构名称" min-width="150" align="center" show-overflow-tooltip />
              <el-table-column prop="contactPhone" label="联系电话" width="130" align="center" />
              <el-table-column prop="institutionType" label="机构类型" width="100" align="center" />
              <el-table-column prop="actualBeds" label="实际床位" width="90" align="center" />
              <el-table-column prop="openBeds" label="开放床位" width="90" align="center" />
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="无效数据" name="invalid">
            <el-table :data="invalidData" border stripe max-height="300">
              <el-table-column prop="rowNumber" label="行号" width="70" align="center" />
              <el-table-column prop="institutionName" label="机构名称" min-width="150" align="center" show-overflow-tooltip />
              <el-table-column prop="errorMessage" label="错误原因" min-width="200" align="center">
                <template #default="scope">
                  <el-text type="danger">{{ scope.row.errorMessage }}</el-text>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>

        <div class="import-options" style="margin-top: 15px">
          <el-radio-group v-model="importOption">
            <el-radio value="valid">仅导入有效数据（{{ validCount }} 条）</el-radio>
            <el-radio value="all" disabled>全部导入（含无效数据）</el-radio>
          </el-radio-group>
        </div>
      </div>

      <!-- 步骤3：导入结果 -->
      <div v-show="currentStep === 2" class="step-content">
        <div class="result-summary">
          <el-result
            :icon="importResult.failCount === 0 ? 'success' : 'warning'"
            :title="importResult.failCount === 0 ? '导入成功' : '导入完成（部分失败）'"
          >
            <template #sub-title>
              <div class="result-stats">
                <p>成功导入：<strong style="color: #67c23a">{{ importResult.successCount }}</strong> 条</p>
                <p v-if="importResult.failCount > 0">
                  导入失败：<strong style="color: #f56c6c">{{ importResult.failCount }}</strong> 条
                </p>
                <p>总记录数：<strong>{{ importResult.totalCount }}</strong> 条</p>
              </div>
            </template>
          </el-result>
        </div>

        <div v-if="importResult.errors && importResult.errors.length > 0" class="error-list">
          <el-divider>失败记录</el-divider>
          <el-table :data="importResult.errors" border stripe max-height="200">
            <el-table-column prop="rowNumber" label="行号" width="70" align="center" />
            <el-table-column prop="institutionName" label="机构名称" min-width="150" align="center" />
            <el-table-column prop="errorMessage" label="失败原因" min-width="200" align="center">
              <template #default="scope">
                <el-text type="danger">{{ scope.row.errorMessage }}</el-text>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button v-if="currentStep > 0" @click="prevStep">上一步</el-button>
        <el-button v-if="currentStep === 0" @click="handleClose">取消</el-button>
        <el-button
          v-if="currentStep === 0"
          type="primary"
          :disabled="!selectedFile"
          :loading="parsing"
          @click="parseFile"
        >
          解析文件
        </el-button>
        <el-button
          v-if="currentStep === 1"
          type="primary"
          :disabled="validCount === 0"
          :loading="importing"
          @click="executeImport"
        >
          确认导入
        </el-button>
        <el-button v-if="currentStep === 2" type="primary" @click="handleClose">完成</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { UploadFilled, Download } from '@element-plus/icons-vue'
import request from '../utils/request'

export default {
  name: 'InstitutionImportDialog',
  components: {
    UploadFilled,
    Download
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'success'],
  data() {
    return {
      currentStep: 0,
      selectedFile: null,
      parsing: false,
      importing: false,
      previewTab: 'valid',
      importOption: 'valid',
      parseResult: {
        totalCount: 0,
        successCount: 0,
        failCount: 0,
        validData: [],
        errors: []
      },
      importResult: {
        totalCount: 0,
        successCount: 0,
        failCount: 0,
        errors: []
      }
    }
  },
  computed: {
    visible: {
      get() {
        return this.modelValue
      },
      set(val) {
        this.$emit('update:modelValue', val)
      }
    },
    validCount() {
      return this.parseResult.validData ? this.parseResult.validData.length : 0
    },
    invalidCount() {
      return this.parseResult.errors ? this.parseResult.errors.length : 0
    },
    totalCount() {
      return this.parseResult.totalCount || 0
    },
    validData() {
      return this.parseResult.validData || []
    },
    invalidData() {
      return this.parseResult.errors || []
    }
  },
  methods: {
    handleClose() {
      this.resetForm()
      this.visible = false
    },
    resetForm() {
      this.currentStep = 0
      this.selectedFile = null
      this.parsing = false
      this.importing = false
      this.previewTab = 'valid'
      this.importOption = 'valid'
      this.parseResult = {
        totalCount: 0,
        successCount: 0,
        failCount: 0,
        validData: [],
        errors: []
      }
      this.importResult = {
        totalCount: 0,
        successCount: 0,
        failCount: 0,
        errors: []
      }
    },
    beforeUpload(file) {
      const isXlsx = file.name.toLowerCase().endsWith('.xlsx')
      const isLt10M = file.size / 1024 / 1024 < 10

      if (!isXlsx) {
        this.$message.error('仅支持.xlsx格式的Excel文件')
        return false
      }
      if (!isLt10M) {
        this.$message.error('文件大小不能超过10MB')
        return false
      }
      return true
    },
    handleFileChange(file) {
      if (this.beforeUpload(file.raw)) {
        this.selectedFile = file.raw
      } else {
        this.selectedFile = null
      }
    },
    handleExceed() {
      this.$message.warning('一次只能上传一个文件')
    },
    async parseFile() {
      if (!this.selectedFile) {
        this.$message.warning('请先选择文件')
        return
      }

      this.parsing = true
      const formData = new FormData()
      formData.append('file', this.selectedFile)

      try {
        const res = await request.post('/institutions/import/parse', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        this.parseResult = res.data || {
          totalCount: 0,
          successCount: 0,
          failCount: 0,
          validData: [],
          errors: []
        }
        this.currentStep = 1
        if (this.validCount === 0) {
          this.$message.warning('没有有效的数据可以导入')
        }
      } catch (error) {
        console.error('解析文件失败:', error)
        this.$message.error(error.response?.data?.message || '解析文件失败')
      } finally {
        this.parsing = false
      }
    },
    async executeImport() {
      if (this.validCount === 0) {
        this.$message.warning('没有有效的数据可以导入')
        return
      }

      try {
        await this.$confirm(
          `确定要导入 ${this.validCount} 条有效数据吗？`,
          '确认导入',
          {
            confirmButtonText: '确定导入',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
      } catch {
        return
      }

      this.importing = true
      try {
        const res = await request.post('/institutions/import/execute', this.validData)
        this.importResult = res.data || {
          totalCount: 0,
          successCount: 0,
          failCount: 0,
          errors: []
        }
        this.currentStep = 2
        if (this.importResult.successCount > 0) {
          this.$emit('success')
        }
      } catch (error) {
        console.error('导入数据失败:', error)
        this.$message.error(error.response?.data?.message || '导入数据失败')
      } finally {
        this.importing = false
      }
    },
    prevStep() {
      if (this.currentStep > 0) {
        this.currentStep--
      }
    },
    async downloadTemplate() {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('/api/institutions/import/template', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (!response.ok) {
          throw new Error('下载失败')
        }
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'institution_import_template.xlsx'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } catch (error) {
        console.error('下载模板失败:', error)
        this.$message.error('下载模板失败')
      }
    }
  }
}
</script>

<style scoped>
.import-container {
  min-height: 300px;
}

.step-content {
  padding: 10px 0;
}

.upload-area {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.upload-dragger {
  width: 100%;
}

.template-download {
  text-align: center;
  margin-bottom: 15px;
}

.format-info {
  margin-top: 15px;
}

.format-info ul {
  padding-left: 20px;
  margin: 0;
}

.format-info li {
  margin: 8px 0;
  color: #606266;
}

.preview-summary {
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.import-options {
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.result-summary {
  text-align: center;
}

.result-stats {
  font-size: 14px;
  color: #606266;
}

.result-stats p {
  margin: 5px 0;
}

.error-list {
  margin-top: 15px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
