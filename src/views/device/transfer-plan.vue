<template>
  <a-row class="sg-row" :gutter="10">
    <a-col class="sg-col" :span="14">
      <header class="calendar-header">转运计划日历</header>
      <footer class="calendar-footer">
        <span class="done">蓝色：已执行</span>
        <span class="undo">红色：未执行</span>
        <span class="doing">绿色：正在执行</span>
      </footer>
      <a-calendar
        class="calendar"
        v-model="currentDate"
        @select="onCalendarSelect"
        @change="onCalendarChange"
      >
        <!-- <template #headerRender></template> -->
        <template v-slot:dateCellRender="date">
          <ul class="calendar-list">
            <li
              v-for="(item, index) in transferData[date.format('YYYY-MM-DD')]"
              :class="['calendar-item', `state${item.status}`]"
              :key="index"
            >
              {{ `${item.name}-${item.substation}${item.action}${item.robot}` }}
            </li>
          </ul>
        </template>
      </a-calendar>
    </a-col>
    <a-col class="sg-col" :span="10">
      <a-table
        class="table"
        table-layout="auto"
        row-key="id"
        :loading="tableLoad"
        :columns="tableColumns"
        :data-source="tableData"
        :pagination="pagination"
        :scroll="{ x: 1000 }"
        :bordered="true"
        @change="onTableChange"
      >
        <template #title>
          <div class="table-query">
            <div class="table-query-row">
              <span class="table-query-item">
                <span>转运计划:</span>
                <a-input
                  v-model="transferPlan"
                  placeholder="请输入转运计划"
                  :max-length="20"
                  allow-clear
                />
              </span>
              <span class="table-query-item">
                <span>转运机器人:</span>
                <a-input
                  v-model="transferRobot"
                  placeholder="请输入转运机器人"
                  :max-length="20"
                  allow-clear
                />
              </span>
            </div>
            <div class="table-query-row">
              <span class="table-query-item">
                <span>转运时间:</span>
                <a-range-picker
                  class="datetime"
                  v-model="timeRange"
                  :placeholder="['开始时间', '结束时间']"
                  separator="至"
                  show-time
                ></a-range-picker>
              </span>
            </div>
          </div>
          <div class="table-action">
            <a-button size="small" @click="handleQueryData">查询</a-button>
            <a-button size="small" @click="handleQueryReset">重置</a-button>
            <a-button size="small" @click="handleTransferPlan(null, 'create')">新增</a-button>
          </div>
        </template>
        <template v-slot:operation="data, row">
          <div class="operation">
            <a-popconfirm
              v-if="row.status !== 1"
              title="确定完成该转运计划?"
              @confirm="handleTransferPlan(row, 'finish')"
            >
              <a-button size="small">完成</a-button>
            </a-popconfirm>
            <template v-if="row.status === 0">
              <a-button size="small" @click="handleTransferPlan(row, 'update')">编辑</a-button>
              <a-popconfirm
                title="确定删除该转运计划?"
                @confirm="handleTransferPlan(row, 'delete')"
              >
                <a-button size="small">删除</a-button>
              </a-popconfirm>
            </template>
            <a-button v-else size="small" @click="handleTransferPlan(row, 'check')">查看</a-button>
          </div>
        </template>
      </a-table>
    </a-col>

    <a-modal
      v-model="transferModal"
      dialog-class="sg-modal"
      :title="transferModalTitle"
      centered
      @ok="onModalAction('confirm')"
    >
      <a-form-model
        class="sg-form"
        ref="transferForm"
        :model="transferForm"
        :rules="transferRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-model-item prop="substation_out_id" label="转出变电站" required>
          <a-select
            v-model="transferForm.substation_out_id"
            :options="transferOutStations"
            placeholder="请选择转出变电站"
            @select="onTransferOutChange"
          ></a-select>
        </a-form-model-item>
        <a-form-model-item prop="substation_in_id" label="转入变电站" required>
          <a-select
            v-model="transferForm.substation_in_id"
            :options="transferInStations"
            placeholder="请选择转入变电站"
            @select="onTransferInChange"
          ></a-select>
        </a-form-model-item>
        <a-form-model-item prop="name" label="转运计划" required>
          <a-input
            v-model="transferForm.name"
            placeholder="请输入转运计划"
            :max-length="20"
            allow-clear
          />
        </a-form-model-item>
        <a-form-model-item prop="detector_id" label="转运机器人" required>
          <a-select
            v-model="transferForm.detector_id"
            :options="transferRobots"
            placeholder="请选择转运机器人"
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
      </a-form-model>

      <template v-if="transferAction !== 'check'" v-slot:footer>
        <a-button type="warning" @click="onModalAction('reset')">重置</a-button>
        <a-button type="primary" @click="onModalAction(transferAction)">提交</a-button>
      </template>
    </a-modal>
  </a-row>
