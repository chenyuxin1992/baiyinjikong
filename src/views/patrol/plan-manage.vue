<template>
  <a-row class="sg-row" :gutter="10">
    <a-col class="sg-col" :span="4">
      <sg-tree @check="onTreeCheck" />
    </a-col>
    <a-col class="sg-col" :span="20">
      <div class="sg-query">
        <span class="sg-query-item">
          <span>变电站:</span>
          <b class="sg-query-item__team">{{ stationName }}</b>
        </span>
        <span class="sg-query-item">
          <span>方案名称:</span>
          <a-input v-model="planName" placeholder="请输入方案名称" :max-length="20" allow-clear />
        </span>
        <!-- <span class="sg-query-item">
          <span>设备区域:</span>
          <a-select
            v-model="deviceArea"
            :options="deviceAreas"
            placeholder="请选择设备区域"
            allow-clear
          ></a-select>
        </span>
        <span class="sg-query-item">
          <span>设备类型:</span>
          <a-select
            v-model="deviceType"
            :options="deviceTypes"
            placeholder="请选择设备类型"
            allow-clear
          ></a-select>
        </span>
        <span class="sg-query-item">
          <span>识别类型:</span>
          <a-select
            v-model="recognitionType"
            :options="recognitionTypes"
            placeholder="请选择识别类型"
            allow-clear
          ></a-select>
        </span> -->

        <a-button @click="handleQueryData">查询</a-button>
        <a-button @click="handleExportData">导出</a-button>
        <a-button @click="handlePatrolPlan(null, 'create')" v-if="$route.query.authority === '333'"
          >新建</a-button
        >
      </div>

      <a-table
        class="sg-table"
        table-layout="auto"
        row-key="id"
        :loading="tableLoad"
        :columns="tableColumns"
        :data-source="tableData"
        :pagination="pagination"
        :scroll="{ x: false }"
        bordered
        @change="onTableChange"
      >
        <template v-slot:operation="data, row">
          <div class="operation">
            <a-button
              size="small"
              v-if="$route.query.authority === '333'"
              @click="handlePatrolPlan(row, 'update')"
            >
              编辑
            </a-button>
            <a-popconfirm title="确定删除该巡视方案?" @confirm="handlePatrolPlan(row, 'delete')">
              <a-button size="small">删除</a-button>
            </a-popconfirm>
            <a-button
              v-if="row.checkstate === 0 && $route.query.authority === '111'"
              size="small"
              @click="handlePatrolPlan(row, 'audit')"
            >
              审核
            </a-button>
            <a-popconfirm
              v-else-if="
                row.checkstate === 1 && row.enable === 1 && $route.query.authority === '333'
              "
              title="确定启用该巡视方案?"
              @confirm="handlePatrolPlan(row, 'enable')"
            >
              <a-button size="small">启用</a-button>
            </a-popconfirm>
            <template
              v-else-if="
                row.checkstate === 1 && row.enable === 0 && $route.query.authority === '333'
              "
            >
              <a-popconfirm title="确定停用该巡视方案?" @confirm="handlePatrolPlan(row, 'disable')">
                <a-button size="small">停用</a-button>
              </a-popconfirm>
              <a-popconfirm title="确定下发方案至巡视主机?" @confirm="sendControlCmd(row, 'issue')">
                <a-button size="small">下发</a-button>
              </a-popconfirm>
              <a-popconfirm
                title="确定巡视主机立即执行该巡视方案?"
                @confirm="sendControlCmd(row, 'start')"
              >
                <a-button size="small">立即执行</a-button>
              </a-popconfirm>
              <a-popconfirm
                title="确定巡视主机暂停该巡视方案?"
                @confirm="sendControlCmd(row, 'pause')"
              >
                <a-button size="small">暂停</a-button>
              </a-popconfirm>
              <a-popconfirm
                title="确定巡视主机继续该巡视方案?"
                @confirm="sendControlCmd(row, 'continue')"
              >
                <a-button size="small">继续</a-button>
              </a-popconfirm>
              <a-popconfirm
                title="确定巡视主机停止该巡视方案?"
                @confirm="sendControlCmd(row, 'stop')"
              >
                <a-button size="small">停止</a-button>
              </a-popconfirm>
            </template>
          </div>
        </template>
      </a-table>
    </a-col>

    <a-modal
      v-model="planModal"
      width="50vw"
      ok-text="提交"
      dialog-class="sg-modal"
      :title="planModalTitle"
      centered
      @ok="onModalConfirm"
    >
      <a-form-model
        class="sg-form plan-form"
        ref="planForm"
        :model="planForm"
        :rules="planRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <div class="plan-form-left">
          <header class="plan-form-header">巡视设备</header>
          <a-form-model-item prop="station" label="选择变电站" label-align="right">
            <a-cascader
              class="plan-form-station"
              v-model="planForm.station"
              :options="stationData"
              :load-data="loadStationTree"
              :field-names="{ label: 'name', value: 'id', children: 'children' }"
              placeholder="请选择集控站/运维班/变电站"
              change-on-select
              @change="onStationChange"
            />
          </a-form-model-item>
          <a-form-model-item prop="device_level" label="巡视设备层级" required>
            <a-select
              v-model="planForm.device_level"
              :options="deviceLevels"
              placeholder="请选择巡视设备层级"
            ></a-select>
          </a-form-model-item>
          <a-form-model-item prop="patrolhost_id" label="选择巡视主机">
            <a-select
              v-model="planForm.patrolhost_id"
              :options="patrolHosts"
              placeholder="请选择巡视主机"
            ></a-select>
          </a-form-model-item>
          <a-form-model-item prop="content" :wrapper-col="{ span: 24 }">
            <a-spin :spinning="contentLoad">
              <a-tree
                v-if="contentData.length > 0"
                class="plan-form-content"
                v-model="planForm.content"
                :tree-data="contentData"
                :load-data="loadContentTree"
                :replace-fields="{ key: 'id', title: 'name' }"
                :check-strictly="false"
                checkable
                @check="onContentCheck"
              ></a-tree>
              <a-empty v-else description="暂无巡视设备数据" />
            </a-spin>
          </a-form-model-item>
        </div>
        <div class="plan-form-right">
          <header class="plan-form-header">基本信息</header>
          <a-form-model-item prop="name" label="巡视方案名称" required>
            <a-input
              v-model="planForm.name"
              placeholder="请输入巡视方案名称"
              :max-length="20"
              allow-clear
            />
          </a-form-model-item>
          <a-form-model-item prop="patrol_type" label="巡视方案类型" required>
            <a-select
              v-model="planForm.patrol_type"
              :options="patrolTypes"
              placeholder="请选择巡视方案类型"
            ></a-select>
          </a-form-model-item>

          <a-form-model-item prop="planType" label="任务执行类型">
            <a-radio-group v-model="planType" :options="planTypes"></a-radio-group>
          </a-form-model-item>
          <a-form-model-item
            v-if="planType === 0"
            ref="plantime"
            prop="plantime"
            label="定期执行设置"
            :auto-link="false"
            required
          >
            <a-date-picker v-model="planForm.plantime" placeholder="任务定期执行时间" show-time />
          </a-form-model-item>
          <a-form-model-item
            v-else-if="planType === 1"
            ref="cycle"
            prop="cycletype"
            label="周期执行设置"
            :auto-link="false"
          >
            <a-select
              v-model="planForm.cycle_month"
              :options="months"
              placeholder="请选择周期（月）"
              mode="multiple"
            ></a-select>
            <a-select
              v-model="planForm.cycle_week"
              :options="weeks"
              placeholder="请选择周期（周）"
              mode="multiple"
            ></a-select>
            <a-date-picker
              v-model="planForm.cycle_start_time"
              placeholder="周期开始时间"
              show-time
            />
            <a-date-picker v-model="planForm.cycle_end_time" placeholder="周期结束时间" show-time />
            <a-time-picker
              v-model="planForm.cycle_execute_time"
              placeholder="周期执行时间"
              style="width: 50%"
            />
          </a-form-model-item>
          <a-form-model-item
            v-else
            ref="interval"
            prop="intervaltype"
            label="间隔执行设置"
            :auto-link="false"
          >
            <a-select
              v-model="planForm.interval_type"
              :options="intervalTypes"
              placeholder="间隔类型"
            ></a-select>
            <a-input
              v-model="planForm.interval_number"
              type="number"
              placeholder="间隔数量"
              :max-length="20"
            />
            <a-date-picker
              v-model="planForm.interval_start_time"
              placeholder="间隔开始时间"
              show-time
            />
            <a-date-picker
              v-model="planForm.interval_end_time"
              placeholder="间隔结束时间"
              show-time
            />
            <a-time-picker
              v-model="planForm.interval_execute_time"
              placeholder="间隔执行时间"
              style="width: 50%"
            />
          </a-form-model-item>

          <a-form-model-item prop="source" label="巡视内容来源" required>
            <a-radio-group v-model="planForm.source" :options="sourceTypes"></a-radio-group>
          </a-form-model-item>
          <!-- <a-form-model-item prop="selectType" label="任务内容类别">
            <a-radio-group v-model="selectType" :options="selectTypes"></a-radio-group>
          </a-form-model-item> -->
          <a-form-model-item prop="priority" label="任务优先级" required>
            <a-radio-group v-model="planForm.priority" :options="taskPriorities"></a-radio-group>
          </a-form-model-item>
          <a-form-model-item prop="enable" label="方案是否启用" required>
            <a-radio-group v-model="planForm.enable" :options="planStates"></a-radio-group>
          </a-form-model-item>
          <a-form-model-item prop="enable" label="方案是否审核" required>
            <a-radio-group v-model="planForm.checkstate" :options="checkStates"></a-radio-group>
          </a-form-model-item>
          <a-form-model-item prop="createtime" label="方案编制时间" required>
            <a-date-picker v-model="planForm.createtime" placeholder="方案编制时间" show-time />
          </a-form-model-item>
          <a-form-model-item prop="creator" label="方案编制人" required>
            <a-input
              v-model="planForm.creator"
              placeholder="方案编制人姓名"
              :max-length="20"
              allow-clear
            />
          </a-form-model-item>
          <a-form-model-item
            v-if="planForm.enable === 1"
            ref="enabletime"
            prop="enabletime"
            label="不可用时间"
            :auto-link="false"
          >
            <a-date-picker
              v-model="planForm.invalid_start_time"
              placeholder="不可用起始时间"
              show-time
            />
            <a-date-picker
              v-model="planForm.invalid_end_time"
              placeholder="不可用终止时间"
              show-time
            />
          </a-form-model-item>
        </div>
      </a-form-model>
    </a-modal>
    <a-modal
      v-model="planAudit"
      width="50vw"
      ok-text="提交"
      title="巡视方案审核"
      dialog-class="sg-modal"
      centered
      @ok="onModalConfirm"
    >
      <a-form-model
        class="sg-form plan-form"
        ref="auditForm"
        :model="auditForm"
        :rules="auditRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <div class="plan-form-left">
          <header class="plan-form-header">方案详情</header>
          <ul class="plan-form-details">
            <li>
              <label>巡视变电站：</label>
              <span>{{ auditForm.substation }}</span>
            </li>
            <li>
              <label>巡视主机：</label>
              <span>{{ auditForm.patrolhost }}</span>
            </li>
            <li>
              <label>巡视方案名称：</label>
              <span>{{ auditForm.planName }}</span>
            </li>
            <li>
              <label>巡视方案类型：</label>
              <span>{{ auditForm.patrolType }}</span>
            </li>
            <li>
              <label>方案优先级：</label>
              <span>{{ auditForm.priority }}</span>
            </li>
            <li>
              <label>巡视方案状态：</label>
              <span>{{ auditForm.planEnable }}</span>
            </li>
            <li>
              <label>巡视内容来源：</label>
              <span>{{ auditForm.dataSource }}</span>
            </li>
            <li>
              <label>任务时间方案：</label>
              <span>{{ auditForm.timePlan }}</span>
            </li>
            <li>
              <label>方案编制人：</label>
              <span>{{ auditForm.creator }}</span>
            </li>
            <li>
              <label>方案编制时间：</label>
              <span>{{ auditForm.createtime }}</span>
            </li>
          </ul>
        </div>
        <div class="plan-form-right">
          <header class="plan-form-header">方案审核</header>
          <a-form-model-item prop="checkman" label="审核人" required>
            <a-input
              v-model="auditForm.checkman"
              placeholder="请输入审核人姓名"
              :max-length="20"
              allow-clear
            />
          </a-form-model-item>
          <a-form-model-item prop="checkdes" label="审核意见" required>
            <a-textarea
              v-model="auditForm.checkdes"
              placeholder="请输入方案审核意见"
              :auto-size="{ minRows: 3 }"
            />
          </a-form-model-item>
          <a-form-model-item prop="checkstate" label="审核结果" required>
            <a-switch v-model="auditForm.checkstate" />
          </a-form-model-item>
        </div>
      </a-form-model>
    </a-modal>
  </a-row>
