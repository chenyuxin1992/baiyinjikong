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
          <span>转运人:</span>
          <a-input
            v-model="transferStaff"
            placeholder="请输入转运人名称"
            :max-length="20"
            allow-clear
          />
        </span>
        <span class="sg-query-item">
          <span>转运状况:</span>
          <a-input
            v-model="transferDetail"
            placeholder="请输入转运状况描述"
            :max-length="20"
            allow-clear
          />
        </span>
        <span class="sg-query-item">
          <span>转运时间:</span>
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
            <span>转运计划:</span>
            <a-select
              v-model="transferPlan"
              :options="transferPlans"
              placeholder="请选择转运计划"
              allow-clear
            ></a-select>
          </span>
          <span class="sg-query-item">
            <span>转运机器人:</span>
            <a-select
              v-model="transferRobot"
              :options="transferRobots"
              placeholder="请选择转运机器人"
              allow-clear
            ></a-select>
          </span>
          <span class="sg-query-item">
            <span>转入变电站:</span>
            <a-select
              v-model="transferStation"
              :options="transferStations"
              placeholder="请选择转入变电站"
              allow-clear
            ></a-select>
          </span>
        </div>

        <a-button @click="handleQueryData">查询</a-button>
        <a-button @click="handleQueryReset">重置</a-button>
        <a-button @click="handleTransferRecord(null, 'create')">新增</a-button>
        <a-button @click="handleQueryExport">导出</a-button>
      </div>

      <a-table
        class="sg-table"
        table-layout="auto"
        row-key="id"
        :loading="tableLoad"
        :columns="tableColumns"
        :data-source="tableData"
        :pagination="pagination"
        :scroll="{ x: 1800 }"
        bordered
        @change="onTableChange"
      >
        <template v-slot:operation="data, row">
          <div class="operation">
            <a-button size="small" @click="handleTransferRecord(row, 'update')">编辑</a-button>
            <a-popconfirm
              v-if="row.status === 0"
              title="确定删除该转运记录?"
              @confirm="handleTransferRecord(row, 'delete')"
            >
              <a-button size="small">删除</a-button>
            </a-popconfirm>
          </div>
        </template>
      </a-table>
    </a-col>

    <a-modal v-model="transferModal" :title="transferModalTitle" dialog-class="sg-modal" centered>
      <a-form-model
        class="sg-form"
        ref="transferForm"
        :model="transferForm"
        :rules="transferRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-model-item prop="robottransportplan_id" label="转运计划" required>
          <a-select
            v-model="transferForm.robottransportplan_id"
            :options="transferPlans"
            placeholder="请选择转运计划"
          ></a-select>
        </a-form-model-item>
        <a-form-model-item prop="timeRange" label="转运时间" required>
          <a-range-picker
            v-model="transferForm.timeRange"
            :placeholder="['开始时间', '结束时间']"
            style="width: 100%"
            separator="至"
            show-time
          ></a-range-picker>
        </a-form-model-item>
        <a-form-model-item prop="staff" label="转运人" required>
          <a-input
            v-model="transferForm.staff"
            placeholder="请输入转运人"
            :max-length="20"
            allow-clear
          />
        </a-form-model-item>
        <a-form-model-item prop="detail" label="状况描述" required>
          <a-input
            v-model="transferForm.detail"
            placeholder="请输入状况描述"
            :max-length="20"
            allow-clear
          />
        </a-form-model-item>
      </a-form-model>

      <template #footer>
        <a-button type="warning" @click="onModalAction('reset')">重置</a-button>
        <a-button type="primary" @click="onModalAction(transferAction)">提交</a-button>
      </template>
    </a-modal>
  </a-row>
</template>

<script>
import SgTree from '@/components/Tree/Antd';

