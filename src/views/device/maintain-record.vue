<template>
  <a-row class="sg-row" :gutter="10">
    <a-col class="sg-col" :span="4">
      <sg-tree @check="onTreeCheck" />
    </a-col>
    <a-col class="sg-col" :span="20">
      <div class="sg-query">
        <a-icon
          class="sg-query-icon"
          :type="isCollapsed ? 'right' : 'down'"
          @click="isCollapsed = !isCollapsed"
        />
        <span class="sg-query-item">
          <span>变电站:</span>
          <b class="sg-query-item__team">{{ stationName }}</b>
        </span>
        <span class="sg-query-item">
          <span>设备名称:</span>
          <a-input
            v-model="maintDevice"
            placeholder="请输入设备名称"
            :max-length="20"
            allow-clear
          />
        </span>
        <span class="sg-query-item">
          <span>设备厂家:</span>
          <a-input
            v-model="maintFactory"
            placeholder="请输入设备厂家"
            :max-length="20"
            allow-clear
          />
        </span>
        <span class="sg-query-item">
          <span>维护时间:</span>
          <a-range-picker
            class="datetime"
            v-model="timeRange"
            :placeholder="['开始时间', '结束时间']"
            separator="至"
            show-time
          ></a-range-picker>
        </span>

        <div class="sg-query sg-query-collapse" :class="{ active: !isCollapsed }">
          <span class="sg-query-item">
            <span>维护状态:</span>
            <a-select
              v-model="maintState"
              :options="maintStates"
              placeholder="请选择维护状态"
              allow-clear
            ></a-select>
          </span>
          <span class="sg-query-item">
            <span>消缺状态:</span>
            <a-select
              v-model="maintDefect"
              :options="maintDefects"
              placeholder="请选择消缺状态"
              allow-clear
            ></a-select>
          </span>
          <span class="sg-query-item">
            <span>故障类型:</span>
            <a-select
              v-model="faultType"
              :options="faultTypes"
              placeholder="请选择故障类型"
              allow-clear
            ></a-select>
          </span>
          <span class="sg-query-item">
            <span>故障级别:</span>
            <a-select
              v-model="faultLevel"
              :options="faultLevels"
              placeholder="请选择故障级别"
              allow-clear
            ></a-select>
          </span>
          <span class="sg-query-item">
            <span>维护人:</span>
            <a-input v-model="maintStaff" placeholder="请输入维护人" :max-length="20" allow-clear />
          </span>
          <span class="sg-query-item">
            <span>维护单位:</span>
            <a-input
              v-model="maintCompany"
              placeholder="请输入维护单位"
              :max-length="20"
              allow-clear
            />
          </span>
        </div>

        <a-button @click="handleQueryData">查询</a-button>
        <a-button @click="handleQueryReset">重置</a-button>
        <a-button @click="handleMaintRecord(null, 'create')">新增</a-button>
      </div>

      <a-table
        class="sg-table"
        table-layout="auto"
        row-key="id"
        :loading="tableLoad"
        :columns="tableColumns"
        :data-source="tableData"
        :pagination="pagination"
        :scroll="{ x: 2000 }"
        bordered
        @change="onTableChange"
      >
        <template v-slot:operation="data, row">
          <div class="operation">
            <a-button size="small" @click="handleMaintRecord(row, 'update')">编辑</a-button>
            <a-popconfirm
              v-if="row.maintenance_status === 0"
              title="确定删除该维护记录?"
              @confirm="handleMaintRecord(row, 'delete')"
            >
              <a-button size="small">删除</a-button>
            </a-popconfirm>
          </div>
        </template>
      </a-table>
    </a-col>

    <a-modal v-model="maintModal" :title="maintModalTitle" dialog-class="sg-modal" centered>
      <a-form-model
        class="sg-form"
        ref="maintForm"
        :model="maintForm"
        :rules="maintRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-model-item
          v-for="(val, key) in maintRules"
          :key="key"
          :prop="key"
          :label="val.label"
          :required="val.required"
        >
          <a-switch v-if="val.tag === 'switch'" v-model="maintForm[key]"></a-switch>
          <a-input
            v-else-if="val.tag === 'input'"
            v-model="maintForm[key]"
            :placeholder="val.message"
            :max-length="20"
            allow-clear
          />
          <a-select
            v-else-if="val.tag === 'select'"
            v-model="maintForm[key]"
            :options="val.options"
            :placeholder="val.message"
          ></a-select>
          <a-date-picker
            v-else-if="val.tag === 'datetime'"
            v-model="maintForm[key]"
            :placeholder="val.message"
            style="width: 100%"
            show-time
          ></a-date-picker>
        </a-form-model-item>
      </a-form-model>

      <template #footer>
        <a-button type="warning" @click="onModalAction('reset')">重置</a-button>
        <a-button type="primary" @click="onModalAction(maintAction)">提交</a-button>
      </template>
    </a-modal>
  </a-row>
</template>