</template>

<script>
import _ from 'lodash';
import FileSaver from 'file-saver';
import SgTree from '@/components/Tree/Antd';
import {
  Week,
  Month,
  ControlCMD,
  DATA_SOURCE,
  DEVICE_TYPE,
  DEVICE_LEVEL,
  RECOGNITION_TYPE,
  TASK_CHECK_STATE,
  TASK_INTERVAL_TYPE,
  TASK_PATROL_TYPE,
  TASK_PLAN_ENABLE,
  TASK_PLAN_TYPE,
  TASK_PRIORITY,
  TASK_SELECT_TYPE,
} from '@/enum';

export default {
  name: 'PlanManage',
  components: {
    SgTree,
  },
  computed: {
    weeks() {
      return Object.entries(Week).map(([key, val]) => ({
        text: val,
        label: val,
        value: +key,
      }));
    },
    months() {
      return Object.entries(Month).map(([key, val]) => ({
        text: val,
        label: val,
        value: +key,
      }));
    },
    planTypes() {
      return Object.entries(TASK_PLAN_TYPE).map(([key, val]) => ({
        text: val,
        label: val,
        value: +key,
      }));
    },
    planStates() {
      return Object.entries(TASK_PLAN_ENABLE).map(([key, val]) => ({
        text: val,
        label: val,
        value: +key,
      }));
    },
    checkStates() {
      return [
        { label: '开启审核', value: 0 },
        { label: '关闭审核', value: 1 },
      ];
    },
    patrolTypes() {
      return Object.entries(TASK_PATROL_TYPE).map(([key, val]) => ({
        text: val,
        label: val,
        value: +key,
      }));
    },
    selectTypes() {
      return Object.entries(TASK_SELECT_TYPE).map(([key, val]) => ({
        text: val,
        label: val,
        value: +key,
      }));
    },
    sourceTypes() {
      return Object.entries(DATA_SOURCE).map(([key, val]) => ({
        text: val,
        label: val,
        value: +key,
      }));
    },
    deviceLevels() {
      return Object.entries(DEVICE_LEVEL).map(([key, val]) => ({
        text: val,
        label: val,
        value: +key,
      }));
    },
    intervalTypes() {
      return Object.entries(TASK_INTERVAL_TYPE).map(([key, val]) => ({
        text: val,
        label: val,
        value: +key,
      }));
    },
    taskPriorities() {
      return Object.entries(TASK_PRIORITY).map(([key, val]) => ({
        text: val,
        label: val,
        value: +key,
      }));
    },
    recognitionTypes() {
      return Object.entries(RECOGNITION_TYPE).map(([key, val]) => ({
        text: val,
        label: val,
        value: +key,
      }));
    },
    deviceTypes() {
      return Object.entries(DEVICE_TYPE).map(([key, val]) => ({
        text: val,
        label: val,
        value: +key,
      }));
    },
    tableColumns() {
      return [
        { title: '序号', dataIndex: 'index', align: 'center', width: 50 },
        { title: '变电站', dataIndex: 'substation.name', align: 'center', width: 150 },
        { title: '方案名称', dataIndex: 'name', align: 'center', width: 150 },
        { title: '方案时间', dataIndex: 'timePlan', align: 'center', width: 300 },
        {
          title: '巡视类型',
          dataIndex: 'patrolType',
          align: 'center',
          width: 150,
          filterMultiple: false,
          filters: this.patrolTypes,
        },
        {
          title: '方案状态',
          dataIndex: 'planEnable',
          align: 'center',
          width: 100,
          filterMultiple: false,
          filters: this.planStates,
        },
        { title: '审核状态', dataIndex: 'checkState', align: 'center', width: 100 },
        { title: '数据来源', dataIndex: 'dataSource', align: 'center', width: 150 },
        {
          title: '操作',
          fixed: 'right',
          align: 'center',
          width: 200,
          scopedSlots: { customRender: 'operation' },
        },
      ];
    },
  },
  watch: {
    planModal(bool) {
      if (bool && !this.stationData.length) {
        this.$api.getBaseApi('maintenanceunit').then((res) => {
          console.log(res, 'cloudy');
          if (!res || !res.results) return;
          this.stationData = res.results.map((item) => ({
            ...item,
            tier: 0, // 树节点层级
            key: item.id,
            isLeaf: false,
          }));
        });
      }
    },
    ['planForm.timingtype'](num) {
      // 任务周期执行时开启时间间隔
      this.planInterval = num !== 5;
    },
  },
  data() {
    return {
      stationId: '',
      selectType: 0,
      stationName: '请选择站点',
      deviceArea: undefined,
      deviceAreas: [],
      deviceType: undefined,
      recognitionType: undefined,
      planType: 0,
      planName: '',
      planEnable: undefined,
      patrolType: undefined,
      patrolHosts: [],
      planAction: '',
      planAudit: false,
      planModal: false,
      planModalTitle: '',
      planInterval: true,
      planForm: {
        station: [],
        content: [],
        name: '',
        enable: 0,
        source: '',
        plantime: null,
        priority: 3,
        execute_id: '',
        checkstate: 0,
        patrol_type: 0,
        device_list: '',
        device_level: 3,
        substation_id: '',
        patrolhost_id: undefined,
        cycle_month: undefined,
        cycle_week: undefined,
        cycle_execute_time: null,
        cycle_start_time: null,
        cycle_end_time: null,
        interval_type: '',
        interval_number: '',
        interval_execute_time: null,
        interval_start_time: null,
        interval_end_time: null,
        invalid_start_time: null,
        invalid_end_time: null,
      },
      planRules: {
        content: [
          {
            required: true,
            validator: (rule, value, callback) => {
              // console.log(value);
              if (value.length === 0) {
                callback(new Error('请选择巡视设备点位'));
              } else {
                callback();
              }
            },
          },
        ],
        station: [
          {
            required: true,
            validator: (rule, value, callback) => {
              // console.log(value);
              if (value.length < 3) {
                callback(new Error('请选择巡视变电站'));
              } else {
                this.planForm.substation_id = value[2];
                callback();
              }
            },
          },
        ],
        name: [{ required: true, message: '请输入巡视方案名称' }],
        enable: [{ required: true, message: '请选择方案是否审核' }],
        source: [{ required: true, message: '请选择巡视内容来源' }],
        creator: [{ required: true, message: '请输入方案编制人姓名' }],
        interval: [{ required: true, message: '请输入任务执行间隔' }],
        plantime: [{ required: true, message: '请选择任务执行时间' }],
        createtime: [{ required: true, message: '请选择方案编制时间' }],
        timingtype: [{ required: true, message: '请选择任务执行周期' }],
        patrol_type: [{ required: true, message: '请选择巡视方案类型' }],
        device_level: [{ required: true, message: '请选择巡视设备层级' }],
      },
      auditForm: {
        checkman: '',
        checkdes: '',
        checkstate: false,
      },
      auditRules: {
        checkman: [{ required: true, message: '请输入审核人姓名' }],
        checkdes: [{ required: true, message: '请输入方案审核意见' }],
      },
      tableLoad: false,
      tableData: [],
      pagination: {
        total: 0,
        current: 1,
        pageSize: 10,
        showQuickJumper: true,
        showTotal: (total) => `当前共有记录${total}条`,
      },
      contentLoad: false,
      contentData: [],
      contentNodes: [],
      stationData: [],
      stationModel: [],
    };
  },
  created() {
    console.log(this.planForm.plantime, '艾迪');
    console.log(this.$moment().format('YYYY-MM-DD HH:mm:ss'), '迪迦');
    this.getSelectData();
    this.getTableData();
  },
  // beforeDestroy() {
  //   this.$bus.$off('identified');
  // },

  methods: {
    handleQueryData() {
      this.pagination.current = 1;
      this.getTableData();
    },
    handleExportData() {
      this.tableLoad = true;
      this.$api
        .getBaseApi('plantask_csv', {
          substation: this.stationId,
          enable: this.planEnable,
          patrol_type: this.patrolType,
          name__icontains: this.planName,
        })
        .then((res) => {
          if (!res) return;
          const blob = new Blob([`\uFEFF${res}`], { type: 'text/csv;charset=utf-8' });
          FileSaver.saveAs(blob, '巡视方案数据.csv');
        })
        .finally(() => {
          this.tableLoad = false;
        });
    },
    handlePatrolPlan(row, action) {
      this.planAction = action;
      switch (action) {
        case 'audit':
          console.log(row);
          this.auditForm = {
            ...this.auditForm,
            planId: row.id,
            planName: row.name,
            creator: row.creator,
            createtime: row.createtime,
            substation: row.substation.name,
            patrolhost: row.patrolhost.name,
            priority: TASK_PRIORITY[row.priority],
            patrolType: TASK_PATROL_TYPE[row.patrol_type],
            planEnable: row.enable ? '停用' : '启用',
            dataSource: DATA_SOURCE[row.source] || '未知',
            planContent: '',
            timePlan: row.plantime
              ? `${row.plantime}定期执行巡视`
              : row.cycle_start_time
              ? `${row.cycle_start_time}至${row.cycle_end_time}期间${row.cycle_month}月星期${row.cycle_week}周期执行巡视，执行时间${row.cycle_execute_time}`
              : row.interval_type == 1
              ? `${row.interval_start_time}至${row.interval_end_time}期间每间隔${row.interval_number}小时执行巡视，执行时间${row.interval_execute_time}`
              : row.interval_type == 2
              ? `${row.interval_start_time}至${row.interval_end_time}期间每间隔${row.interval_number}天执行巡视，执行时间${row.interval_execute_time}`
              : '未知',
          };
          this.planAudit = true;
          break;
        case 'create':
          this.planForm = {
            station: [],
            content: [],
            name: '',
            source: 0,
            enable: 0,
            creator: '',
            plantime: '',
            priority: 3,
            createtime: this.$moment(),
            execute_id: '',
            patrol_type: 0,
            device_list: '',
            device_level: undefined,
            substation_id: undefined,
            patrolhost_id: undefined,
            cycle_week: undefined,
            cycle_month: undefined,
            cycle_execute_time: null,
            cycle_start_time: null,
            cycle_end_time: null,
            interval_type: '',
            interval_number: '',
            interval_execute_time: '',
            interval_start_time: '',
            interval_end_time: '',
            invalid_start_time: '',
            invalid_end_time: '',
          };
          this.planModalTitle = '巡视方案新建';
          this.planModal = true;
          break;
        case 'update':
          row.plantime = this.$moment() || null;
          row.createtime = this.$moment() || null;
          console.log(row, 888);
          this.planForm = {
            ...row,
            station: [
              row.substation.maintenanceteam.maintenanceunit,
              row.substation.maintenanceteam.id,
              row.substation.id,
            ],
            content: [],
            enable: row.enable,
            patrol_type: row.patrol_type,
            substation_id: row.substation.id,
          };
          console.log(this.planForm, '315');
          this.planModalTitle = '巡视方案修改';
          this.planModal = true;
          break;
        case 'delete':
          this.$api.postBaseApi('plantask_delete', { data: [row.id] }).then((res) => {
            this.getTableData();
            this.$message.success('巡视方案删除成功！');
          });
          break;
        case 'enable':
          this.$api
            .postBaseApi('plantask_update', { data: [{ id: row.id, enable: 0 }] })
            .then((res) => {
              if (!res) return;
              row.enable = 0;
              row.planEnable = '启用';
              this.$message.success('巡视方案启用成功！');
            });
          break;
        case 'disable':
          this.$api
            .postBaseApi('plantask_update', { data: [{ id: row.id, enable: 1 }] })
            .then((res) => {
              if (!res) return;
              row.enable = 1;
              row.planEnable = '停用';
              this.$message.success('巡视方案停用成功！');
            });
          break;
        case 'execute':
          this.$api
            .postBaseApi('runningtask_create', { data: [{ plantask_id: row.id }] })
            .then((res) => {
              if (!res) return;
              this.$message.success('巡视方案执行成功！');
            });
          break;
        default:
          break;
      }
    },
    onModalConfirm() {
      switch (this.planAction) {
        case 'audit':
          this.$refs.auditForm.validate((valid) => {
            if (valid) {
              const planAudit = {
                id: this.auditForm.planId,
                checkman: this.auditForm.checkman,
                checkdes: this.auditForm.checkdes,
                checkstate: this.auditForm.checkman ? 1 : 0,
              };
              this.$api.postBaseApi('plantask_update', { data: [planAudit] }).then((res) => {
                this.getTableData();
                this.planAudit = false;
                this.$message.success('巡视方案审核成功！');
              });
            } else {
              return false;
            }
          });
          break;
        case 'create':
        case 'update':
          this.$refs.planForm.validate((valid) => {
            if (valid) {
              let area1 = [],
                area2 = [],
                points = [],
                devices = [];
              for (let i = 0, len = this.contentNodes.length; i < len; i++) {
                const item = this.contentNodes[i];
                switch (item.data.props.tier) {
                  case 0:
                    area1.push(item.data.key);
                    break;
                  case 1:
                    area2.push(item.data.key);
                    break;
                  case 2:
                    devices.push(item.data.key);
                    break;
                  case 3:
                    points.push(item.data.key);
                    break;
                  default:
                    break;
                }
              }
              const {
                id,
                name,
                enable,
                source,
                creator,
                plantime,
                priority,
                checkstate,
                createtime,
                patrol_type,
                device_level,
                patrolhost_id,
                substation_id,
                cycle_week,
                cycle_month,
                cycle_execute_time,
                cycle_start_time,
                cycle_end_time,
                interval_type,
                interval_number,
                interval_execute_time,
                interval_start_time,
                interval_end_time,
                invalid_start_time,
                invalid_end_time,
              } = this.planForm;
              const planTask = {
                id,
                name,
                enable,
                source,
                creator,
                priority,
                checkstate,
                patrol_type,
                device_level,
                patrolhost_id,
                substation_id,
                execute_id: Math.round(
                  (new Date() - new Date('2020-08-25 22:00:00').getTime()) / 1000
                ).toString(),
                device_list:
                  device_level === 1
                    ? area1.toString()
                    : device_level === 2
                    ? area2.toString()
                    : device_level === 3
                    ? points.toString()
                    : device_level === 4
                    ? devices.toString()
                    : '',

                plantime:
                  this.planType === 0 ? this.$moment(plantime).format('YYYY-MM-DD HH:mm:ss') : null,
                createtime: this.$moment(createtime).format('YYYY-MM-DD HH:mm:ss'),
                cycle_week: this.planType === 1 ? cycle_week : null,
                cycle_month: this.planType === 1 ? cycle_month : null,
                cycle_execute_time:
                  this.planType === 1 ? this.$moment(cycle_execute_time).format('HH:mm:ss') : null,
                cycle_start_time:
                  this.planType === 1
                    ? this.$moment(cycle_start_time).format('YYYY-MM-DD HH:mm:ss')
                    : null,
                cycle_end_time:
                  this.planType === 1
                    ? this.$moment(cycle_end_time).format('YYYY-MM-DD HH:mm:ss')
                    : null,
                interval_type: this.planType === 2 && interval_type,
                interval_number: this.planType === 2 ? interval_number : null,
                interval_execute_time:
                  this.planType === 2
                    ? this.$moment(interval_execute_time).format('HH:mm:ss')
                    : null,
                interval_start_time:
                  this.planType === 2
                    ? this.$moment(interval_start_time).format('YYYY-MM-DD HH:mm:ss')
                    : null,
                interval_end_time:
                  this.planType === 2
                    ? this.$moment(interval_end_time).format('YYYY-MM-DD HH:mm:ss')
                    : null,
                invalid_start_time: invalid_start_time
                  ? this.$moment(invalid_start_time).format('YYYY-MM-DD HH:mm:ss')
                  : null,
                invalid_end_time: invalid_end_time
                  ? this.$moment(invalid_end_time).format('YYYY-MM-DD HH:mm:ss')
                  : null,
              };
              this.$api
                .postBaseApi(`plantask_${this.planAction}`, {
                  data: [planTask],
                })
                .then(() => {
                  console.log(planTask, '云淡风轻');
                  this.$message.success('巡视方案提交成功！');
                  this.$refs.planForm.resetFields();
                  this.planModal = false;
                  this.getTableData();
                });
            } else {
              return false;
            }
          });
          break;
        default:
          break;
      }
    },
    onTreeCheck(_, { node, checked }) {
      const { dataRef } = node;
      if (checked) {
        this.stationName = dataRef.name;
        this.stationId = dataRef.id;
      } else {
        this.stationName = '请选择站点';
        this.stationId = '';
      }
      this.pagination.current = 1;
      this.getTableData();
    },
    onTableChange(pagination, filters) {
      // console.log(pagination, filters, sorter);
      this.pagination.current = pagination.current;
      if (filters['patrolType'] && filters['patrolType'].length > 0) {
        this.patrolType = filters['patrolType'][0];
      } else {
        this.patrolType = undefined;
      }
      if (filters['planEnable'] && filters['planEnable'].length > 0) {
        this.planEnable = filters['planEnable'][0];
      } else {
        this.planEnable = undefined;
      }
      this.getTableData();
    },
    onContentCheck(keys, { checkedNodes }) {
      console.log(keys, checkedNodes);
      this.contentNodes = checkedNodes;
    },
    onStationChange(res, options) {
      if (res.length === 3) {
        this.contentLoad = true;
        const substation = res[res.length - 1];
        this.$api.getBaseApi('patrolhost', { substation }).then((res) => {
          if (!res || !res.results) return;
          this.patrolHosts = res.results.map((item) => ({
            text: item.name,
            label: item.name,
            value: item.id,
          }));
        });
        this.$api
          .getBaseApi('area', { substation, parent__isnull: true })
          .then((res) => {
            if (!res || !res.results) return;
            this.contentData = res.results.map((item) => ({
              ...item,
              tier: 0, // 树节点层级
              key: item.id,
              isLeaf: false,
            }));
          })
          .finally(() => {
            this.contentLoad = false;
          });
      }
    },
    loadStationTree(options) {
      console.log(options, 'red');
      const option = options[options.length - 1];
      option.loading = true;
      return new Promise((resolve) => {
        if (option.children) return resolve();
        switch (option.tier) {
          case 0:
            this.$api
              .getBaseApi('maintenanceteam', { maintenanceunit: option.id })
              .then((res) => {
                console.log(res, 'green');
                if (!res || !res.results) return resolve();
                option.children = res.results.map((item) => ({
                  ...item,
                  tier: 1, // 树节点层级
                  key: item.id,
                  isLeaf: false,
                }));
                console.log(...this.stationData, 'purple');
                this.stationData = [...this.stationData];
              })
              .finally(() => {
                option.loading = false;
              });
            break;
          case 1:
            this.$api
              .getBaseApi('substation', { maintenanceteam: option.id })
              .then((res) => {
                if (!res || !res.results) return resolve();
                option.children = res.results.map((item) => ({
                  ...item,
                  tier: 2, // 树节点层级
                  key: item.id,
                  isLeaf: true,
                }));
                this.stationData = [...this.stationData];
              })
              .finally(() => {
                option.loading = false;
              });
            break;
          default:
            return resolve();
        }
      });
    },
    loadContentTree(node) {
      const { dataRef } = node;
      console.log(dataRef);
      return new Promise((resolve) => {
        if (dataRef.children) return resolve();
        const { device_level } = this.planForm;
        switch (dataRef.tier) {
          case 0:
            if (device_level === 1) return resolve();
            this.$api
              .getBaseApi('area', { parent: dataRef.id })
              .then((res) => {
                if (!res || !res.results) return resolve();
                dataRef.children = res.results.map((item) => ({
                  ...item,
                  tier: 1, // 树节点层级
                  key: item.id,
                }));
                this.contentData = [...this.contentData];
              })
              .finally(() => resolve());
            break;
          case 1:
            if (device_level === 2) return resolve();
            this.$api
              .getBaseApi('device', { area: dataRef.id })
              .then((res) => {
                if (!res || !res.results) return resolve();
                dataRef.children = res.results.map((item) => ({
                  ...item,
                  tier: 2, // 树节点层级
                  key: item.id,
                }));
                this.contentData = [...this.contentData];
              })
              .finally(() => resolve());
            break;
          case 2:
            if (device_level === 4) return resolve();
            this.$api
              .getBaseApi('patrolpoint', { device: dataRef.id })
              .then((res) => {
                if (!res || !res.results) return resolve();
                dataRef.children = res.results.map((item) => ({
                  ...item,
                  tier: 3, // 树节点层级
                  key: item.id,
                  isLeaf: true,
                }));
                this.contentData = [...this.contentData];
              })
              .finally(() => resolve());
            break;
          default:
            return resolve();
        }
      });
    },
    sendControlCmd(row, action) {
      switch (action) {
        case 'issue':
          this.$bus.$emit('identify');
          this.$bus.$off('identified');
          this.$bus.$on('identified', () => {
            this.$api
              .postControlApi({
                action: ControlCMD.TASK_ISSUE,
                command: 1,
                task_id: row.id,
                syn: `${row.name}任务配置指令下发`,
              })
              .then(() => {
                this.$message.success('任务配置指令下发成功！');
              });
          });
          break;
        case 'start':
          this.$api
            .postControlApi({
              action: ControlCMD.TASK_CONTROL,
              command: 1,
              task_id: row.id,
              syn: `${row.name}任务启动指令下发`,
            })
            .then(() => {
              this.$message.success('任务启动指令下发成功！');
            });
          break;
        case 'pause':
          this.$api
            .postControlApi({
              action: ControlCMD.TASK_CONTROL,
              command: 2,
              task_id: row.id,
              syn: `${row.name}任务暂停指令下发`,
            })
            .then(() => {
              this.$message.success('任务暂停指令下发成功！');
            });
          break;
        case 'continue':
          this.$api
            .postControlApi({
              action: ControlCMD.TASK_CONTROL,
              command: 3,
              task_id: row.id,
              syn: `${row.name}任务继续指令下发`,
            })
            .then(() => {
              this.$message.success('任务继续指令下发成功！');
            });
          break;
        case 'stop':
          this.$api
            .postControlApi({
              action: ControlCMD.TASK_CONTROL,
              command: 4,
              task_id: row.id,
              syn: `${row.name}任务停止指令下发`,
            })
            .then(() => {
              this.$message.success('任务停止指令下发成功！');
            });
          break;
        default:
          break;
      }
    },
    getTableData() {
      this.tableLoad = true;
      this.$api
        .getBaseOrding('plantask_depth', '-createtime', {
          page_num: this.pagination.current,
          page_size: this.pagination.pageSize,
          substation: this.stationId,
          enable: this.planEnable,
          patrol_type: this.patrolType,
          name__icontains: this.planName,
        })
        .then((res) => {
          if (!res || !res.results) {
            this.tableData = [];
            this.pagination.total = 0;
            return;
          }
          this.tableData = res.results.map((item, index) => {
            const timePlan = item.plantime
              ? `${item.plantime}定期执行巡视`
              : item.cycle_start_time
              ? `${item.cycle_start_time}至${item.cycle_end_time}期间${item.cycle_month}月星期${item.cycle_week}周期执行巡视，执行时间${item.cycle_execute_time}`
              : item.interval_type == 1
              ? `${item.interval_start_time}至${item.interval_end_time}期间每间隔${item.interval_number}小时执行巡视，执行时间${item.interval_execute_time}`
              : item.interval_type == 2
              ? `${item.interval_start_time}至${item.interval_end_time}期间每间隔${item.interval_number}天执行巡视，执行时间${item.interval_execute_time}`
              : '未知';
            const tableIndex = this.pagination.pageSize * (this.pagination.current - 1) + index + 1;
            return {
              ...item,
              index: tableIndex,
              timePlan,
              planEnable: item.enable ? '停用' : '启用',
              patrolType: TASK_PATROL_TYPE[item.patrol_type] || '-',
              checkState: TASK_CHECK_STATE[item.checkstate] || '-',
              dataSource: DATA_SOURCE[item.source] || '未知',
            };
          });
          this.pagination.total = res.count;
        })
        .finally(() => {
          this.tableLoad = false;
        });
    },
    getSelectData() {
      this.$api.getBaseApi('area').then((res) => {
        if (!res || !res.results) return;
        this.deviceAreas = res.results.map((item) => ({
          text: item.name,
          label: item.name,
          value: item.id,
        }));
      });
    },
  },
};
</script>

<style lang="less" scoped>
.plan-form {
  display: flex;
  width: 100%;
  overflow: hidden;

  .ant-form {
    margin-top: 1vh;

    &-item {
      /deep/ .ant-calendar-picker {
        width: 100%;
      }
    }
  }
  &-left {
    width: 50%;
    padding: 0 10px;
  }
  &-right {
    width: 50%;
    padding: 0 10px;
  }
  &-header {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 1vh;
  }
  &-station {
    width: 100%;
  }
  &-content {
    width: 100%;
    height: 50vh;
    overflow: auto;
    border-radius: 5px;
    background-color: #eee;
  }
  &-details {
    li {
      + li {
        margin-top: 1vh;
      }
      > label {
        font-size: 16px;
        // margin-right: 10px;
      }
      > span {
        font-size: 16px;
        font-weight: 500;
      }
    }
  }
}
</style>
