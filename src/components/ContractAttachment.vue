<template>
  <div class="contract-attachment">
    <div class="attachment-header">
      <span class="attachment-title">合同附件</span>
      <el-upload
        ref="uploadRef"
        :action="uploadUrl"
        :headers="uploadHeaders"
        :before-upload="handleBeforeUpload"
        :on-success="handleUploadSuccess"
        :on-error="handleUploadError"
        :on-progress="handleUploadProgress"
        :show-file-list="false"
        accept=".pdf"
        :data="{ contractNo: contractNo, uploadBy: uploadBy, remark: '' }"
      >
        <el-button type="primary" size="small" :loading="uploading">
          <el-icon><Upload /></el-icon>
          上传PDF
        </el-button>
      </el-upload>
    </div>

    <div v-loading="loading" class="attachment-list">
      <el-empty v-if="!loading && attachmentList.length === 0" description="暂无附件" :image-size="60" />
      <div
        v-for="item in attachmentList"
        :key="item.id"
        class="attachment-item"
      >
        <div class="attachment-info">
          <el-icon class="file-icon"><Document /></el-icon>
          <div class="file-detail">
            <span class="file-name" :title="item.originalName">{{ item.originalName }}</span>
            <span class="file-meta">
              {{ formatFileSize(item.fileSize) }} · {{ item.uploadBy || '未知' }} · {{ formatDate(item.createTime) }}
            </span>
          </div>
        </div>
        <div class="attachment-actions">
          <el-button type="primary" size="small" link @click="handlePreview(item)">预览</el-button>
          <el-button type="success" size="small" link @click="handleDownload(item)">下载</el-button>
          <el-popconfirm
            title="确定要删除该附件吗？"
            confirm-button-text="确定"
            cancel-button-text="取消"
            @confirm="handleDelete(item)"
          >
            <template #reference>
              <el-button type="danger" size="small" link>删除</el-button>
            </template>
          </el-popconfirm>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="previewVisible"
      title="PDF预览"
      width="85%"
      top="3vh"
      destroy-on-close
      class="preview-dialog"
    >
      <div class="preview-toolbar">
        <el-button size="small" @click="handleOpenNewTab">
          <el-icon><View /></el-icon>
          在新窗口打开
        </el-button>
        <span class="preview-hint">如预览无法显示，请点击"在新窗口打开"</span>
      </div>
      <div class="preview-container">
        <iframe
          :src="previewUrl"
          width="100%"
          style="height: 75vh; min-height: 500px; border: 1px solid #dcdfe6; border-radius: 4px;"
          frameborder="0"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { Upload, Document, View } from '@element-plus/icons-vue'
import request from '../utils/request'

export default {
  name: 'ContractAttachment',
  components: {
    Upload,
    Document,
    View
  },
  props: {
    contractNo: {
      type: String,
      required: true
    },
    uploadBy: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      attachmentList: [],
      loading: false,
      uploading: false,
      previewVisible: false,
      previewUrl: '',
      currentPreviewId: null
    }
  },
  computed: {
    uploadUrl() {
      return '/api/attachments/upload'
    },
    uploadHeaders() {
      const token = localStorage.getItem('token')
      return token ? { Authorization: `Bearer ${token}` } : {}
    }
  },
  watch: {
    contractNo: {
      handler(newVal) {
        if (newVal) {
          this.fetchAttachments()
        } else {
          this.attachmentList = []
        }
      },
      immediate: true
    }
  },
  methods: {
    async fetchAttachments() {
      if (!this.contractNo) return
      this.loading = true
      try {
        const res = await request.get(`/attachments/list/${this.contractNo}`)
        this.attachmentList = res.data || []
      } catch (error) {
        console.error('获取附件列表失败:', error)
        this.$message.error('获取附件列表失败')
      } finally {
        this.loading = false
      }
    },
    handleBeforeUpload(file) {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
      if (!isPdf) {
        this.$message.error('仅支持上传PDF格式的文件')
        return false
      }
      const isLt50M = file.size / 1024 / 1024 < 50
      if (!isLt50M) {
        this.$message.error('文件大小不能超过50MB')
        return false
      }
      this.uploading = true
      return true
    },
    handleUploadProgress() {
      this.uploading = true
    },
    handleUploadSuccess(response) {
      this.uploading = false
      if (response.code === 200) {
        this.$message.success('上传成功')
        this.fetchAttachments()
      } else {
        this.$message.error(response.message || '上传失败')
      }
    },
    handleUploadError() {
      this.uploading = false
      this.$message.error('上传失败')
    },
    handlePreview(item) {
      const token = localStorage.getItem('token')
      this.currentPreviewId = item.id
      this.previewUrl = `/api/attachments/preview/${item.id}?token=${token}`
      this.previewVisible = true
    },
    handleOpenNewTab() {
      if (this.currentPreviewId) {
        const token = localStorage.getItem('token')
        const url = `/api/attachments/preview/${this.currentPreviewId}?token=${token}`
        window.open(url, '_blank')
      }
    },
    handleDownload(item) {
      const token = localStorage.getItem('token')
      const link = document.createElement('a')
      link.href = `/api/attachments/download/${item.id}?token=${token}`
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    async handleDelete(item) {
      try {
        await request.delete(`/attachments/${item.id}`)
        this.$message.success('删除成功')
        this.fetchAttachments()
      } catch (error) {
        console.error('删除附件失败:', error)
        this.$message.error('删除失败')
      }
    },
    formatFileSize(bytes) {
      if (!bytes) return '0 B'
      const units = ['B', 'KB', 'MB', 'GB']
      let index = 0
      let size = bytes
      while (size >= 1024 && index < units.length - 1) {
        size /= 1024
        index++
      }
      return `${size.toFixed(1)} ${units[index]}`
    },
    formatDate(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      const h = String(date.getHours()).padStart(2, '0')
      const min = String(date.getMinutes()).padStart(2, '0')
      return `${y}-${m}-${d} ${h}:${min}`
    }
  }
}
</script>

<style scoped>
.contract-attachment {
  padding: 10px 0;
}

.attachment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.attachment-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.attachment-list {
  min-height: 60px;
}

.attachment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  margin-bottom: 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
  border: 1px solid #ebeef5;
  transition: all 0.2s;
}

.attachment-item:hover {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.attachment-info {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.file-icon {
  font-size: 24px;
  color: #e6a23c;
  margin-right: 10px;
  flex-shrink: 0;
}

.file-detail {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.file-name {
  font-size: 14px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-meta {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.attachment-actions {
  display: flex;
  gap: 5px;
  flex-shrink: 0;
  margin-left: 10px;
}

.preview-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.preview-hint {
  font-size: 12px;
  color: #909399;
}

.preview-container {
  width: 100%;
  text-align: center;
}

.preview-dialog :deep(.el-dialog__body) {
  padding: 10px 20px;
}
</style>
