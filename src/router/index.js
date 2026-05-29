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
        path: 'waste/vehicles',
        name: 'WasteVehicleList',
        component: WasteVehicleList,
        meta: { title: '车辆管理' }
      },
      {
        path: 'waste/staff',
        name: 'WasteStaffList',
        component: WasteStaffList,
        meta: { title: '车队人员管理' }
      },
      {
        path: 'waste/hospital',
        name: 'WasteHospitalList',
        component: WasteHospitalList,
        meta: { title: '医废录入' }
      },
      {
        path: 'waste/query',
        name: 'WasteQueryList',
        component: WasteQueryList,
        meta: { title: '医废查询' }
      },
      {
        path: 'user-management',
        name: 'UserManagement',
        component: UserManagement,
        meta: { title: '分配用户', requireAdmin: true }
      }
    ]
  }
]

export default routes
