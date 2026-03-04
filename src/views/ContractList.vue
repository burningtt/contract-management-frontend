<template>
  <div class="contract-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>合同列表</span>
          <el-button type="primary" @click="handleAdd">新增合同</el-button>
        </div>
      </template>

      <el-table :data="contractList" border style="width: 100%">
        <el-table-column prop="contractNo" label="合同编号" width="150" />
        <el-table-column prop="contractName" label="合同名称" />
        <el-table-column prop="institutionNo" label="机构编号" width="100" />
        <el-table-column prop="contractType" label="合同类型" width="120" />
        <el-table-column prop="contractAmount" label="合同金额" width="120">
          <template #default="scope">
            ¥{{ scope.row.contractAmount }}
          </template>
        </el-table-column>
        <el-table-column prop="signDate" label="签订日期" width="120" />
        <el-table-column prop="expireDate" label="到期日期" width="120" />
        <el-table-column prop="contractStatus" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.contractStatus)">
              {{ getStatusText(scope.row.contractStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="合同编号" prop="contractNo">
          <el-input v-model="form.contractNo" />
        </el-form-item>
        <el-form-item label="合同名称" prop="contractName">
          <el-input v-model="form.contractName" />
        </el-form-item>
        <el-form-item label="机构" prop="institutionNo">
          <el-select v-model="form.institutionNo" placeholder="请选择机构" style="width: 100%">
            <el-option
              v-for="institution in institutionList"
              :key="institution.institutionNo"
              :label="`${institution.institutionNo} - ${institution.institutionName}`"
              :value="institution.institutionNo"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="合同类型" prop="contractType">
          <el-input v-model="form.contractType" />
        </el-form-item>
        <el-form-item label="合同金额" prop="contractAmount">
          <el-input-number v-model="form.contractAmount" :precision="2" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="签订日期" prop="signDate">
          <el-date-picker v-model="form.signDate" type="date" style="width: 100%" />
        </el-form-item>
        <el-form-item label="到期日期" prop="expireDate">
          <el-date-picker v-model="form.expireDate" type="date" style="width: 100%" />
        </el-form-item>
        <el-form-item label="付款方式" prop="paymentMethod">
          <el-input v-model="form.paymentMethod" />
        </el-form-item>
        <el-form-item label="付款周期" prop="paymentCycle">
          <el-input v-model="form.paymentCycle" />
        </el-form-item>
        <el-form-item label="负责人" prop="responsiblePerson">
          <el-input v-model="form.responsiblePerson" />
        </el-form-item>
        <el-form-item label="合同状态" prop="contractStatus">
          <el-select v-model="form.contractStatus" style="width: 100%">
            <el-option label="草稿" value="DRAFT" />
            <el-option label="待审批" value="PENDING" />
            <el-option label="已审批" value="APPROVED" />
            <el-option label="已驳回" value="REJECTED" />
            <el-option label="已过期" value="EXPIRED" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" />
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
  name: 'ContractList',
  data() {
    return {
      contractList: [],
      institutionList: [],
      dialogVisible: false,
      dialogTitle: '新增合同',
      form: {
        id: null,
        contractNo: '',
        contractName: '',
        institutionNo: '',
        contractType: '',
        contractAmount: 0,
        signDate: '',
        expireDate: '',
        paymentMethod: '',
        paymentCycle: '',
        responsiblePerson: '',
        contractStatus: 'DRAFT',
        remark: ''
      },
      rules: {
        contractNo: [{ required: true, message: '请输入合同编号', trigger: 'blur' }],
        contractName: [{ required: true, message: '请输入合同名称', trigger: 'blur' }],
        institutionNo: [{ required: true, message: '请选择机构', trigger: 'change' }],
        contractAmount: [{ required: true, message: '请输入合同金额', trigger: 'blur' }]
      }
    }
  },
  mounted() {
    this.fetchList()
    this.fetchInstitutionList()
  },
  methods: {
    async fetchList() {
      try {
        const res = await request.get('/contracts')
        this.contractList = res.data
      } catch (error) {
        console.error('获取合同列表失败:', error)
      }
    },
    async fetchInstitutionList() {
      try {
        const res = await request.get('/institutions')
        this.institutionList = res.data
      } catch (error) {
        console.error('获取机构列表失败:', error)
      }
    },
    handleAdd() {
      this.dialogTitle = '新增合同'
      this.form = {
        id: null,
        contractNo: '',
        contractName: '',
        institutionNo: '',
        contractType: '',
        contractAmount: 0,
        signDate: '',
        expireDate: '',
        paymentMethod: '',
        paymentCycle: '',
        responsiblePerson: '',
        contractStatus: 'DRAFT',
        remark: ''
      }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '编辑合同'
      this.form = { ...row }
      this.dialogVisible = true
    },
    async handleDelete(row) {
      try {
        await this.$confirm('确定要删除该合同吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await request.delete(`/contracts/${row.id}`)
        this.$message.success('删除成功')
        this.fetchList()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除失败:', error)
        }
      }
    },
    async handleSubmit() {
      this.$refs.formRef.validate(async (valid) => {
        if (valid) {
          try {
            if (this.form.id) {
              await request.put(`/contracts/${this.form.id}`, this.form)
              this.$message.success('更新成功')
            } else {
              await request.post('/contracts', this.form)
              this.$message.success('创建成功')
            }
            this.dialogVisible = false
            this.fetchList()
          } catch (error) {
            console.error('提交失败:', error)
          }
        }
      })
    },
    getStatusType(status) {
      const map = {
        DRAFT: 'info',
        PENDING: 'warning',
        APPROVED: 'success',
        REJECTED: 'danger',
        EXPIRED: 'danger'
      }
      return map[status] || 'info'
    },
    getStatusText(status) {
      const map = {
        DRAFT: '草稿',
        PENDING: '待审批',
        APPROVED: '已审批',
        REJECTED: '已驳回',
        EXPIRED: '已过期'
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
</style>
