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
          <span>维护设备:</span>
          <a-input
            v-model="maintDevice"
            placeholder="请输入维护设备"
            :max-length="20"
            allow-clear
          />
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
        <a-button @click="handleQueryData">查询</a-button>
        <a-button @click="handleQueryReset">重置</a-button>
        <a-button @click="handleMaintPlan(null, 'create')">新增</a-button>
      </div>

      <a-table
        class="sg-table"
        table-layout="auto"
        row-key="id"
        :loading="tableLoad"
        :columns="tableColumns"
        :data-source="tableData"
        :pagination="pagination"
        bordered
        @change="onTableChange"
      >
        <template v-slot:operation="data, row">
          <div class="operation">
            <a-button size="small" @click="handleMaintPlan(row, 'update')">编辑</a-button>
            <a-popconfirm title="确定删除该维护计划?" @confirm="handleMaintPlan(row, 'delete')">
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
        <a-form-model-item prop="substation_id" label="变电站" required>
          <a-select
            v-model="maintForm.substation_id"
            :options="maintStations"
            placeholder="请选择变电站"
          ></a-select>
        </a-form-model-item>
        <a-form-model-item prop="detector_id" label="维护设备" required>
          <a-select
            v-model="maintForm.detector_id"
            :options="maintDevices"
            placeholder="请选择维护设备"
          ></a-select>
        </a-form-model-item>
        <a-form-model-item prop="name" label="维护计划" required>
          <a-input
            v-model="maintForm.name"
            placeholder="请输入维护计划"
            :max-length="20"
            allow-clear
          />
        </a-form-model-item>
        <a-form-model-item prop="company" label="维护单位" required>
          <a-input
            v-model="maintForm.company"
            placeholder="请输入维护单位"
            :max-length="20"
            allow-clear
          />
        </a-form-model-item>
        <a-form-model-item prop="timeRange" label="维护时间" required>
          <a-range-picker
            v-model="maintForm.timeRange"
            :placeholder="['开始时间', '结束时间']"
            style="width: 100%"
            separator="至"
            show-time
          ></a-range-picker>
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

export default {
  name: 'MaintainPlan',
  components: {
    SgTree,
  },
  computed: {
    maintRules() {
      return {
        substation_id: [{ required: true, message: '请选择变电站' }],
        detector_id: [{ required: true, message: '请选择维护设备' }],
        name: [{ required: true, message: '请输入维护计划' }],
        company: [{ required: true, message: '请输入维护单位' }],
        timeRange: [{ required: true, type: 'array', message: '请选择维护时间' }],
      };
    },
    tableColumns() {
      return [
        { title: '序号', dataIndex: 'index', align: 'center', width: 50 },
        { title: '变电站', dataIndex: 'substation.name', align: 'center', width: 150 },
        { title: '维护设备', dataIndex: 'detector.name', align: 'center' },
        { title: '维护计划', dataIndex: 'name', align: 'center' },
        { title: '维护单位', dataIndex: 'company', align: 'center' },
        { title: '开始时间', dataIndex: 'start_time', align: 'center' },
        { title: '结束时间', dataIndex: 'end_time', align: 'center' },
        { title: '操作', align: 'center', width: 200, scopedSlots: { customRender: 'operation' } },
      ];
    },
  },
  data() {
    return {
      stationId: '',
      stationName: '请选择站点',
      timeRange: [this.$moment().startOf('y'), this.$moment()],
      maintDevice: '',
      maintCompany: '',
      maintDevices: [],
      maintStations: [],
      maintAction: '',
      maintModal: false,
      maintModalTitle: '',
      maintForm: {
        substation_id: undefined,
        detector_id: undefined,
        name: '',
        company: '',
        timeRange: [],
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
    this.getSelectData();
    this.getTableData();
  },
  methods: {
    handleQueryData() {
      this.getTableData();
    },
    handleQueryReset() {
      this.stationId = '';
      this.maintDevice = '';
      this.maintCompany = '';
      this.timeRange = [this.$moment().startOf('y'), this.$moment()];
      this.pagination.current = 1;
      this.getTableData();
    },
    handleMaintPlan(row, action) {
      this.maintAction = action;
      switch (action) {
        case 'create':
          this.maintForm = {
            name: '',
            company: '',
            detector_id: undefined,
            substation_id: undefined,
            timeRange: [],
          };
          this.maintModalTitle = '维护计划新增';
          this.maintModal = true;
          break;
        case 'update':
          this.maintForm = {
            ...row,
            detector_id: row.detector.id,
            substation_id: row.substation.id,
            timeRange: [
              row.start_time && this.$moment(row.start_time),
              row.end_time && this.$moment(row.end_time),
            ],
          };
          this.maintModalTitle = '维护计划编辑';
          this.maintModal = true;
          break;
        case 'delete':
          this.$api.postBaseApi('detectormaintenanceplan_delete', { data: [row.id] }).then(() => {
            this.getTableData();
            this.$message.success('维护计划删除成功！');
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
              const { id, name, company, detector_id, substation_id, timeRange } = this.maintForm;
              const [timeStart, timeEnd] = timeRange.map((date) =>
                this.$moment(date).format('YYYY-MM-DD HH:mm:ss')
              );
              this.$api
                .postBaseApi(`detectormaintenanceplan_${action}`, {
                  data: [
                    {
                      id,
                      name,
                      company,
                      detector_id,
                      substation_id,
                      start_time: timeStart,
                      end_time: timeEnd,
                    },
                  ],
                })
                .then(() => {
                  this.$message.success('维护计划提交成功！');
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
    onTableChange(pagination) {
      // console.log(pagination, filters, sorter);
      this.pagination.current = pagination.current;
      this.getTableData();
    },
    getTableData() {
      this.tableLoad = true;
      const [timeStart, timeEnd] = this.timeRange.map((date) =>
        this.$moment(date).format('YYYY-MM-DD HH:mm:ss')
      );
      this.$api
        .getBaseApi('detectormaintenanceplan_depth', {
          page_num: this.pagination.current,
          page_size: this.pagination.pageSize,
          substation: this.stationId,
          company__icontains: this.maintCompany,
          detector__name__icontains: this.maintDevice,
          start_time__gte: timeStart,
          end_time__lte: timeEnd,
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
            };
          });
          this.pagination.total = res.count;
        })
        .finally(() => {
          this.tableLoad = false;
        });
    },
    getSelectData() {
      this.$api.getBaseApi('substation').then((res) => {
        if (!res || !res.results) return;
        this.maintStations = res.results.map((item) => ({ label: item.name, value: item.id }));
      });
      this.$api.getBaseApi('detector').then((res) => {
        if (!res || !res.results) return;
        this.maintDevices = res.results.map((item) => ({ label: item.name, value: item.id }));
      });
    },
  },
};
</script>
