<template>
  <div class="institution-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>机构列表</span>
          <el-button type="primary" @click="handleAdd">新增机构</el-button>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="机构名称">
          <el-input v-model="searchForm.institutionName" placeholder="请输入机构名称" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="机构类型">
          <el-select v-model="searchForm.institutionType" placeholder="请选择" clearable style="width: 120px">
            <el-option label="全部" value="" />
            <el-option label="医院" value="HOSPITAL" />
            <el-option label="诊所" value="CLINIC" />
            <el-option label="社区卫生服务中心" value="COMMUNITY" />
            <el-option label="药店" value="PHARMACY" />
            <el-option label="检验中心" value="LABORATORY" />
            <el-option label="卫生院" value="HEALTH_CENTER" />
            <el-option label="卫生所" value="HEALTH_STATION" />
            <el-option label="其他" value="OTHER" />
          </el-select>
        </el-form-item>
        <el-form-item label="机构状态">
          <el-select v-model="searchForm.institutionStatus" placeholder="请选择" clearable style="width: 120px">
            <el-option label="全部" value="" />
            <el-option label="正常" value="NORMAL" />
            <el-option label="暂停合作" value="PAUSED" />
            <el-option label="已解约" value="TERMINATED" />
          </el-select>
        </el-form-item>
        <el-form-item label="地区">
          <el-select v-model="searchForm.region" placeholder="请选择地区" clearable style="width: 150px">
            <el-option label="全部" value="" />
            <el-option v-for="item in regionOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="institutionList" border stripe resizable :show-overflow-tooltip="true">
        <el-table-column prop="institutionNo" label="编号" width="90" min-width="90" align="center" />
        <el-table-column prop="institutionName" label="名称" min-width="150" align="center" show-overflow-tooltip />
        <el-table-column prop="institutionType" label="类型" width="100" min-width="100" align="center">
          <template #default="scope">
            {{ getInstitutionTypeText(scope.row.institutionType) }}
          </template>
        </el-table-column>
        <el-table-column prop="contactPerson" label="联系人" width="90" min-width="90" align="center" />
        <el-table-column prop="contactPhone" label="电话" width="120" min-width="120" align="center" />
        <el-table-column prop="region" label="地区" width="100" min-width="100" align="center">
          <template #default="scope">
            {{ getRegionName(scope.row.region) }}
          </template>
        </el-table-column>
        <el-table-column prop="institutionStatus" label="状态" width="90" min-width="90" align="center">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.institutionStatus)" size="small">
              {{ getStatusText(scope.row.institutionStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="actualBeds" label="实际床位" width="90" min-width="90" align="center" />
        <el-table-column prop="openBeds" label="开放床位" width="90" min-width="90" align="center" />
        <el-table-column label="操作" width="150" min-width="150" align="center" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" link @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" link @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <span class="total-count">共 {{ total }} 条机构信息</span>
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="机构名称" prop="institutionName">
          <el-input v-model="form.institutionName" />
        </el-form-item>
        <el-form-item label="机构类型" prop="institutionType">
          <el-select v-model="form.institutionType" style="width: 100%">
            <el-option label="医院" value="HOSPITAL" />
            <el-option label="诊所" value="CLINIC" />
            <el-option label="社区卫生服务中心" value="COMMUNITY" />
            <el-option label="药店" value="PHARMACY" />
            <el-option label="检验中心" value="LABORATORY" />
            <el-option label="卫生院" value="HEALTH_CENTER" />
            <el-option label="卫生所" value="HEALTH_STATION" />
            <el-option label="其他" value="OTHER" />
          </el-select>
        </el-form-item>
        <el-form-item label="联系人" prop="contactPerson">
          <el-input v-model="form.contactPerson" />
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="form.contactPhone" />
        </el-form-item>
        <el-form-item label="联系邮箱" prop="contactEmail">
          <el-input v-model="form.contactEmail" />
        </el-form-item>
        <el-form-item label="地区" prop="region">
          <el-select v-model="form.region" placeholder="请选择地区" style="width: 100%">
            <el-option v-for="item in regionOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="详细地址" prop="address">
          <el-input v-model="form.address" type="textarea" />
        </el-form-item>
        <el-form-item label="机构状态" prop="institutionStatus">
          <el-select v-model="form.institutionStatus" style="width: 100%">
            <el-option label="正常" value="NORMAL" />
            <el-option label="暂停合作" value="PAUSED" />
            <el-option label="已解约" value="TERMINATED" />
          </el-select>
        </el-form-item>
        <el-form-item label="实际床位" prop="actualBeds">
          <el-input-number v-model="form.actualBeds" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="开放床位" prop="openBeds">
          <el-input-number v-model="form.openBeds" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="录入人" prop="createdBy">
          <el-input v-model="form.createdBy" readonly />
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
import { REGION_OPTIONS, getRegionName, getRegionCode } from '../utils/region'

export default {
  name: 'InstitutionList',
  data() {
    return {
      institutionList: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      regionOptions: REGION_OPTIONS,
      searchForm: {
        institutionName: '',
        institutionType: '',
        institutionStatus: '',
        region: ''
      },
      dialogVisible: false,
      dialogTitle: '新增机构',
      form: {
        id: null,
        institutionName: '',
        institutionType: 'HOSPITAL',
        contactPerson: '',
        contactPhone: '',
        contactEmail: '',
        region: '',
        address: '',
        institutionStatus: 'NORMAL',
        actualBeds: 0,
        openBeds: 0,
        remark: ''
      },
      rules: {
        institutionName: [{ required: true, message: '请输入机构名称', trigger: 'blur' }],
        institutionType: [{ required: true, message: '请选择机构类型', trigger: 'change' }],
        contactPhone: [{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }],
        contactEmail: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }]
      }
    }
  },
  mounted() {
    this.fetchList()
  },
  methods: {
    async fetchList() {
      try {
        let url = '/institutions'
        const params = []
        
        if (this.searchForm.institutionName) {
          params.push(`institutionName=${this.searchForm.institutionName}`)
        }
        if (this.searchForm.institutionType) {
          params.push(`institutionType=${this.searchForm.institutionType}`)
        }
        if (this.searchForm.institutionStatus) {
          params.push(`institutionStatus=${this.searchForm.institutionStatus}`)
        }
        if (this.searchForm.region) {
          params.push(`region=${this.searchForm.region}`)
        }
        
        params.push(`page=${this.currentPage}`)
        params.push(`size=${this.pageSize}`)
        
        if (params.length > 0) {
          url += '?' + params.join('&')
        }
        
        const res = await request.get(url)
        this.institutionList = res.data.rows
        this.total = res.data.total
      } catch (error) {
        console.error('获取机构列表失败:', error)
      }
    },
    handleSearch() {
      this.currentPage = 1
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
    handleReset() {
      this.searchForm = {
        institutionName: '',
        institutionType: '',
        institutionStatus: '',
        region: ''
      }
      this.currentPage = 1
      this.fetchList()
    },
    handleAdd() {
      this.dialogTitle = '新增机构'
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
      this.form = {
        id: null,
        institutionName: '',
        institutionType: 'HOSPITAL',
        contactPerson: '',
        contactPhone: '',
        contactEmail: '',
        region: '',
        address: '',
        institutionStatus: 'NORMAL',
        actualBeds: 0,
        openBeds: 0,
        createdBy: userInfo.realName || '',
        remark: ''
      }
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogTitle = '编辑机构'
      this.form = { ...row }
      this.dialogVisible = true
    },
    async handleDelete(row) {
      try {
        await this.$confirm('确定要删除该机构吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await request.delete(`/institutions/${row.id}`)
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
              await request.put(`/institutions/${this.form.id}`, this.form)
              this.$message.success('更新成功')
            } else {
              await request.post('/institutions', this.form)
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
    getInstitutionTypeText(type) {
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
    getStatusType(status) {
      const map = {
        NORMAL: 'success',
        PAUSED: 'warning',
        TERMINATED: 'danger'
      }
      return map[status] || 'info'
    },
    getStatusText(status) {
      const map = {
        NORMAL: '正常',
        PAUSED: '暂停合作',
        TERMINATED: '已解约'
      }
      return map[status] || status
    },
    getRegionName
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
  margin-bottom: 20px;
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
</style>