<script>
import SgTree from '@/components/Tree/Antd';
import { FAULT_TYPE, FAULT_LEVEL } from '@/enum';

export default {
  name: 'MaintainRecord',
  components: {
    SgTree,
  },
  computed: {
    faultTypes() {
      return Object.entries(FAULT_TYPE).map(([key, val]) => ({
        text: val,
        label: val,
        value: +key,
      }));
    },
    faultLevels() {
      return Object.entries(FAULT_LEVEL).map(([key, val]) => ({
        text: val,
        label: val,
        value: +key,
      }));
    },
    maintStates() {
      return [
        { text: '未完成', label: '未完成', value: 0 },
        { text: '已完成', label: '已完成', value: 1 },
      ];
    },
    maintDefects() {
      return [
        { text: '未消缺', label: '未消缺', value: 0 },
        { text: '已消缺', label: '已消缺', value: 1 },
      ];
    },
    maintRules() {
      return {
        maintplan_id: {
          required: true,
          type: 'string',
          tag: 'select',
          label: '维护记录',
          message: '请选择维护记录',
          options: this.maintPlans,
        },
        staff: {
          required: true,
          type: 'string',
          tag: 'input',
          label: '维护人',
          message: '请输入维护人姓名',
        },
        company: {
          required: true,
          type: 'string',
          tag: 'input',
          label: '维护单位',
          message: '请输入维护单位',
        },
        datetime: {
          required: true,
          type: 'date',
          tag: 'datetime',
          label: '维护时间',
          message: '请选择维护时间',
        },
        fault_type: {
          required: true,
          type: 'number',
          tag: 'select',
          label: '故障类型',
          message: '请选择故障类型',
          options: this.faultTypes,
        },
        fault_level: {
          required: true,
          type: 'number',
          tag: 'select',
          label: '故障级别',
          message: '请选择故障级别',
          options: this.faultLevels,
        },
        maintState: {
          required: true,
          type: 'boolean',
          tag: 'switch',
          label: '维护状态',
          message: '请设置维护状态',
        },
        maintDefect: {
          required: true,
          type: 'boolean',
          tag: 'switch',
          label: '消缺状态',
          message: '请设置消缺状态',
        },
      };
    },
    tableColumns() {
      return [
        { title: '序号', dataIndex: 'index', align: 'center', width: 50 },
        {
          title: '变电站',
          dataIndex: 'detectormaintenanceplan.substation.name',
          align: 'center',
          width: 150,
        },
        {
          title: '设备名称',
          dataIndex: 'detectormaintenanceplan.detector.name',
          align: 'center',
          width: 150,
        },
        {
          title: '设备厂家',
          dataIndex: 'detectormaintenanceplan.detector.manufacturer',
          align: 'center',
          width: 150,
        },
        { title: '维护时间', dataIndex: 'datetime', align: 'center', width: 150 },
        {
          title: '维护状态',
          dataIndex: 'maintState',
          align: 'center',
          width: 150,
          filterMultiple: false,
          filters: this.maintStates,
        },
        {
          title: '消缺状态',
          dataIndex: 'maintDefect',
          align: 'center',
          width: 150,
          filterMultiple: false,
          filters: this.maintDefects,
        },
        {
          title: '故障类型',
          dataIndex: 'faultType',
          align: 'center',
          width: 150,
          filterMultiple: false,
          filters: this.faultTypes,
        },
        {
          title: '故障级别',
          dataIndex: 'faultLevel',
          align: 'center',
          width: 150,
          filterMultiple: false,
          filters: this.faultLevels,
        },
        { title: '维护人', dataIndex: 'staff', align: 'center', width: 150 },
        { title: '维护单位', dataIndex: 'company', align: 'center', width: 150 },
        {
          title: '操作',
          fixed: 'right',
          align: 'center',
          width: 150,
          scopedSlots: { customRender: 'operation' },
        },
      ];
    },
  },
  data() {
    return {
      isCollapsed: true,
      stationId: '',
      stationName: '请选择站点',
      timeRange: [this.$moment().startOf('y'), this.$moment()],
      faultType: undefined,
      faultLevel: undefined,
      maintState: undefined,
      maintDefect: undefined,
      maintStaff: '',
      maintDevice: '',
      maintCompany: '',
      maintFactory: '',
      maintPlans: [],
      maintAction: '',
      maintModal: false,
      maintModalTitle: '',
      maintForm: {
        staff: '',
        company: '',
        maintplan_id: undefined,
        datetime: undefined,
        fault_type: undefined,
        fault_level: undefined,
        maintState: false,
        maintDefect: false,
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
    };
  },
  created() {
    let params = this.$route.query;
    this.maintDefect = params.maintDefect;
    this.getSelectData();
    this.getTableData();
  },
  methods: {
    handleQueryData() {
      this.getTableData();
    },
    handleQueryReset() {
      // 不优雅，但先这样吧
      this.stationId = '';
      this.faultType = undefined;
      this.faultLevel = undefined;
      this.maintState = undefined;
      this.maintDefect = undefined;
      this.maintStaff = '';
      this.maintDevice = '';
      this.maintCompany = '';
      this.maintFactory = '';
      this.timeRange = [this.$moment().startOf('y'), this.$moment()];
      this.pagination.current = 1;
      this.getTableData();
    },
    handleMaintRecord(row, action) {
      this.maintAction = action;
      switch (action) {
        case 'create':
          this.maintForm = {
            staff: '',
            company: '',
            maintplan_id: undefined,
            datetime: undefined,
            fault_type: undefined,
            fault_level: undefined,
            maintState: false,
            maintDefect: false,
          };
          this.maintModalTitle = '维护记录新增';
          this.maintModal = true;
          break;
        case 'update':
          this.maintForm = {
            ...row,
            maintplan_id: row.detectormaintenanceplan.id,
            datetime: row.datetime && this.$moment(row.datetime),
            maintState: !!row.maintenance_status,
            maintDefect: !!row.elimination_status,
          };
          this.maintModalTitle = '维护记录编辑';
          this.maintModal = true;
          break;
        case 'delete':
          this.$api.postBaseApi('detectormaintenancerecord_delete', { data: [row.id] }).then(() => {
            this.getTableData();
            this.$message.success('维护记录删除成功！');
          });
          break;
        default:
          break;
      }
    },
    onModalAction(action) {
      switch (action) {
        case 'reset':
          this.$refs.maintForm.resetFields();
          break;
        case 'create':
        case 'update':
          this.$refs.maintForm.validate((valid) => {
            if (valid) {
              const {
                id,
                staff,
                company,
                datetime,
                fault_type,
                fault_level,
                maintplan_id,
                maintState,
                maintDefect,
              } = this.maintForm;
              this.$api
                .postBaseApi(`detectormaintenancerecord_${action}`, {
                  data: [
                    {
                      id,
                      staff,
                      company,
                      fault_type,
                      fault_level,
                      maintenance_status: maintState ? 1 : 0,
                      elimination_status: maintDefect ? 1 : 0,
                      detectormaintenanceplan_id: maintplan_id,
                      datetime: this.$moment(datetime).format('YYYY-MM-DD HH:mm:ss'),
                    },
                  ],
                })
                .then(() => {
                  this.$message.success('维护记录提交成功！');
                  this.$refs.maintForm.resetFields();
                  this.maintModal = false;
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
      if (filters['maintState'] && filters['maintState'].length > 0) {
        this.maintState = filters['maintState'][0];
      } else {
        this.maintState = undefined;
      }
      if (filters['maintDefect'] && filters['maintDefect'].length > 0) {
        this.maintDefect = filters['maintDefect'][0];
      } else {
        this.maintDefect = undefined;
      }
      if (filters['faultType'] && filters['faultType'].length > 0) {
        this.faultType = filters['faultType'][0];
      } else {
        this.faultType = undefined;
      }
      if (filters['faultLevel'] && filters['faultLevel'].length > 0) {
        this.faultLevel = filters['faultLevel'][0];
      } else {
        this.faultLevel = undefined;
      }
      this.getTableData();
    },
    getTableData() {
      this.tableLoad = true;
      const timeRange = this.timeRange
        .map((date) => this.$moment(date).format('YYYY-MM-DD HH:mm:ss'))
        .join(',');
      this.$api
        .getBaseApi('detectormaintenancerecord_depth', {
          page_num: this.pagination.current,
          page_size: this.pagination.pageSize,
          maintenance_status: this.maintState,
          elimination_status: this.maintDefect,
          fault_type: this.faultType,
          fault_level: this.faultLevel,
          staff__icontains: this.maintStaff,
          company__icontains: this.maintCompany,
          detectormaintenanceplan__substation: this.stationId,
          detectormaintenanceplan__detector__name__icontains: this.maintDevice,
          detectormaintenanceplan__detector__manufacturer__icontains: this.maintFactory,
          datetime__range: timeRange,
        })
        .then((res) => {
          if (!res || !res.results) {
            this.tableData = [];
            this.pagination.total = 0;
            return;
          }
          this.tableData = res.results.map((item, index) => {
            const tableIndex = this.pagination.pageSize * (this.pagination.current - 1) + index + 1;
            return {
              ...item,
              index: tableIndex,
              maintState: item.maintenance_status ? '已完成' : '未完成',
              maintDefect: item.elimination_status ? '已销缺' : '未消缺',
              faultType: item.fault_type ? FAULT_TYPE[item.fault_type] : '-',
              faultLevel: item.fault_level ? FAULT_LEVEL[item.fault_level] : '-',
            };
          });
          this.pagination.total = res.count;
        })
        .finally(() => {
          this.tableLoad = false;
        });
    },
    getSelectData() {
      this.$api.getBaseApi('detectormaintenanceplan').then((res) => {
        if (!res || !res.results) return;
        this.maintPlans = res.results.map((item) => ({ label: item.name, value: item.id }));
      });
    },
  },
};
</script>
