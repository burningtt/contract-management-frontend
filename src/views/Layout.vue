<template>
  <el-container class="layout-container">
    <el-aside width="200px">
      <div class="logo">
        <h3>合同管理系统</h3>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
      >
        <el-menu-item index="/dashboard">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </el-menu-item>
        <el-menu-item index="/institutions">
          <el-icon><OfficeBuilding /></el-icon>
          <span>机构管理</span>
        </el-menu-item>
        <el-menu-item index="/contract-query">
          <el-icon><Search /></el-icon>
          <span>机构合同</span>
        </el-menu-item>
        <el-menu-item index="/contract-fees">
          <el-icon><Money /></el-icon>
          <span>费用管理</span>
        </el-menu-item>
        <el-menu-item index="/user-management" v-if="isAdmin">
          <el-icon><UserFilled /></el-icon>
          <span>分配用户</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header>
        <div class="header-content">
          <span>{{ pageTitle }}</span>
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-icon><User /></el-icon>
              {{ userInfo.realName }}
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="changePassword">修改密码</el-dropdown-item>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>

    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="passwordDialogVisible"
      title="修改密码"
      width="450px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form
        :model="passwordForm"
        :rules="passwordRules"
        ref="passwordFormRef"
        label-width="100px"
        status-icon
      >
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            placeholder="请输入旧密码"
            show-password
            prefix-icon="Lock"
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
            prefix-icon="Key"
            @input="checkPasswordStrength"
          />
          <!-- 密码强度指示器 -->
          <div class="password-strength" v-if="passwordForm.newPassword">
            <span class="strength-label">密码强度：</span>
            <el-progress
              :percentage="passwordStrength * 20"
              :color="strengthColor"
              :stroke-width="8"
              :show-text="false"
            />
            <span class="strength-text" :style="{ color: strengthTextColor }">
              {{ strengthText }}
            </span>
          </div>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
            prefix-icon="Key"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="handlePasswordSubmit"
          :loading="passwordLoading"
        >
          确认修改
        </el-button>
      </template>
    </el-dialog>
  </el-container>
</template>

<script>
import { HomeFilled, OfficeBuilding, Search, Money, User, UserFilled, ArrowDown, Lock, Key } from '@element-plus/icons-vue'
import request from '../utils/request'

export default {
  name: 'Layout',
  components: {
    HomeFilled,
    OfficeBuilding,
    Search,
    Money,
    User,
    UserFilled,
    ArrowDown,
    Lock,
    Key
  },
  computed: {
    activeMenu() {
      return this.$route.path
    },
    pageTitle() {
      return this.$route.meta.title || '首页'
    },
    userInfo() {
      const info = localStorage.getItem('userInfo')
      return info ? JSON.parse(info) : {}
    },
    isAdmin() {
      return this.userInfo.role && this.userInfo.role.toLowerCase() === 'admin'
    },
    strengthColor() {
      const colors = ['#F56C6C', '#F56C6C', '#E6A23C', '#E6A23C', '#67C23A', '#67C23A']
      return colors[this.passwordStrength] || '#F56C6C'
    },
    strengthText() {
      const texts = ['', '弱', '弱', '中', '强', '非常强']
      return texts[this.passwordStrength] || ''
    },
    strengthTextColor() {
      const colors = ['', '#F56C6C', '#F56C6C', '#E6A23C', '#67C23A', '#67C23A']
      return colors[this.passwordStrength] || '#F56C6C'
    }
  },
  data() {
    return {
      passwordDialogVisible: false,
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      passwordRules: {
        oldPassword: [
          { required: true, message: '请输入旧密码', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, message: '密码长度至少为6位', trigger: 'blur' },
          { validator: this.validatePasswordStrength, trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请确认新密码', trigger: 'blur' },
          { validator: this.validateConfirmPassword, trigger: 'blur' }
        ]
      },
      passwordLoading: false,
      passwordStrength: 0
    }
  },
  methods: {
    handleCommand(command) {
      if (command === 'logout') {
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        this.$router.push('/login')
      } else if (command === 'changePassword') {
        this.showPasswordDialog()
      }
    },
    showPasswordDialog() {
      this.passwordDialogVisible = true
      this.passwordForm = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
      this.passwordStrength = 0
    },
    checkPasswordStrength() {
      const value = this.passwordForm.newPassword
      if (!value) {
        this.passwordStrength = 0
        return
      }
      let strength = 0
      if (value.length >= 6) strength++
      if (value.length >= 10) strength++
      if (/[a-z]/.test(value) && /[A-Z]/.test(value)) strength++
      if (/\d/.test(value)) strength++
      if (/[^a-zA-Z0-9]/.test(value)) strength++
      this.passwordStrength = Math.min(strength, 5)
    },
    validatePasswordStrength(rule, value, callback) {
      if (!value) {
        callback()
        return
      }
      if (this.passwordStrength < 2) {
        callback(new Error('密码强度太弱，建议包含大小写字母、数字和特殊字符'))
      } else {
        callback()
      }
    },
    validateConfirmPassword(rule, value, callback) {
      if (value !== this.passwordForm.newPassword) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    },
    async handlePasswordSubmit() {
      this.$refs.passwordFormRef.validate(async (valid) => {
        if (valid) {
          this.passwordLoading = true
          try {
            await request.post('/users/change-password', {
              oldPassword: this.passwordForm.oldPassword,
              newPassword: this.passwordForm.newPassword
            })
            this.$message.success('密码修改成功，请重新登录')
            this.passwordDialogVisible = false
            // 修改密码后退出登录
            setTimeout(() => {
              localStorage.removeItem('token')
              localStorage.removeItem('userInfo')
              this.$router.push('/login')
            }, 1500)
          } catch (error) {
            console.error('密码修改失败:', error)
            this.$message.error(error.response?.data?.message || '密码修改失败')
          } finally {
            this.passwordLoading = false
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.el-aside {
  background-color: #304156;
  color: #fff;
}

.password-strength {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.strength-label {
  font-size: 12px;
  color: #606266;
  white-space: nowrap;
}

.strength-text {
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

:deep(.el-progress) {
  flex: 1;
  max-width: 120px;
}

.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  background-color: #2b3a4a;
}

.logo h3 {
  margin: 0;
  font-size: 18px;
  color: #fff;
}

.el-header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.header-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
}

.el-main {
  background-color: #f0f2f5;
  padding: 20px;
}
</style>
