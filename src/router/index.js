import Login from '../views/Login.vue'
import Layout from '../views/Layout.vue'
import Dashboard from '../views/Dashboard.vue'
import InstitutionList from '../views/InstitutionList.vue'
import ContractQuery from '../views/ContractQuery.vue'
import ContractFeeList from '../views/ContractFeeList.vue'
import ReportExport from '../views/ReportExport.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { title: '首页' }
      },
      {
        path: 'institutions',
        name: 'InstitutionList',
        component: InstitutionList,
        meta: { title: '机构管理' }
      },
      {
        path: 'contract-query',
        name: 'ContractQuery',
        component: ContractQuery,
        meta: { title: '机构合同' }
      },
      {
        path: 'contract-fees',
        name: 'ContractFeeList',
        component: ContractFeeList,
        meta: { title: '费用管理' }
      },
      {
        path: 'report-export',
        name: 'ReportExport',
        component: ReportExport,
        meta: { title: '报表导出' }
      }
    ]
  }
]

export default routes
