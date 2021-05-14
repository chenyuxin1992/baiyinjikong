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
          <span>任务名称:</span>
          <a-input v-model="taskName" placeholder="请输入任务名称" :max-length="20" allow-clear />
        </span>
        <!-- <span class="sg-query-item">
          <span>巡视结果:</span>
           <a-input v-model="taskResult" placeholder="请输入巡视结果" :max-length="20" allow-clear/>
        </span> -->
        <span class="sg-query-item">
          <span>任务时间:</span>
          <a-range-picker
            class="datetime"
            v-model="timeRange"
            :placeholder="['开始时间', '结束时间']"
            separator="至"
            show-time
          ></a-range-picker>
        </span>

        <a-button @click="handleQueryData">查询</a-button>
        <a-button @click="handleExportData">导出</a-button>
      </div>

      <a-table
        class="sg-table"
        table-layout="auto"
        row-key="task_id"
        :loading="tableLoad"
        :columns="tableColumns"
        :data-source="tableData"
        :pagination="pagination"
        :scroll="{ x: 2000 }"
        bordered
        @change="onTableChange"
      >
        <template v-slot:progress="data">
          <a-progress :percent="data" :show-info="false" />
        </template>
        <template v-slot:result="data">
          <div>总测点: {{ data.total }}</div>
          <span style="color: #52c41a; margin-left: 5px">正常: {{ data.normal }}</span>
          <span style="color: #f5222d; margin-left: 5px">告警: {{ data.alarm }}</span>
          <span style="color: #faad14; margin-left: 5px">失败: {{ data.error }}</span>
          <span style="color: #f5222d; margin-left: 5px">缺陷: {{ data.defect }}</span>
        </template>
        <template v-slot:status="data, row">
          <span :class="`sg-state__task-${row.status}`">{{ data }}</span>
        </template>
        <template v-slot:operation="data, row">
          <div class="operation">
            <a-button size="small" @click="handlePatrolTask(row, 'check')">查看</a-button>
            <a-popconfirm
              v-if="row.status === 0 || row.status === 2 || row.status === 3"
              title="确定终止该巡视任务?"
              @confirm="handlePatrolTask(row, 'stop')"
            >
              <a-button size="small">终止</a-button>
            </a-popconfirm>
            <a-popconfirm
              v-if="row.status === 2"
              title="确定暂停该巡视任务?"
              @confirm="handlePatrolTask(row, 'pause')"
            >
              <a-button size="small">暂停</a-button>
            </a-popconfirm>
            <a-popconfirm
              v-else-if="row.status === 0"
              title="确定启动该巡视任务?"
              @confirm="handlePatrolTask(row, 'start')"
            >
              <a-button size="small">启动</a-button>
            </a-popconfirm>
            <a-popconfirm
              v-else-if="row.status === 3"
              title="确定继续该巡视任务?"
              @confirm="handlePatrolTask(row, 'continue')"
            >
              <a-button size="small">继续</a-button>
            </a-popconfirm>
            <a-popconfirm
              v-if="row.status === 4 || row.status === 1"
              title="确定导出该巡视任务报告?"
              @confirm="handlePatrolTask(row, 'export')"
            >
              <a-button size="small">导出</a-button>
            </a-popconfirm>
          </div>
        </template>
      </a-table>
    </a-col>

    <a-modal
      v-model="taskModal"
      title="巡视任务详情"
      dialog-class="sg-modal"
      :footer="false"
      centered
    >
      <div>巡视任务详情内容</div>
    </a-modal>
  </a-row>
</template>

<script>
import SgTree from '@/components/Tree/Antd';
import { ControlCMD, DATA_SOURCE, TASK_PATROL_TYPE, TASK_STATUS } from '@/enum';
import FileSaver from 'file-saver';

