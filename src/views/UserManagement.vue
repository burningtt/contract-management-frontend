<template>
  <div class="user-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>分配用户</span>
          <el-button type="primary" @click="handleAdd">用户录入</el-button>
        </div>
      </template>

      <div v-loading="loading" class="table-container">
        <el-table :data="userList" border stripe resizable :show-overflow-tooltip="true">
          <el-table-column prop="id" label="ID" width="60" min-width="60" align="center" />
          <el-table-column prop="username" label="用户名" width="120" min-width="120" align="center" />
          <el-table-column prop="realName" label="真实姓名" width="100" min-width="100" align="center" />
          <el-table-column prop="phone" label="手机号" width="120" min-width="120" align="center" />
          <el-table-column prop="email" label="邮箱" min-width="180" align="center" show-overflow-tooltip />
          <el-table-column prop="role" label="角色" width="100" min-width="100" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.role && scope.row.role.toLowerCase() === 'admin' ? 'danger' : 'primary'" size="small">
                {{ scope.row.role && scope.row.role.toLowerCase() === 'admin' ? '管理员' : '普通用户' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="80" min-width="80" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.status === 1 ? 'success' : 'info'" size="small">
                {{ scope.row.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="170" min-width="170" align="center">
            <template #default="scope">
              {{ formatDateTime(scope.row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" min-width="150" align="center" fixed="right">
            <template #default="scope">
              <el-button type="primary" size="small" link @click="handleEdit(scope.row)">修改</el-button>
              <el-button type="danger" size="small" link @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-empty v-if="!loading && userList.length === 0" description="暂无数据" />
      </div>
    </el-card>

    <!-- 用户录入/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" :disabled="isEdit" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="form.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="管理员" value="admin" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
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

export default {
  name: 'UserManagement',
  data() {
    return {
      userList: [],
      loading: false,
      dialogVisible: false,
      dialogTitle: '用户录入',
      isEdit: false,
      form: {
        id: null,
        username: '',
        password: '',
        realName: '',
        phone: '',
        email: '',
        role: 'user',
        status: 1
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
        ],
        realName: [
          { required: true, message: '请输入真实姓名', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        role: [
          { required: true, message: '请选择角色', trigger: 'change' }
        ],
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ]
      }
    }
  },
  mounted() {
    this.fetchList()
  },
  methods: {
    async fetchList() {
      this.loading = true
      try {
        const res = await request.get('/users')
        this.userList = res.data || []
      } catch (error) {
        console.error('获取用户列表失败:', error)
        this.$message.error('获取用户列表失败')
      } finally {
        this.loading = false
      }
    },
    handleAdd() {
      this.dialogTitle = '用户录入'
      this.isEdit = false
      this.form = {
        id: null,
        username: '',
        password: '',
        realName: '',
        phone: '',
        email: '',
        role: 'user',
        status: 1
      }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '修改用户'
      this.isEdit = true
      this.form = {
        id: row.id,
        username: row.username,
        realName: row.realName,
        phone: row.phone,
        email: row.email,
        role: row.role,
        status: row.status
      }
      this.dialogVisible = true
    },
    async handleDelete(row) {
      try {
        await this.$confirm('确定要删除该用户吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await request.delete(`/users/${row.id}`)
        this.$message.success('删除成功')
        this.fetchList()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除失败:', error)
          this.$message.error('删除失败')
        }
      }
    },
    handleSubmit() {
      this.$refs.formRef.validate(async (valid) => {
        if (valid) {
          try {
            if (this.isEdit) {
              await request.put(`/users/${this.form.id}`, this.form)
              this.$message.success('修改成功')
            } else {
              await request.post('/users', this.form)
              this.$message.success('创建成功')
            }
            this.dialogVisible = false
            this.fetchList()
          } catch (error) {
            console.error(this.isEdit ? '修改失败:' : '创建失败:', error)
            this.$message.error(this.isEdit ? '修改失败' : '创建失败')
          }
        } else {
          return false
        }
      })
    },
    formatDateTime(dateTime) {
      if (!dateTime) return ''
      return dateTime.replace('T', ' ').substring(0, 19)
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

.table-container {
  min-height: 300px;
}
</style>
