import Vue from 'vue';
import store from '@/store';
import Layout from '@/layout';
import VueRouter from 'vue-router';
import { Modal, message } from 'ant-design-vue';

Vue.use(VueRouter);

const BackBtn = {
  render: (h) => (
    <RouterLink class="back" to="/patrol/task-manage">
      <AButton type="primary" size="small">
        返回
      </AButton>
    </RouterLink>
  ),
};

export const baseRoutes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    component: () => import('@/views/user/login'),
  },
];

export const asyncRoutes = {
  // 配置管理员
  111: [
    {
      path: '/system',
      component: Layout,
      meta: { title: '用户管理', single: true },
      children: [
        {
          path: '',
          name: 'UserManage',
          component: () => import('@/views/system/user-manage'),
        },
      ],
    },
    {
      path: '/planmanage',
      component: Layout,
      meta: { title: '方案审核', single: true },
      children: [
        {
          path: '',
          name: 'PlanManage',
          component: () => import('@/views/patrol/plan-manage'),
        },
      ],
    },
  ],
  // 数据管理员
  222: [
    {
      path: '/audit',
      component: Layout,
      meta: { title: '审计管理', single: true },
      children: [
        {
          path: '',
          name: 'AuditManage',
          component: () => import('@/views/audit/audit-manage'),
          // meta: { title: '审计数据管理' },
        },
      ],
    },
  ],
  // 运维人员
  333: [
    {
      path: '/overview',
      component: Layout,
      meta: { title: '信息总览', single: true },
      children: [
        {
          path: '',
          name: 'Overview',
          component: () => import('@/views/overview/index'),
        },
      ],
    },
    {
      path: '/statistics',
      name: 'Statistics',
      component: Layout,
      meta: { title: '查询统计' },
      children: [
        {
          path: 'patrol-task',
          name: 'PatrolTask',
          component: () => import('@/views/statistics/patrol-task'),
          meta: {
            title: '巡视任务统计',
          },
        },
        {
          path: 'robot-apply',
          name: 'RobotApply',
          component: () => import('@/views/statistics/robot-apply'),
          meta: {
            title: '机器人应用统计',
          },
        },
        {
          path: 'camera-apply',
          name: 'CameraApply',
          component: () => import('@/views/statistics/camera-apply'),
          meta: {
            title: '摄像机应用统计',
          },
        },
        {
          path: 'alarm-statis',
          name: 'AlarmStatis',
          component: () => import('@/views/statistics/alarm-statis'),
          meta: {
            title: '告警信息统计',
          },
        },
        {
          path: 'alarm-query',
          name: 'AlarmQuery',
          component: () => import('@/views/statistics/alarm-query'),
          meta: {
            title: '告警信息查询',
          },
        },
        {
          path: 'defect-statis',
          name: 'DefectStatis',
          component: () => import('@/views/statistics/defect-statis'),
          meta: {
            title: '缺陷信息统计',
          },
        },
        {
          path: 'defect-query',
          name: 'DefectQuery',
          component: () => import('@/views/statistics/defect-query'),
          meta: {
            title: '缺陷信息查询',
          },
        },
      ],
    },
    {
      path: '/monitor',
      name: 'Monitor',
      component: Layout,
      meta: { title: '视频监控' },
      children: [
        {
          path: 'integrate',
          name: 'IntegratedMonitor',
          component: () => import('@/views/monitor/integrate'),
          meta: {
            title: '综合监控',
          },
        },
        {
          path: 'playback',
          name: 'VideoPlayback',
          component: () => import('@/views/monitor/playback'),
          meta: {
            title: '录像回放',
          },
        },
      ],
    },
    {
      path: '/patrol',
      name: 'Patrol',
      component: Layout,
      meta: { title: '智能巡视' },
      children: [
        {
          path: 'task-calendar',
          name: 'TaskCalendar',
          component: () => import('@/views/patrol/task-calendar'),
          meta: {
            title: '巡视任务日历',
          },
        },
        {
          path: 'task-manage',
          name: 'TaskManage',
          component: () => import('@/views/patrol/task-manage'),
          meta: {
            title: '巡视任务管理',
          },
        },
        {
          path: 'task-detail',
          name: 'TaskDetail',
          // component: () => import('@/views/patrol/task-detail'),
          components: {
            default: () => import('@/views/patrol/task-detail'),
            header: BackBtn,
          },
          meta: {
            hidden: true,
            title: '巡视任务详情',
          },
        },
        {
          path: 'plan-manage',
          name: 'PlanManage',
          component: () => import('@/views/patrol/plan-manage'),
          meta: {
            title: '巡视方案管理',
          },
        },
        {
          path: 'host-manage',
          name: 'HostManage',
          component: () => import('@/views/patrol/host-manage'),
          meta: {
            title: '巡视主机管理',
          },
        },
        {
          path: 'point-manage',
          name: 'PonitManage',
          component: () => import('@/views/patrol/point-manage'),
          meta: {
            title: '巡检点位管理',
          },
        },
        {
          path: 'maint-manage',
          name: 'MaintManage',
          component: () => import('@/views/patrol/maint-manage'),
          meta: {
            title: '检修区域设置',
          },
        },
        {
          path: 'robot-manage',
          name: 'RobotManage',
          component: () => import('@/views/patrol/robot-manage'),
          meta: {
            title: '机器人管理',
          },
        },
      ],
    },
    {
      path: '/stereo',
      name: 'Stereo',
      component: Layout,
      meta: { title: '立体巡视' },
      children: [
        {
          path: 'realtime-monitor',
          name: 'RealtimeMonitor',
          component: () => import('@/views/stereo/realtime-monitor'),
          meta: {
            title: '实时监控',
          },
        },
        {
          path: 'spatial-analysis',
          name: 'SpatialAnalysis',
          component: () => import('@/views/stereo/spatial-analysis'),
          meta: {
            title: '空间分析',
          },
        },
        {
          path: 'spatial-measure',
          name: 'SpatialMeasure',
          component: () => import('@/views/stereo/spatial-measure'),
          meta: {
            title: '空间测量',
          },
        },
      ],
    },
    {
      path: '/device',
      name: 'Device',
      component: Layout,
      meta: { title: '设备运维' },
      children: [
        {
          path: 'device-ledger',
          name: 'DeviceLedger',
          component: () => import('@/views/device/device-ledger'),
          meta: {
            title: '设备台账',
          },
        },
        {
          path: 'maintain-plan',
          name: 'MaintainPlan',
          component: () => import('@/views/device/maintain-plan'),
          meta: {
            title: '维护计划',
          },
        },
        {
          path: 'maintain-record',
          name: 'MaintainRecord',
          component: () => import('@/views/device/maintain-record'),
          meta: {
            title: '维护记录',
          },
        },
        {
          path: 'transfer-robot',
          name: 'TransferRobot',
          component: () => import('@/views/device/transfer-robot'),
          meta: {
            title: '转运概览',
          },
        },
        {
          path: 'transfer-plan',
          name: 'TransferPlan',
          component: () => import('@/views/device/transfer-plan'),
          meta: {
            title: '转运计划',
          },
        },
        {
          path: 'transfer-record',
          name: 'TransferRecord',
          component: () => import('@/views/device/transfer-record'),
          meta: {
            title: '转运记录',
          },
        },
      ],
    },
    {
      path: '/config',
      name: 'Config',
      component: Layout,
      meta: { title: '配置管理' },
      children: [
        // {
        //   path: 'alarm-prompt',
        //   name: 'AlarmPrompt',
        //   component: () => import('@/views/config/alarm-prompt'),
        //   meta: {
        //     title: '告警提示',
        //   },
        // },
        {
          path: 'remote-linkage',
          name: 'RemoteLinkage',
          component: () => import('@/views/config/remote-linkage'),
          meta: {
            title: '远程联动配置',
          },
        },
        {
          path: 'local-linkage',
          name: 'LocalLinkage',
          component: () => import('@/views/config/local-linkage'),
          meta: { title: '本地联动配置' },
        },
        {
          path: 'resource-query',
          name: 'ResourceQuery',
          component: () => import('@/views/config/resource-query'),
          meta: {
            title: '变电资源查询',
          },
        },
        {
          path: 'data-model',
          name: 'DataModel',
          component: () => import('@/views/config/data-model'),
          meta: {
            title: '数据字典查询',
          },
        },
        {
          path: 'data-code',
          name: 'DataCode',
          component: () => import('@/views/config/data-code'),
          meta: {
            title: '数据代码查询',
          },
        },
        {
          path: 'device-info',
          name: 'DeviceInfo',
          component: () => import('@/views/config/device-info'),
          meta: {
            title: '主辅信息查询',
          },
        },
      ],
    },
  ],
};

function createRouter() {
  return new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [...baseRoutes],
  });
}

const router = createRouter();
router.$addRoutes = (routes) => {
  // 重置路由避免重复添加
  router.matcher = createRouter().matcher;
  router.addRoutes(routes);
};

router.beforeEach(async (to, from, next) => {
  Modal.destroyAll();
  const token = store.state.token;
  if (token) {
    if (store.state.routes.length === 0) {
      await store.dispatch('setDynamicRoutes');
      next({ ...to, replace: true });
    } else {
      next();
    }
  } else {
    if (from.path !== '/') {
      message.warn('登录过期，请重新登录！');
    }
    if (to.path !== '/login') {
      next('/login');
    } else {
      next();
    }
  }
});

export default router;