export default {
  name: 'TaskManage',
  components: {
    SgTree,
  },
  computed: {
    taskTypes() {
      return Object.entries(TASK_PATROL_TYPE).map(([key, val]) => ({
        text: val,
        label: val,
        value: +key,
      }));
    },
    taskStates() {
      return Object.entries(TASK_STATUS).map(([key, val]) => ({
        text: val,
        label: val,
        value: +key,
      }));
    },
    tableColumns() {
      return [
        { title: '序号', dataIndex: 'index', align: 'center', width: 50 },
        { title: '变电站', dataIndex: 'substation_name', align: 'center', width: 130 },
        { title: '任务名称', dataIndex: 'plantask_name', align: 'center', width: 150 },
        {
          title: '任务状态',
          dataIndex: 'taskState',
          align: 'center',
          width: 100,
          filterMultiple: false,
          filters: this.taskStates,
          scopedSlots: { customRender: 'status' },
        },
        {
          title: '巡视类型',
          dataIndex: 'taskType',
          align: 'center',
          width: 100,
          filterMultiple: false,
          filters: this.taskTypes,
        },
        {
          title: '巡视进度',
          dataIndex: 'progress',
          align: 'center',
          width: 120,
          scopedSlots: { customRender: 'progress' },
        },
        {
          title: '巡视结果',
          dataIndex: 'result',
          align: 'center',
          width: 200,
          scopedSlots: { customRender: 'result' },
        },
        { title: '计划开始时间', dataIndex: 'plan_start_time', align: 'center', width: 150 },
        { title: '巡视开始时间', dataIndex: 'start_time', align: 'center', width: 150 },
        { title: '巡视结束时间', dataIndex: 'end_time', align: 'center', width: 150 },
        { title: '数据来源', dataIndex: 'dataSource', align: 'center', width: 150 },
        {
          title: '操作',
          fixed: 'right',
          align: 'center',
          width: 100,
          scopedSlots: { customRender: 'operation' },
        },
      ];
    },
  },
  data() {
    return {
      stationId: '',
      stationName: '请选择站点',
      timeRange: [this.$moment().startOf('y'), this.$moment()],
      taskName: '',
      taskResult: '',
      taskType: undefined,
      taskState: undefined,
      taskModal: false,
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
    console.log(params);
    this.stationId = params.substation_id;
    this.taskState = params.state;
    this.taskType = params.type;

    this.getTableData();
  },
  methods: {
    handleQueryData() {
      this.getTableData();
    },
    handleExportData() {
      this.tableLoad = true;
      let params = [];
      this.stationId && params.push({ match: { substation_id: this.stationId } });
      this.taskName && params.push({ match: { plantask_name: this.taskName } });
      this.taskType && params.push({ match: { type: this.taskType } });
      this.taskState && params.push({ match: { status: this.taskState } });
      const [timeStart, timeEnd] = this.timeRange.map((date) =>
        this.$moment(date).format('YYYY-MM-DD HH:mm:ss')
      );
      this.$api
        .postHistoryApi('historytask', '_search', {
          size: 10000,
          query: {
            bool: {
              must: params,
              filter: [{ range: { start_time: { gte: timeStart, lte: timeEnd } } }],
            },
          },
          _source: { excludes: ['image'] },
          track_total_hits: true,
        })
        .then(async (res) => {
          if (!res) return;
          let tableData = [];
          const header = this.tableColumns.map((item) => item.title);
          const keys = this.tableColumns.map((item) => item.dataIndex).filter(Boolean);
          for (let i = 0, len = res.hits.hits.length; i < len; i++) {
            const { _id, _source } = res.hits.hits[i];
            const dataItem = {
              ..._source,
              id: _id,
              index: i + 1,
              progress: _source.task_progress || 0,
              taskType: TASK_PATROL_TYPE[_source.type] || '-',
              taskState: TASK_STATUS[_source.status] || '-',
              dataSource: DATA_SOURCE[_source.source] || '-',
              result: { total: _source.total, done: 0, normal: 0, alarm: 0, error: 0, defect: 0 },
            };
            await this.$api
              .postHistoryApi('api', 'task_count', { task_id: _source.task_id })
              .then((res) => {
                if (!res) return;
                const { normal, alarm, error, defect } = res;
                dataItem.result = `总测点:${_source.total} 正常:${normal} 告警:${alarm} 失败:${error} 缺陷:${defect}`;
              });
            tableData.push(keys.map((key) => dataItem[key] || '-'));
          }
          import('@/utils/export').then((excel) => {
            excel.export_json_to_excel({
              header,
              data: tableData,
              autoWidth: true,
              bookType: 'xlsx',
              filename: '巡视任务数据',
            });
            this.tableLoad = false;
          });
        })
        .finally(() => {
          this.tableLoad = false;
        });
    },
    handlePatrolTask(row, action) {
      switch (action) {
        case 'start':
          this.$api
            .postControlApi({
              action: ControlCMD.TASK_CONTROL,
              command: 1,
              task_id: row.plantask_id,
              syn: `${row.plantask_name}任务启动指令下发`,
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
              task_id: row.plantask_id,
              syn: `${row.plantask_name}任务暂停指令下发`,
            })
            .then(() => {
              this.$message.success('任务暂停指令下发成功！');
            });
          break;
        case 'stop':
          this.$api
            .postControlApi({
              action: ControlCMD.TASK_CONTROL,
              command: 4,
              task_id: row.plantask_id,
              syn: `${row.plantask_name}任务停止指令下发`,
            })
            .then(() => {
              this.$message.success('任务停止指令下发成功！');
            });
          break;
        case 'continue':
          this.$api
            .postControlApi({
              action: ControlCMD.TASK_CONTROL,
              command: 3,
              task_id: row.plantask_id,
              syn: `${row.plantask_name}任务继续指令下发`,
            })
            .then(() => {
              this.$message.success('任务继续指令下发成功！');
            });
          break;
        case 'check':
          if (row.task_id) {
            this.$store.commit('SET_TASKDATA', row);
            this.$router.push({ path: '/patrol/task-detail' });
          } else {
            this.$message.warn('无法查看该巡视任务！');
          }
          break;
        case 'export':
          this.$api.postHistoryApi('api', 'export_doc', { task_id: row.task_id }).then((res) => {
            console.log(res);
            // this.$message.success(
            //   '任务报表导出成功！' + '报表保存路径/data/html/shares/report/' + res
            // );
            // console.log(res);
            // let url = `https://${location.hostname}:8443/html/shares/report/` + res;
            // console.log(url);
            FileSaver.saveAs(
              `https://${location.hostname}:8443/html/shares/report/${res}`,
              res
            );
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
      if (filters['taskType'] && filters['taskType'].length > 0) {
        this.taskType = filters['taskType'][0];
      } else {
        this.taskType = undefined;
      }
      if (filters['taskState'] && filters['taskState'].length > 0) {
        this.taskState = filters['taskState'][0];
      } else {
        this.taskState = undefined;
      }
      this.getTableData();
    },
    getTableData() {
      this.tableLoad = true;
      let params = [];
      this.stationId && params.push({ match: { substation_id: this.stationId } });
      this.taskName && params.push({ match: { plantask_name: this.taskName } });
      this.taskType && params.push({ match: { type: this.taskType } });
      this.taskState && params.push({ match: { status: this.taskState } });
      const [timeStart, timeEnd] = this.timeRange.map((date) =>
        this.$moment(date).format('YYYY-MM-DD HH:mm:ss')
      );
      this.$api
        .postHistoryApi('historytask', '_search', {
          from: this.pagination.pageSize * (this.pagination.current - 1),
          size: this.pagination.pageSize,
          query: {
            bool: {
              must: params,
              filter: [{ range: { start_time: { gte: timeStart, lte: timeEnd } } }],
            },
          },
          sort: [{ start_time: { order: 'desc' } }],
          track_total_hits: true,
        })
        .then((res) => {
          if (!res || !res.hits.total.value) {
            this.tableData = [];
            this.pagination.total = 0;
            return;
          }
          let tableData = [];
          for (let i = 0, len = res.hits.hits.length; i < len; i++) {
            const { _id, _source } = res.hits.hits[i];
            const tableIndex = this.pagination.pageSize * (this.pagination.current - 1) + i + 1;
            const dataItem = {
              ..._source,
              id: _id,
              index: tableIndex,
              progress: _source.task_progress || 0,
              taskType: TASK_PATROL_TYPE[_source.type] || '-',
              taskState: TASK_STATUS[_source.status] || '-',
              dataSource: DATA_SOURCE[_source.source] || '-',
              result: { total: _source.total, done: 0, normal: 0, alarm: 0, error: 0, defect: 0 },
            };
            console.log('progress1',dataItem.progress);
            this.$api
              .postHistoryApi('historyitems', '_search', {
                size: 0,
                query: { bool: { must: [{ match: { task_id: _source.task_id } }] } },
                _source: { excludes: ['image'] },
                track_total_hits: true,
              })
              .then((res1) => {
                if (!res1) return;
                dataItem.result.done = res1.hits.total.value;
                dataItem.progress = _source.total
                  ? Math.round((dataItem.result.done / _source.total) * 100)
                  : 0;
                console.log('progress2',dataItem.progress);
              });
            this.$api
              .postHistoryApi('api', 'task_count', { task_id: _source.task_id })
              .then((res2) => {
                if (!res2) return;
                dataItem.result = { ...dataItem.result, ...res2 };
              });
            tableData.push(dataItem);
          }
          this.tableData = tableData;
          this.pagination.total = res.hits.total.value;
        })
        .finally(() => {
          this.tableLoad = false;
          this.taskType = '';
          this.taskState = '';
        });
    },
    getSelectData() {},
  },
};
</script>
