import Login from '../views/Login.vue'
import Layout from '../views/Layout.vue'
import Dashboard from '../views/Dashboard.vue'
import InstitutionList from '../views/InstitutionList.vue'
import ContractQuery from '../views/ContractQuery.vue'
import ContractFeeList from '../views/ContractFeeList.vue'
import UserManagement from '../views/UserManagement.vue'
import WasteVehicleList from '../views/waste/WasteVehicleList.vue'
import WasteStaffList from '../views/waste/WasteStaffList.vue'
import WasteHospitalList from '../views/waste/WasteHospitalList.vue'
import WasteQueryList from '../views/waste/WasteQueryList.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: '登录', public: true }
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
        meta: { title: '首页', requiresAuth: true }
      },
      {
        path: 'institutions',
        name: 'InstitutionList',
        component: InstitutionList,
        meta: { title: '机构管理', requiresAuth: true }
      },
      {
        path: 'contract-query',
        name: 'ContractQuery',
        component: ContractQuery,
        meta: { title: '机构合同', requiresAuth: true }
      },
      {
        path: 'contract-fees',
        name: 'ContractFeeList',
        component: ContractFeeList,
        meta: { title: '费用管理', requiresAuth: true }
      },
      {
        path: 'waste/vehicles',
        name: 'WasteVehicleList',
        component: WasteVehicleList,
        meta: { title: '车辆管理', requiresAuth: true }
      },
      {
        path: 'waste/staff',
        name: 'WasteStaffList',
        component: WasteStaffList,
        meta: { title: '车队人员管理', requiresAuth: true }
      },
      {
        path: 'waste/hospital',
        name: 'WasteHospitalList',
        component: WasteHospitalList,
        meta: { title: '医废录入', requiresAuth: true }
      },
      {
        path: 'waste/query',
        name: 'WasteQueryList',
        component: WasteQueryList,
        meta: { title: '医废查询', requiresAuth: true }
      },
      {
        path: 'user-management',
        name: 'UserManagement',
        component: UserManagement,
        meta: { title: '分配用户', requiresAuth: true, requireAdmin: true }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/dashboard'
  }
]

export default routes