export default {
  name: 'TransferRecord',
  components: {
    SgTree,
  },
  computed: {
    transferRules() {
      return {
        staff: [{ required: true, message: '请输入转运人姓名' }],
        detail: [{ required: true, message: '请输入转运状况描述' }],
        robottransportplan_id: [{ required: true, message: '请选择转运计划' }],
        timeRange: [{ required: true, type: 'array', message: '请选择维护时间' }],
      };
    },
    tableColumns() {
      return [
        { title: '序号', dataIndex: 'index', align: 'center', width: 50 },
        {
          title: '转运计划',
          dataIndex: 'transferPlan',
          align: 'center',
          width: 150,
          filterMultiple: false,
          filters: this.transferPlans,
        },
        {
          title: '转运机器人',
          dataIndex: 'transferRobot',
          align: 'center',
          width: 150,
          filterMultiple: false,
          filters: this.transferRobots,
        },
        {
          title: '转入变电站',
          dataIndex: 'transferInStation',
          align: 'center',
          width: 150,
          filterMultiple: false,
          filters: this.transferStations,
        },
        { title: '转出变电站', dataIndex: 'transferOutStation', align: 'center', width: 150 },
        { title: '状况描述', dataIndex: 'detail', align: 'center', width: 300 },
        { title: '转运人', dataIndex: 'staff', align: 'center', width: 150 },
        { title: '开始时间', dataIndex: 'start_time', align: 'center', width: 150 },
        { title: '结束时间', dataIndex: 'end_time', align: 'center', width: 150 },
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
  data() {
    return {
      isCollapsed: true,
      stationId: '',
      stationName: '请选择站点',
      timeRange: [this.$moment().startOf('y'), this.$moment()],
      transferStaff: '',
      transferDetail: '',
      transferPlan: undefined,
      transferPlans: [],
      transferRobot: undefined,
      transferRobots: [],
      transferRobotMap: {},
      transferStation: undefined,
      transferStations: [],
      transferStationMap: {},
      transferAction: '',
      transferModal: false,
      transferModalTitle: '',
      transferForm: { robottransportplan_id: undefined, staff: '', detail: '', timeRange: [] },
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
      this.pagination.current = 1;
      this.getTableData();
    },
    handleQueryReset() {
      this.stationId = '';
      this.transferDetail = '';
      this.transferStation = '';
      this.transferPlan = undefined;
      this.transferRobot = undefined;
      this.transferStaff = undefined;
      this.timeRange = [this.$moment().startOf('y'), this.$moment()];
      this.pagination.current = 1;
      this.getTableData();
    },
    handleQueryExport() {
      this.$api
        .getRootApi('csv', { table: 'robottransportrecord' })
        .then((res) => {
          let content = res;
          const url = window.URL.createObjectURL(new Blob([content]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'robottransportrecord.csv');
          document.body.appendChild(link);
          link.click();
        })
        .finally(() => {
          this.tableLoad = false;
        });
    },
    handleTransferRecord(row, action) {
      this.transferAction = action;
      switch (action) {
        case 'create':
          this.transferForm = {
            robottransportplan_id: undefined,
            staff: '',
            detail: '',
            timeRange: [],
          };
          this.transferModalTitle = '转运记录新增';
          this.transferModal = true;
          break;
        case 'update':
          this.transferForm = {
            ...row,
            robottransportplan_id: row.robottransportplan.id,
            timeRange: [
              row.start_time && this.$moment(row.start_time),
              row.end_time && this.$moment(row.end_time),
            ],
          };
          this.transferModalTitle = '转运记录编辑';
          this.transferModal = true;
          break;
        case 'delete':
          this.$api.postBaseApi('robottransportrecord_delete', { data: [row.id] }).then(() => {
            this.getTableData();
            this.$message.success('转运记录删除成功！');
          });
          break;
        default:
          break;
      }
    },
    onModalAction(action) {
      switch (action) {
        case 'reset':
          this.$refs.transferForm.resetFields();
          break;
        case 'create':
        case 'update':
          this.$refs.transferForm.validate((valid) => {
            if (valid) {
              const { id, staff, detail, robottransportplan_id, timeRange } = this.transferForm;
              const [timeStart, timeEnd] = timeRange.map((date) =>
                this.$moment(date).format('YYYY-MM-DD HH:mm:ss')
              );
              this.$api
                .postBaseApi(`robottransportrecord_${action}`, {
                  data: [
                    {
                      id,
                      staff,
                      detail,
                      robottransportplan_id,
                      start_time: timeStart,
                      end_time: timeEnd,
                    },
                  ],
                })
                .then(() => {
                  if (action === 'create') {
                    this.$api.postBaseApi('robottransportplan_update', {
                      data: [{ id: robottransportplan_id, status: 2 }],
                    });
                  }
                  this.$message.success('转运记录提交成功！');
                  this.$refs.transferForm.resetFields();
                  this.transferModal = false;
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
      if (filters['transferPlan'] && filters['transferPlan'].length > 0) {
        this.transferPlan = filters['transferPlan'][0];
      } else {
        this.transferPlan = undefined;
      }
      if (filters['transferRobot'] && filters['transferRobot'].length > 0) {
        this.transferRobot = filters['transferRobot'][0];
      } else {
        this.transferRobot = undefined;
      }
      if (filters['transferInStation'] && filters['transferInStation'].length > 0) {
        this.transferStation = filters['transferInStation'][0];
      } else {
        this.transferStation = undefined;
      }
      this.getTableData();
    },
    getTableData() {
      this.tableLoad = true;
      const [timeStart, timeEnd] = this.timeRange.map((date) =>
        this.$moment(date).format('YYYY-MM-DD HH:mm:ss')
      );
      this.$api
        .getBaseApi('robottransportrecord_depth', {
          page_num: this.pagination.current,
          page_size: this.pagination.pageSize,
          staff__icontains: this.transferStaff,
          detail__icontains: this.transferDetail,
          robottransportplan_id: this.transferPlan,
          robottransportplan__detector_id: this.transferRobot,
          robottransportplan__substation_in_id: this.transferStation,
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
              status: item.robottransportplan.status,
              transferPlan: item.robottransportplan.name,
              transferRobot: item.robottransportplan.detector.name || '-',
              transferInStation: item.robottransportplan.substation_in.name || '-',
              transferOutStation: item.robottransportplan.substation_out.name || '-',
            };
          });
          this.pagination.total = res.count;
        })
        .finally(() => {
          this.tableLoad = false;
        });
    },
    getSelectData() {
      this.$api.getBaseApi('robottransportplan').then((res) => {
        if (!res || !res.results) return;
        this.transferPlans = res.results.map((item) => ({
          text: item.name,
          label: item.name,
          value: item.id,
        }));
      });
      this.$api.getBaseApi('substation').then((res) => {
        if (!res || !res.results) return;
        this.transferStations = res.results.map((item) => ({
          text: item.name,
          label: item.name,
          value: item.id,
        }));
        this.transferStationMap = res.results.reduce(
          (acc, item) => ((acc[item.id] = item.name), acc),
          {}
        );
      });
      this.$api.getBaseApi('detector', { dec_type__in: '1,4,5' }).then((res) => {
        if (!res || !res.results) return;
        this.transferRobots = res.results.map((item) => ({
          text: item.name,
          label: item.name,
          value: item.id,
        }));
        this.transferRobotMap = res.results.reduce(
          (acc, item) => ((acc[item.id] = item.name), acc),
          {}
        );
      });
    },
  },
};
</script>
