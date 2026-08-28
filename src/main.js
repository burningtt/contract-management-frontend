import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import routes from './router'

const router = createRouter({
  history: createWebHistory(),
  routes
})

/**
 * 全局导航守卫：基于路由 meta 验证用户身份与权限
 * - public 路由（登录页）直接放行
 * - 未登录访问需认证页面 → 跳转登录页并记录原始目标
 * - requireAdmin 页面仅允许 role=admin 用户访问
 */
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 客户合同管理系统` : '客户合同管理系统'

  // 公开页面（登录页）直接放行
  if (to.meta.public) {
    // 已登录用户访问登录页时直接进入首页
    if (localStorage.getItem('token')) {
      return next('/dashboard')
    }
    return next()
  }

  // 校验登录状态：token 必须存在且 userInfo 完整
  const token = localStorage.getItem('token')
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null')

  if (!token || !userInfo) {
    // 清理可能残留的无效数据，携带原始目标用于登录后回跳
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    return next({ path: '/login', query: { redirect: to.fullPath } })
  }

  // 校验角色权限（RBAC 前端拦截）
  if (to.meta.requireAdmin) {
    const role = String(userInfo.role || '').toLowerCase()
    if (role !== 'admin') {
      ElementPlus.ElMessage.warning('权限不足，该页面仅管理员可访问')
      return next('/dashboard')
    }
  }

  next()
})

const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(ElementPlus)
app.use(router)
app.mount('#app')