</template>

<script>
import _ from 'lodash';
import { ROBOT_TRANSPORT_STATUS } from '@/enum';

export default {
  name: 'TransferPlan',
  computed: {
    transferStates() {
      return Object.entries(ROBOT_TRANSPORT_STATUS).map(([key, val]) => ({
        text: val,
        label: val,
        value: +key,
      }));
    },
    transferRules() {
      return {
        name: [{ required: true, message: '请输入转运计划' }],
        detector_id: [{ required: true, message: '请选择转运机器人' }],
        substation_in_id: [{ required: true, message: '请选择转入变电站' }],
        substation_out_id: [{ required: true, message: '请选择转出变电站' }],
        timeRange: [{ required: true, type: 'array', message: '请选择维护时间' }],
      };
    },
    tableColumns() {
      return [
        { title: '序号', dataIndex: 'index', align: 'center', width: 50 },
        { title: '转运计划', dataIndex: 'name', align: 'center', width: 150 },
        { title: '转运机器人', dataIndex: 'detector.name', align: 'center', width: 150 },
        { title: '开始时间', dataIndex: 'start_time', align: 'center', width: 150 },
        { title: '结束时间', dataIndex: 'end_time', align: 'center', width: 150 },
        {
          title: '执行状态',
          dataIndex: 'state',
          align: 'center ',
          width: 100,
          filterMultiple: false,
          filters: this.transferStates,
        },
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
      timeRange: [this.$moment().startOf('y'), this.$moment()],
      currentDate: this.$moment(),
      transferDate: this.$moment(),
      transferData: {},
      transferPlan: '',
      transferRobot: '',
      transferState: undefined,
      transferRobots: [],
      transferInStations: [],
      transferOutStations: [],
      transferAction: '',
      transferModal: false,
      transferModalTitle: '',
      transferForm: {
        name: '',
        detector_id: undefined,
        substation_in_id: undefined,
        substation_out_id: undefined,
        timeRange: [],
      },
      tableLoad: false,
      tableData: [{ id: 1 }],
      pagination: {
        total: 0,
        current: 1,
        pageSize: 10,
        size: 'small',
      },
    };
  },
  created() {
    this.getCalendarData();
    this.getSelectData();
    this.getTableData();
  },
  methods: {
    handleQueryData() {
      this.getTableData();
    },
    handleQueryReset() {
      this.transferPlan = '';
      this.transferRobot = '';
      this.transferState = undefined;
      this.timeRange = [this.$moment().startOf('y'), this.$moment()];
      this.pagination.current = 1;
      this.getTableData();
    },
    handleTransferPlan(row, action) {
      this.transferAction = action;
      switch (action) {
        case 'check':
          this.transferForm = {
            ...row,
            detector_id: row.detector && row.detector.id,
            substation_in_id: row.substation_in.id,
            substation_out_id: row.substation_out.id,
            timeRange: [
              row.start_time && this.$moment(row.start_time),
              row.end_time && this.$moment(row.end_time),
            ],
          };
          this.transferModalTitle = '转运计划详情';
          this.transferModal = true;
          break;
        case 'create':
          this.transferForm = {
            name: '',
            detector_id: undefined,
            substation_in_id: undefined,
            substation_out_id: undefined,
            timeRange: [],
          };
          this.transferModalTitle = '转运计划新增';
          this.transferModal = true;
          break;
        case 'update':
          this.transferForm = {
            ...row,
            detector_id: row.detector && row.detector.id,
            substation_in_id: row.substation_in.id,
            substation_out_id: row.substation_out.id,
            timeRange: [
              row.start_time && this.$moment(row.start_time),
              row.end_time && this.$moment(row.end_time),
            ],
          };
          this.transferModalTitle = '转运计划编辑';
          this.transferModal = true;
          break;
        case 'delete':
          this.$api.postBaseApi('robottransportplan_delete', { data: [row.id] }).then(() => {
            this.$message.success('转运计划删除成功！');
            this.getTableData();
          });
          break;
        case 'finish':
          this.$api
            .postBaseApi('robottransportplan_update', { data: [{ id: row.id, status: 1 }] })
            .then(() => {
              this.$message.success('转运计划已完成！');
              row.state = '已完成';
              row.status = 1;
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
              const {
                id,
                name,
                status,
                detector_id,
                substation_in_id,
                substation_out_id,
                timeRange,
              } = this.transferForm;
              const [timeStart, timeEnd] = timeRange.map((date) =>
                this.$moment(date).format('YYYY-MM-DD HH:mm:ss')
              );
              this.$api
                .postBaseApi(`robottransportplan_${action}`, {
                  data: [
                    {
                      id,
                      name,
                      status,
                      detector_id,
                      substation_in_id,
                      substation_out_id,
                      start_time: timeStart,
                      end_time: timeEnd,
                    },
                  ],
                })
                .then(() => {
                  this.$message.success('转运计划提交成功！');
                  this.$refs.transferForm.resetFields();
                  this.transferModal = false;
                  this.getTableData();
                });
            } else {
              return false;
            }
          });
          break;
        case 'confirm':
          this.transferModal = false;
          break;
        default:
          break;
      }
    },
    onTableChange(pagination, filters) {
      // console.log(pagination, filters, sorter);
      this.pagination.current = pagination.current;
      if (filters['state'] && filters['state'].length > 0) {
        this.transferState = filters['state'][0];
      } else {
        this.transferState = undefined;
      }
      this.getTableData();
    },
    onTransferInChange(val) {
      this.transferOutStations.forEach((item) => {
        if (item.value === val) {
          item.disabled = true;
        } else {
          item.disabled = false;
        }
      });
    },
    onTransferOutChange(val) {
      this.transferInStations.forEach((item) => {
        if (item.value === val) {
          item.disabled = true;
        } else {
          item.disabled = false;
        }
      });
      this.$api.getBaseApi('detector', { substation: val, dec_type__in: '1,4,5' }).then((res) => {
        if (!res || !res.results) return;
        this.transferRobots = res.results.map((item) => ({ label: item.name, value: item.id }));
      });
    },
    onCalendarSelect(moment) {
      const date = moment.format('YYYY-MM-DD');
      let tableData = this.transferData[date];
      if (tableData) {
        tableData = _.uniqBy(tableData, 'id');
        this.tableData = tableData.map((item, index) => ({
          ...item,
          index: ++index,
          state: ROBOT_TRANSPORT_STATUS[item.status] || '-',
        }));
        // console.log(this.tableData);
      }
    },
    onCalendarChange(moment) {
      if (
        this.transferDate.year() !== moment.year() ||
        this.transferDate.month() !== moment.month()
      ) {
        this.transferDate = moment;
        this.getCalendarData(moment);
      }
    },
    getCalendarData(moment = this.$moment()) {
      const timeStart = moment.startOf('M').format('YYYY-MM-DD HH:mm:ss');
      const timeEnd = moment.endOf('M').format('YYYY-MM-DD HH:mm:ss');
      this.$api
        .getBaseApi('robottransportplan_depth', {
          start_time__gte: timeStart,
          end_time__lte: timeEnd,
        })
        .then((res) => {
          if (!res || !res.count) return;
          const { count, results } = res;
          let transferMap = {};
          for (let i = 0; i < count; i++) {
            const item = results[i];
            const timeEnd = this.$moment(item.end_time).format('YYYY-MM-DD');
            const timeStart = this.$moment(item.start_time).format('YYYY-MM-DD');
            const transferInItem = {
              ...item,
              action: '转入',
              robot: item.detector.name,
              substation: item.substation_in.name,
            };
            const transforOutItem = {
              ...item,
              action: '转出',
              robot: item.detector.name,
              substation: item.substation_out.name,
            };
            if (!transferMap[timeEnd]) {
              transferMap[timeEnd] = [transferInItem];
            } else {
              transferMap[timeEnd].push(transferInItem);
            }
            if (!transferMap[timeStart]) {
              transferMap[timeStart] = [transforOutItem];
            } else {
              transferMap[timeStart].push(transforOutItem);
            }
          }
          this.transferData = transferMap;
        });
    },
    getTableData() {
      this.tableLoad = true;
      const [timeStart, timeEnd] = this.timeRange.map((date) =>
        this.$moment(date).format('YYYY-MM-DD HH:mm:ss')
      );
      this.$api
        .getBaseApi('robottransportplan_depth', {
          page_num: this.pagination.current,
          page_size: this.pagination.pageSize,
          status: this.transferState,
          name__icontains: this.transferPlan,
          detector__name__icontains: this.transferRobot,
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
              state: ROBOT_TRANSPORT_STATUS[item.status] || '-',
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
        const stations = res.results.map((item) => ({
          label: item.name,
          value: item.id,
          disabled: false,
        }));
        this.transferInStations = this.transferOutStations = [...stations];
        // this.transferOutStations = [...stations];
      });
      this.$api.getBaseApi('detector', { dec_type__in: '1,4,5' }).then((res) => {
        if (!res || !res.results) return;
        this.transferRobots = res.results.map((item) => ({ label: item.name, value: item.id }));
      });
    },
  },
};
</script>

