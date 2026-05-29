<template>
  <div class="waste-staff-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>车队人员管理</span>
          <el-button type="primary" @click="handleAdd">新增人员</el-button>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="姓名">
          <el-input v-model="searchForm.staffName" placeholder="请输入姓名" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="岗位">
          <el-select v-model="searchForm.position" placeholder="请选择" clearable style="width: 120px">
            <el-option label="全部" value="" />
            <el-option label="押运员" value="押运员" />
            <el-option label="司机" value="司机" />
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

      <el-table :data="staffList" border stripe :show-overflow-tooltip="true">
        <el-table-column prop="staffNo" label="编号" width="120" align="center" />
        <el-table-column prop="staffName" label="姓名" width="120" align="center" />
        <el-table-column prop="phone" label="电话" width="140" align="center" />
        <el-table-column prop="idCard" label="证件号" min-width="180" align="center" />
        <el-table-column prop="position" label="岗位" width="120" align="center" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '正常' : '已停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" align="center" />
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" link @click="handleEdit(scope.row)">编辑</el-button>
            <el-button v-if="scope.row.status === 1" type="danger" size="small" link @click="handleDisable(scope.row)">停用</el-button>
            <el-button v-if="scope.row.status === 0" type="success" size="small" link @click="handleEnable(scope.row)">启用</el-button>
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

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" :close-on-click-modal="false" destroy-on-close>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="姓名" prop="staffName">
          <el-input v-model="form.staffName" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入电话" />
        </el-form-item>
        <el-form-item label="证件号" prop="idCard">
          <el-input v-model="form.idCard" placeholder="请输入证件号" />
        </el-form-item>
        <el-form-item label="岗位" prop="position">
          <el-select v-model="form.position" placeholder="请选择岗位" style="width: 100%">
            <el-option label="押运员" value="押运员" />
            <el-option label="司机" value="司机" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import request from '../../utils/request'

export default {
  name: 'WasteStaffList',
  data() {
    return {
      staffList: [],
      searchForm: {
        staffName: '',
        position: '',
        status: null
      },
      pagination: {
        page: 1,
        size: 10,
        total: 0
      },
      dialogVisible: false,
      dialogTitle: '',
      submitLoading: false,
      form: {
        id: null,
        staffName: '',
        phone: '',
        idCard: '',
        position: ''
      },
      rules: {
        staffName: [
          { required: true, message: '请输入姓名', trigger: 'blur' }
        ],
        position: [
          { required: true, message: '请选择岗位', trigger: 'change' }
        ]
      }
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    async loadData() {
      try {
        const params = {
          page: this.pagination.page,
          size: this.pagination.size,
          staffName: this.searchForm.staffName || undefined,
          position: this.searchForm.position || undefined
        }
        if (this.searchForm.status !== null && this.searchForm.status !== '') {
          params.status = this.searchForm.status
        }
        const res = await request.get('/waste/staff', { params })
        this.staffList = res.data.rows
        this.pagination.total = res.data.total
      } catch (error) {
        console.error('加载人员数据失败:', error)
      }
    },
    handleSearch() {
      this.pagination.page = 1
      this.loadData()
    },
    handleReset() {
      this.searchForm = { staffName: '', position: '', status: null }
      this.pagination.page = 1
      this.loadData()
    },
    handleAdd() {
      this.dialogTitle = '新增人员'
      this.form = { id: null, staffName: '', phone: '', idCard: '', position: '' }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '编辑人员'
      this.form = { ...row }
      this.dialogVisible = true
    },
    async handleSubmit() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        this.submitLoading = true
        try {
          if (this.form.id) {
            await request.put(`/waste/staff/${this.form.id}`, this.form)
            this.$message.success('更新成功')
          } else {
            await request.post('/waste/staff', this.form)
            this.$message.success('创建成功')
          }
          this.dialogVisible = false
          this.loadData()
        } catch (error) {
          console.error('提交失败:', error)
        } finally {
          this.submitLoading = false
        }
      })
    },
    async handleDisable(row) {
      try {
        await this.$confirm(`确认停用人员 ${row.staffName}？停用后该人员将不可使用。`, '提示', {
          type: 'warning'
        })
        await request.delete(`/waste/staff/${row.id}`)
        this.$message.success('停用成功')
        this.loadData()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('停用失败:', error)
        }
      }
    },
    async handleEnable(row) {
      try {
        await this.$confirm(`确认启用人员 ${row.staffName}？`, '提示', {
          type: 'info'
        })
        await request.put(`/waste/staff/${row.id}/enable`)
        this.$message.success('启用成功')
        this.loadData()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('启用失败:', error)
        }
      }
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