<style lang="less" scoped>
.calendar {
  width: 100%;
  height: 100%;
  // background-color: #fff;

  &-list {
    height: 100%;
    overflow-y: auto;
  }
  &-item {
    font-size: 12px;

    &.state0 {
      color: @error-color;
    }
    &.state1 {
      color: @link-color;
    }
    &.state2 {
      color: @success-color;
    }
    + .calendar-item {
      border-top: 1px solid currentColor;
    }
  }
  &-header {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 5vh;
    line-height: 5vh;
    color: #fff;
    font-size: 20px;
    font-weight: bold;
    text-align: center;
  }
  &-footer {
    position: absolute;
    left: 0;
    bottom: 0;
    height: 4vh;
    line-height: 4vh;
    padding-left: 10px;

    span + span {
      margin-left: 10px;
    }
    .done {
      color: @link-color;
    }
    .undo {
      color: @error-color;
    }
    .doing {
      color: @success-color;
    }
  }
  /deep/ .ant-fullcalendar {
    &-header {
      width: 100%;
      height: 5vh;
      padding: 0 15px;
      line-height: 5vh;
      background-color: @theme-color1;
    }
    &-table {
      height: 80vh;
      background-color: #fff;
    }
    &-cell {
      border: @border-default;
    }
    &-date {
      border-top: 0;
    }
    &-calendar-body {
      padding: 0;
    }
    &-column-header {
      padding: 5px 10px;
      text-align: center;
      border: @border-default;
      background-color: @theme-color2;
    }
  }
}

.table {
  width: 100%;
  height: 100%;
  background-color: #fff;

  &-query {
    flex: auto;

    &-row + .table-query-row {
      margin-top: 5px;
    }
    &-item {
      display: inline-flex;
      align-items: center;
      white-space: nowrap;

      > span:first-child {
        margin: 0 10px;
      }
      > .ant-input {
        width: 200px;
      }
      > .ant-calendar-picker {
        width: 500px !important;
      }
    }
  }
  &-action {
    display: inline-flex;
    align-items: center;
    flex-direction: column;

    .ant-btn {
      border-color: @theme-color3;
      background-color: @theme-color3;

      + .ant-btn {
        margin-top: 5px;
      }
    }
  }
  /deep/ .ant-table {
    width: 100%;

    th {
      height: 5vh;
      padding: 0 10px;
      font-weight: bold;
      background-color: @theme-color6;
    }
    td {
      height: 7vh;
      padding: 0 10px;
    }
    &-title {
      display: flex;
      align-items: center;
      width: 100%;
      height: 10vh;
      padding: 0 15px;
      background-color: #fff;
    }
    &-content {
      width: 100%;
      height: 75vh;
    }
    &-placeholder {
      border: none;
    }
    &-pagination {
      display: flex;
      align-items: center;
      height: 4vh;
      margin: 0 10px;
    }
    .operation {
      display: flex;
      align-items: center;
      justify-content: center;

      button + button {
        margin-left: 5px;
      }
    }
  }
}
</style>
